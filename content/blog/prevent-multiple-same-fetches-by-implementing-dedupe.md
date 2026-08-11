+++
title = 'Prevent Multiple Same Fetches by Implementing Dedupe'
description = 'Collapsing identical in-flight network requests into a single shared promise to avoid duplicate fetches'
date = '2026-08-11'
draft = false
categories = ['article']
tags = ['frontend', 'performance', 'typescript', 'javascript']

[cover]
  image = 'images/blog/fetch-dedupe.png'
  alt = 'Fetch deduplication'
+++

Have you ever opened your browser's network tab and seen the same API request fired five times, one after another, all in the same second? You did not click anything five times. The requests came from five different components that all mounted at once and all needed the same data.

This is the classic *duplicate fetch* problem, and the fix is a small, well-tested technique called **request deduplication**. It collapses identical in-flight requests into a single shared promise, so the browser only ever sends one network call.

## The Problem: N Components, One Resource

Imagine a dashboard page. The header shows the current user, the sidebar shows their avatar, and the main panel shows their recent activity. Three separate components, and each one naively calls `GET /api/me` in its own `useEffect` in React or equivalent utility in other framework.

```tsx
// Each component does this independently
useEffect(() => {
  fetch('/api/me').then((res) => res.json()).then(setUser)
}, [])
```

Three mounts, three identical requests, three network round trips — for the exact same data. Now multiply that by every user with a slow connection, and you have wasted bandwidth, unnecessary load on your API server, and a higher chance of hitting rate limits.

This pattern shows up everywhere:

- A route mounts several widgets that all fetch a shared resource.
- A search page debounces input, but the debounce window overlaps and fires two identical queries.
- A component retries a failed request while another copy of itself was already retrying.

## What Deduplication Is (and Is Not)

**Deduplication** means: while a request with the same key is already *in flight*, any new caller gets the same promise instead of starting a second request.

```tsx
// Before: three callers -> three requests
fetchA()
fetchB()
fetchC()

// After: three callers -> one request, three of the same result
const p = dedupedFetch('/api/me')
const a = await p
const b = await p
const c = await p
```

It is important to distinguish deduplication from **caching**:

- **Caching** stores a *completed* response and reuses it for later requests. If a request fails, a cache might serve a stale value or nothing at all.
- **Deduplication** only merges requests that are *currently pending*. As soon as the request settles, the dedupe entry is removed, so every new call is a fresh request.

They are complementary. Dedupe saves you from concurrent duplicates; a cache saves you from repeat visits. You can even layer both: dedupe the in-flight window, then cache the result for a short TTL.

## Who Needs This

Any frontend codebase that calls `fetch` directly and shares data across components. If you are already using a query library like React Query, SWR, or Apollo, you get deduplication for free — but the moment you write raw `fetch` calls, or build your own API client, you are on your own.

A small dedupe wrapper is enough to cover:

- Vanilla JavaScript / TypeScript apps.
- React or Vue apps that manage data with `useState` instead of a query library.
- Any team that wraps `fetch` in a shared `api.ts` module.

## When to Dedupe

The golden rule: dedupe **idempotent, read-only requests**. In practice:

- **Same component mounting in multiple places** — e.g., a user card rendered in a list and in the sidebar.
- **Concurrent consumers** — several components on one page asking for the same entity.
- **Retry-on-error flows** — a failed request being retried while a sibling still holds the original in-flight promise.

## Where to Put the Logic

Never put dedupe logic inside individual components. Each component has its own lifecycle, so a `Map` declared in one component is invisible to the others — the exact problem you are trying to solve.

The dedupe map must live at a **single shared scope**, ideally module-level, so every call site talks to the same registry:

```text
components
  ├── Header.tsx      -> api.me()  ─┐
  ├── Sidebar.tsx     -> api.me()   ├── same module-level Map
  └── ActivityPanel   -> api.me()  ─┘
```

Wrap it inside your API client, so callers do not even know dedupe exists:

```ts
// api.ts
export const api = {
  me: () => dedupedFetch('/api/me').then((r) => r.json()),
  posts: () => dedupedFetch('/api/posts').then((r) => r.json()),
}
```

## Why It Matters

Deduplication is a cheap, high-leverage win:

- **Fewer network calls** — one request instead of five, straight off the wire.
- **Lower server load** — your backend stops doing the same work N times.
- **Rate-limit safety** — fewer requests means less chance of tripping limits or 429s.
- **Consistent results** — every caller resolves the same promise, so you cannot end up with two components holding different snapshots of the same resource (a classic source of "stale vs. fresh" bugs).

## How It Works: The Core Idea

The implementation is tiny. You need:

1. A **Map** that stores `key -> Promise<Response>`.
2. A **key function** that produces a stable string for a given request.
3. A **lifecycle**: add the promise when a request starts, delete it when it settles.

When a caller asks for `/api/me`, you compute the key. If the key is already in the map, the same fetches are already happening — return its promise. Otherwise, create a new `fetch`, store it under the key, and remove it once it settles (via `finally`, so both success and failure clean up).

## Example Implementation

Here is a complete, production-ready TypeScript wrapper:

```ts
const pending = new Map<string, Promise<Response>>()

function getKey(input: string | URL | Request, init?: RequestInit): string {
  const url = typeof input === 'string' ? input : input.url
  const method = init?.method ?? 'GET'
  const body = typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body ?? '')
  return `${method}:${url}:${body}`
}

export async function dedupedFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const key = getKey(input, init)

  const existing = pending.get(key)
  if (existing) return existing

  const promise = fetch(input, init).finally(() => {
    pending.delete(key)
  })

  pending.set(key, promise)
  return promise
}
```

Let's walk through the important parts.

### The Key

The key must capture everything that makes a request "the same":

```ts
function getKey(input: string | URL | Request, init?: RequestInit): string {
  const url = typeof input === 'string' ? input : input.url
  const method = init?.method ?? 'GET'
  const body = typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body ?? '')
  return `${method}:${url}:${body}`
}
```

If you omit the method, `GET` and `POST` to the same URL would collide. If you omit the body, two different payloads to the same endpoint would dedupe into one — a bug that is very hard to spot. Include `method`, `url`, and `body` at minimum.

### The Shared Promise

```ts
const promise = fetch(input, init).finally(() => {
  pending.delete(key)
})

pending.set(key, promise)
return promise
```

The key detail is that you store the **same promise object** that you return. All concurrent callers `await` one and the same promise, so there is exactly one `fetch` on the wire.

### Cleanup on Both Outcomes

Using `.finally()` means the map entry is removed whether the request **resolves or rejects**. This is critical: if you only cleaned up on success, a failed request would leave a dead promise in the map forever, and every future caller would receive the same rejected promise — a permanent blackout for that URL until the page reloads.

### Putting It to Work

```ts
// Three components, three callers — one network request.
const [me, setMe] = useState<User | null>(null)

useEffect(() => {
  api.me().then(setMe)
}, [])
```

If three instances of this component mount in the same tick, `dedupedFetch` returns the same promise to all three, and only one `GET /api/me` leaves the browser.

## Going Further: TTL Caching

Dedupe only merges *in-flight* requests. If you also want to reuse *completed* responses, add a short time-to-live. This gives you the best of both worlds: no concurrent duplicates, and no repeat fetches for rapid revisit.

```ts
const cache = new Map<string, { promise: Promise<Response>; expiresAt: number }>()

export async function dedupedFetchWithTTL(
  input: string | URL | Request,
  init?: RequestInit,
  ttlMs = 5_000,
): Promise<Response> {
  const key = getKey(input, init)
  const now = Date.now()

  const hit = cache.get(key)
  if (hit && hit.expiresAt > now) return hit.promise

  const entry = {
    promise: fetch(input, init).finally(() => {
      // keep in cache until TTL expires, but drop immediately on error
      cache.delete(key)
    }),
    expiresAt: now + ttlMs,
  }

  cache.set(key, entry)
  return entry.promise
}
```

## Going Further: Monkey-Patching `window.fetch`

The wrapper approach above requires every call site to use `dedupedFetch`. If you cannot touch the call sites — for example, third-party libraries or legacy code that call `fetch` directly — you can monkey-patch `fetch` itself so the dedupe logic runs on every request automatically.

```ts
const originalFetch = window.fetch.bind(window)
const pending = new Map<string, Promise<Response>>()

function getKey(input: string | URL | Request, init?: RequestInit): string {
  const url = typeof input === 'string' ? input : input.url
  const method = init?.method ?? 'GET'
  const body = typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body ?? '')
  return `${method}:${url}:${body}`
}

window.fetch = async (input, init) => {
  const key = getKey(input, init)

  const existing = pending.get(key)
  if (existing) return existing

  const promise = originalFetch(input, init).finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}
```

Because this wraps *every* `fetch` in the app, it also intercepts mutations. You almost never want to dedupe side-effecting requests, so guard the patch to only dedupe idempotent methods:

```ts
window.fetch = async (input, init) => {
  const method = init?.method ?? 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    return originalFetch(input, init)
  }

  const key = getKey(input, init)
  const existing = pending.get(key)
  if (existing) return existing

  const promise = originalFetch(input, init).finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}
```

Caveats to keep in mind:

- **Patch at bootstrap.** Apply the override once, before any other code calls `fetch`, otherwise early requests escape the dedupe.
- **You override everything.** Devtools, analytics, and tracking scripts that call `fetch` are also affected — make sure the guard for non-idempotent methods is in place.
- **Type safety.** The assignment may need a cast (`window.fetch = deduped as typeof fetch`) if the patched signature does not match the browser's types exactly.

Monkey-patching is the hammer: it fixes every call site at once, but it touches more than you asked for. A wrapper in your own `api.ts` is the scalpel — explicit, safe, and scoped. Prefer the wrapper unless you genuinely cannot change the call sites.

## Putting It All Together

Here is a complete, production-ready module that combines every enhancement discussed so far: explicit types, in-flight dedupe, TTL caching, a `bypass` escape hatch, an idempotent-method guard, and header-aware keys.

```ts
interface DedupeOptions {
  ttlMs?: number            // reuse completed responses for this long (0 = dedupe only, no caching)
  bypass?: boolean          // skip dedupe + cache entirely, always hit the network
  includeHeaders?: string[] // header names to fold into the key so such requests don't merge
}

const pending = new Map<string, Promise<Response>>()
const cache = new Map<string, { promise: Promise<Response>; expiresAt: number }>()

function getKey(
  input: string | URL | Request,
  init?: RequestInit,
  includeHeaders: string[] = [],
): string {
  const url = typeof input === 'string' ? input : input.url
  const method = init?.method ?? 'GET'
  const body = typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body ?? '')
  const headers = includeHeaders
    .map((name) => {
      const value = new Headers(init?.headers).get(name)
      return value ? `${name}:${value}` : ''
    })
    .filter(Boolean)
    .join(';')
  return `${method}:${url}:${body}:${headers}`
}

function isIdempotent(method?: string): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
}

export function dedupedFetch(
  input: string | URL | Request,
  init?: RequestInit,
  { ttlMs = 0, bypass = false, includeHeaders = [] }: DedupeOptions = {},
): Promise<Response> {
  const method = init?.method ?? 'GET'

  // Side-effecting requests are never deduped or cached.
  if (!isIdempotent(method)) return fetch(input, init)

  const key = getKey(input, init, includeHeaders)
  const now = Date.now()

  // 1. In-flight dedupe — someone else is already fetching this key.
  const inFlight = pending.get(key)
  if (inFlight) return inFlight

  // 2. Completed response still within its TTL.
  if (!bypass && ttlMs > 0) {
    const hit = cache.get(key)
    if (hit && hit.expiresAt > now) return hit.promise
  }

  // 3. Fresh request — store it, then clean up on settle.
  const promise = fetch(input, init).finally(() => pending.delete(key))

  pending.set(key, promise)

  if (ttlMs > 0) {
    promise.catch(() => cache.delete(key))
    cache.set(key, { promise, expiresAt: now + ttlMs })
  }

  return promise
}
```

Usage:

```ts
// Dedupe concurrent in-flight requests, no caching.
api.me()

// Dedupe + reuse completed responses for 30 seconds.
api.me({ ttlMs: 30_000 })

// Skip dedupe and cache entirely — always fresh.
api.me({ bypass: true })

// Keep requests with different locales from merging into one.
api.profile({ includeHeaders: ['Accept-Language'] })
```

The order of checks matters. The in-flight map is consulted first so concurrent callers share one promise, then the cache serves warm responses, and only a true miss hits the network. Mutations pass straight through untouched, and `bypass` lets any caller force a fresh request when stale data would be worse than a duplicate.

## Edge Cases and Caveats

Dedupe is simple, but the edge cases are where bugs hide:

- **Always-fresh data.** If a caller explicitly needs a fresh response, let it bypass dedupe:
  ```ts
  export async function dedupedFetch(input, init, { bypass = false } = {}) {
    const key = getKey(input, init)
    if (!bypass) {
      const existing = pending.get(key)
      if (existing) return existing
    }
    // ...
  }
  ```
- **Headers in the key.** `method`, `url`, and `body` are usually enough, but if two requests differ only by a header (e.g., an auth token or `Accept-Language`), the key must include it or you will merge requests that should be separate.
- **POST and mutations.** Never dedupe side-effecting requests. If a user double-clicks "Save", you usually want both clicks to matter, or at least to know about the second one. Only dedupe idempotent, read-only requests — or build a key that explicitly rejects mutation methods.
- **Streaming.** If you use `ReadableStream` responses (e.g., SSE), a shared promise is dangerous — only one consumer can read the stream. Keep dedupe away from streaming endpoints.

## When NOT to Dedupe

- **Mutations** — POST/PUT/DELETE should fire exactly as many times as the user asked.
- **Non-idempotent requests** — anything where calling it twice has different effects.
- **Streaming / long-lived connections** — the response body cannot be shared between consumers.

A simple mental model: if two calls to the same request are indistinguishable and the second one is a waste, dedupe it. Otherwise, let it through.

## Summary

Duplicate fetches are a silent waste of bandwidth, server resources, and rate-limit quota. Deduplication fixes the root cause by sharing a single in-flight promise across all callers of an identical request.

| Problem | Symptom | Dedupe |
|---------|---------|--------|
| Five components fetch `/api/me` at mount | Five identical network calls | One promise, one request |
| Debounced search fires overlapping queries | Duplicate query results | Identical keys merge |
| Failed request retried by siblings | Stale promise blackout | `.finally()` cleans up on error |

The whole technique fits in a `Map`, a key function, and a `finally`. It is a small investment with outsized returns — fewer requests, happier servers, and a network tab you can actually read.
