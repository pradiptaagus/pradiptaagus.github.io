+++
title = 'React Context as Dependency Injection'
description = 'Understanding React Context as a dependency injection mechanism, how it compares to Angular DI, and when to reach for it'
date = '2026-07-10'
draft = false
categories = ['article']
tags = ['react', 'typescript', 'frontend', 'state-management']

[cover]
  image = 'images/blog/react-context-as-dependency-injection.png'
  alt = 'React Context as Dependency Injection'
+++

React Context is often described as a tool for sharing state across a component tree. More accurately, it is a **dependency injection (DI) mechanism** built into React itself. It allows a parent component to declare dependencies and make them available to any descendant in the tree, without passing them through every intermediate layer.

Unlike external state management libraries, Context does not manage state on its own. It is a **provider** that injects values into the component hierarchy, and a **consumer** that retrieves them. This is the same pattern found in other frameworks: Angular's hierarchical injectors, Svelte's `setContext`/`getContext`, and even Vue's `provide`/`inject`. The idea is always the same — decouple the dependency **provider** from the dependency **consumer**, and let the framework handle the wiring.

## The Problem: Prop Drilling is a Coupling Problem

Prop drilling occurs when you pass data from a parent component down through several intermediary components that do not need the data themselves, solely to reach a deeply nested child. This tightly couples every intermediate component to the shape of the data, even though they have no business knowing about it.

```tsx
function App() {
  const [user, setUser] = useState<User | null>(null)
  return <Dashboard user={user} onLogin={setUser} />
}

function Dashboard({ user, onLogin }: DashboardProps) {
  return <Sidebar user={user} onLogin={onLogin} />
}

function Sidebar({ user, onLogin }: SidebarProps) {
  return <UserProfile user={user} onLogin={onLogin} />
}
```

The `Sidebar` and `Dashboard` components act as passthroughs, making the code harder to maintain and refactor. Context eliminates this indirection by decoupling the dependency source from the dependency consumer.

## Context as a DI Container

React Context mirrors the three roles of a DI system: **token registration**, **provider binding**, and **injection**.

### 1. Token Registration with `createContext`

Every dependency needs a lookup key. In React, `createContext` creates that key — the injection token.

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Injection token — comparable to Angular's InjectionToken
const AuthContext = createContext<AuthContextType | null>(null)
```

The generic parameter defines the type of the dependency. The default value (`null`) is the fallback when no provider is found up the tree — similar to Angular's `@Optional()` decorator.

### 2. Provider Binding

A Provider component registers the concrete value for the token, scoped to a subtree. It is the DI container's binding declaration.

```tsx
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const loggedInUser = await api.login(email, password)
    setUser(loggedInUser)
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

The provider can live at any level of the tree. Placing it at the root makes the dependency global (like Angular's `providedIn: 'root'`). Placing it inside a specific branch scopes the dependency to that subtree (like Angular's component-level `providers` array). This hierarchical scoping is the essence of DI — the consumer does not need to know where the dependency comes from, only what token to ask for.

### 3. Injection with `useContext`

Descendants retrieve the dependency by referencing the token. This is the injection phase.

```tsx
function UserProfile() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used within AuthProvider')

  return auth.user ? (
    <div>
      <p>Welcome, {auth.user.name}</p>
      <button onClick={auth.logout}>Log out</button>
    </div>
  ) : (
    <LoginForm onLogin={auth.login} />
  )
}
```

Wrapping the injection in a custom hook enforces the guard and provides a cleaner API:

```tsx
function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

Now consuming components only need `useAuth()`. They import the hook, not the provider. The dependency is injected, not passed via props.

### Hierarchical Resolution

React Context providers are hierarchical, just like Angular's injector tree. When `useContext` is called, React walks up the component tree to find the nearest matching `Provider`. If none is found, it falls back to the default value.

```tsx
<AuthProvider>
  <Dashboard>
    <Sidebar>
      {/* Resolves to the outer AuthProvider */}
      <UserProfile />
    </Sidebar>
    <AdminPanel>
      <AuthProvider>  {/* Overrides for this subtree */}
        <UserProfile />  {/* Resolves to the inner AuthProvider */}
      </AuthProvider>
    </AdminPanel>
  </Dashboard>
</AuthProvider>
```

This is identical to Angular's element injector hierarchy — a child provider shadows its ancestor for the same token, enabling scoped overrides without affecting sibling branches.

## When to Use Context as DI

Context as a DI mechanism shines when a dependency is needed across many unrelated components in a subtree. Common examples:

- **Authentication state** (current user, login/logout)
- **Theme** (dark mode, color tokens)
- **Locale / i18n** (current language, translations)
- **Feature flags** (enabled features per environment)
- **API clients or service singletons** scoped to a feature module

Avoid using Context for data that changes at high frequency — every change triggers re-renders in all consumers. In that case, consider a library with fine-grained reactivity. Also avoid Context when the dependency is only needed by one or two components; lifting state up or component composition is simpler.

Context is best understood as a **scoping mechanism**, not a state store. You are defining which part of the tree has access to which dependencies, exactly like Angular's element injector or a Guice module.

## Re-render Performance

Every time a context provider's `value` changes, all consumers of that context re-render, even if they only read a portion of the value that did not change. This is the most common performance pitfall.

```tsx
// Problem: re-creating a new object on every render
function App() {
  const [count, setCount] = useState(0)
  return (
    <MyContext.Provider value={{ count, setCount }}>
      <ExpensiveTree />
    </MyContext.Provider>
  )
}

// Solution: memoize the value
function App() {
  const [count, setCount] = useState(0)
  const value = useMemo(() => ({ count, setCount }), [count])
  return (
    <MyContext.Provider value={value}>
      <ExpensiveTree />
    </MyContext.Provider>
  )
}
```

For independent concerns, split contexts rather than lumping unrelated values into one. This prevents unrelated changes from triggering unnecessary re-renders.

```tsx
// Instead of one context:
// const AppContext = createContext({ user, theme, notifications })

// Split into separate contexts:
const UserContext = createContext<UserContextType | null>(null)
const ThemeContext = createContext<ThemeContextType | null>(null)
const NotificationContext = createContext<NotificationContextType | null>(null)
```

## Context vs. State Management Libraries

Because Context is often mistaken for a state management tool, it is worth clarifying the distinction. Context is **DI infrastructure**, not a state store. It does not provide:

- **Devtools** for time-travel debugging or state inspection
- **Selectors** to prevent re-renders of unrelated consumers
- **Middleware** for side effects (though you can compose with `useReducer`)

This is the same distinction as Angular's DI vs. NgRx — one wires dependencies, the other manages state. If you need a global state store with performant reads and writes, reach for Zustand, Jotai, or NgRx. If you need to make a value available to a subtree without prop threading, Context is the right tool.

```tsx
// Context + useReducer for local-to-global state
function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 })
  const value = useMemo(() => ({ state, dispatch }), [state])
  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  )
}
```

## Summary

| Aspect | Context (DI) | Prop Drilling | State Library |
|--------|-------------|---------------|---------------|
| Mechanism | Injection via tree-walking provider lookup | Manual passthrough | External store with subscriptions |
| Scope | Subtree-defined, hierarchical | Linear parent-to-child | Global (usually) |
| Performance | Re-renders all consumers on value change | Only affected components | Selectors prevent unnecessary renders |
| Use case | Cross-cutting dependencies (auth, theme, i18n) | Narrow, shallow data | Complex, frequently-changing global state |
| Framework parallel | Angular `providers`, Svelte `setContext`, Vue `provide` | N/A | NgRx, Pinia, Vuex |

React Context is React's native DI mechanism. It decouples the provider of a dependency from its consumer, scoped to a component subtree. Treat it as infrastructure for wiring dependencies, not as a state management solution — and it will serve you well.
