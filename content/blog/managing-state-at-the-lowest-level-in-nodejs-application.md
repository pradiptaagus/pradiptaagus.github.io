+++
title = "The Power of Bits: Managing State at the Lowest Level in Node.js Applications"
description = "Utilizing bitwise to solve high level performance problems in Node.js Applications"
date = '2026-10-02'
publishDate = '2026-10-02'
draft = false
categories = ["article"]
tags = ["frontend", "backend", "performance", "typescript", "javascript", "Node.js"]

[cover]
  image = 'images/blog/bitwise-state-manager.png'
  alt = 'Bitwise state manager'
+++

If you are building complex UI components, high-traffic Node.js APIs, or intricate configuration systems, you have probably written an interface that consists of multiple boolean which looks like this:

```typescript
interface EditorSetting {
  autoSave: boolean;
  formatOnType: boolean;
  wordWrap: boolean;
  showLines: boolean;
  minimapEnabled: boolean;
}
```

While readable, passing around large objects of booleans is inefficient in terms of memory allocation and CPU cycles. What if you could replace that entire object with a single, highly optimized number? Enter **bitwise**.

By treating a single integer as a sequence of independent true/false flags, you can drastically reduce memory overhead, speed up conditional checks, and simplify complex state logic. Here is a complete guide to high-performance bitwise state management in TypeScript.

## Get Acquainted with Bits Operations

We should know about bits operations teory before deep diving into the real implementations. If you already familiar with the concept, you can skip this section and go to [this section](#implementation)

### What is Bits Operations?

Bitwise are fundamental actions performed on the binary representations of numbers at the lowest level of a computer's processor. Instead of treating a number as a single value (like 5 or 10), bitwise evaluate and manipulate each individual bit that makes up that number.

### Why Are Bits Better?

It is easy to claim bitwise are faster, but understanding _why_ requires looking at how engines like V8 (Node.js/Chrome) operate.

#### Memory Efficiency (The Macro View)

If you benchmark an array of 10,000,000 boolean objects against an array of 10,000,000 bitmask integers in Node.js, the boolean array will typically consume largest memory compared to bitmask integers.

Every time you add a boolean property to an object (`{ a: true, b: false }`), V8 creates a "Hidden Class" to map those properties. A bitmask integer, however, is stored as a **smis (small integers)**. V8 highly optimizes small integers (`smis`), storing them directly in the pointer space without allocating _any_ extra bytes on the heap.

#### CPU Speed (The Micro View)

To genuinely measure CPU execution time, standard clocks are not accurate enough. By using Node's `perf_hooks` API, which provides sub-millisecond, high-resolution performance measurement, we can isolate the exact execution time of the logic.

If you generate a massive array of 10,000,000 simulated items and run a strict benchmark (recording exact timestamps immediately before and after a for loop filters the data), the results are stark. After the V8 engine completes its Just-In-Time (JIT) warm-up phase, bitwise consistently **run 2x to 4x faster** than standard boolean checks.

This massive speedup happens for two hardware-level reasons:

- **Memory Locality:** A packed array of small integers (`smis`) can be loaded efficiently into the CPU's L1/L2 cache in contiguous chunks, meaning the processor doesn't have to wait to fetch data. Object arrays require the CPU to constantly jump around heap memory to find the actual boolean values.
- **Fewer Instructions:** Checking `item.autoSave` && `item.wordWrap` forces the engine to look up two separate property addresses in memory, evaluate the first, branch, evaluate the second, and branch again. The bitwise check `(flags & 5) === 5` is evaluated in a single clock cycle directly on a CPU register.

---

## The Core of Bitwise

Here are the standard bitwise operators used in most programming languages:

| <div style="width: 92px;">Operator</div> | Symbol | How it Works                                            | <div style="width: 145px;">Example (4-bit)</div> |
| ---------------------------------------- | ------ | ------------------------------------------------------- | ------------------------------------------------ |
| `AND`                                    | `&`    | Returns 1 only if both bits are 1                       | `1100 & 1010 = 1000`                             |
| `OR`                                     | `\|`   | Returns 1 if at least one bit is 1                      | `1100 \| 1010 = 1110`                            |
| `XOR`                                    | `^`    | Returns 1 if the bits are different                     | `1100 ^ 1010 = 0110`                             |
| `NOT`                                    | `~`    | Inverts all bits (flips 1 to 0 and 0 to 1)              | `~1100 = 0011`                                   |
| `Left Shift`                             | `<<`   | Shifts bits to the left, padding with 0s on the right   | `0011 << 1 = 0110`                               |
| `Right Shift`                            | `>>`   | Shifts bits to the right, discarding the rightmost bits | `0110 >> 1 = 0011`                               |

Bellow is a interactive bitwise calculator to help you understand exatcly how the bits are flipping.

{{<bitwise-flag-calculator>}}

## Implementation

In TypeScript, the most efficient way to define bit flags is using a `const enum` combined with the left-shift operator (`<<`). The bitwise is start from the most right number.

```typescript
const enum EditorSettingAction {
  AutoSave = 1 << 0,
  FormatOnType = 1 << 1,
  WordWrap = 1 << 2,
  ShowLines = 1 << 3,
  MinimapEnabled = 1 << 4,
}
```

> **Why `const enum`?** This is a zero-cost abstraction. During compilation, TypeScript completely erases the `enum` and replaces your code with raw integers. No lookup objects are generated in the final JavaScript bundle, resulting in zero runtime overhead.

### The Core Operations

Instead of using standard boolean logic (`&&` and `||`), you can manipulate the bits directly using bitwise operators.

| Goal        | Concept                      | <div style="width: 340px;">Syntax</div>        |
| :---------- | :--------------------------- | :--------------------------------------------- |
| **Check**   | Verify a state using AND     | `(state & EditoSettingAction.AutoSave) !== 0;` |
| **Enable**  | Add a state using OR         | `state \|= EditoSettingAction.AutoSave;`       |
| **Disable** | Remove a state using AND NOT | `state &= ~EditoSettingAction.AutoSave;`       |
| **Toggle**  | Flip a state using XOR       | `state ^= EditoSettingAction.AutoSave;`        |

The real example of bitwise operation implementation is by utilize it to store a bunch of boolean values. Given a value of 8 bit number. This number can store max 7 states. If more space is needed, it can use 16 bit number. More bits, more memory will be used.

```typescript
let state = 0b00000000;

// Set autosave to true
state = state & EditoSettingAction.AutoSave;

console.log(state.toString(2).padStart(8, "0")) // 00000001

const isAutoSave = (state & EditorAction.AutoSave) !== 0;
console.log(isAutoSave); // true

```

### Reading State Back to Strings

Because the `const enum` is erased at compile time, you cannot use standard object iteration to read the flags at runtime. If you need to render the active settings in a UI or log them for debugging, you use a runtime dictionary.

```typescript
const SettingNames: Record<number, string> = {
  [EditorSettingAction.AutoSave]: "Auto Save",
  [EditorSettingAction.FormatOnType]: "Format on Type",
  [EditorSettingAction.WordWrap]: "Word Wrap",
  [EditorSettingAction.ShowLines]: "Show Line Numbers",
  [EditorSettingAction.MinimapEnabled]: "Minimap Enabled",
};

function getActiveSettings(configMask: number): string[] {
  const activeSettings: string[] = [];

  for (const [flagString, name] of Object.entries(SettingNames)) {
    const flag = Number(flagString);

    // Check if the current flag exists within the mask
    if ((configMask & flag) === flag) {
      activeSettings.push(name);
    }
  }

  return activeSettings;
}

// The 0b prefix tells Javascript that the number following is a binary
const currentConfig = 0b00000101;

console.log(getActiveSettings(currentConfig));
// Output: [ 'Auto Save', 'Word Wrap' ]
```

You can use the playground bellow for state management using bitwise.

{{<bitwise-state-manager>}}

---

## Benchmark

Now the time to reveals the evidences of storing states is better using bitwise is better than boolean. The benchmark will using some metrics and source code as follow.

### Metrics

To get know about how much the performance improvement of using bitwise operations, it can be done by creating a simulation of storing states using boolean and bitwise. The benchmark will monitor time and memory usage. Time execution can be caculated by substract end time and start time which obtained by Node's API `performance.now()`, while memory usage can be analyzed by utilize Node.js `process.memoryUsage()` method.
This method provides insights into how much memory of a Node.js process application is using. It returns an object with properties as follow.

#### `rss` (Resident Set Size)

Property `rss` is the total memory allocated to a Node.js application process, including heap and other areas like C++ execution stack, the compiled Just-In-Time (JIT) code cache, external C++ memory, `ArrayBuffers` and `Buffer` instances, and the entire v8 heap.

#### `heapUsed`

Property `heapUsed` is the actual amount of memory currently occupied by live, active JavaScript objects inside that container. It covers memory usage like standard Javascript objects, Javascript arrays, string and numbers (that are not optimized as `smis`), functions and closures.

#### `heapTotal`

Property `heapTotal` is the total size of the memory block V8 has set aside for the heap. It grows dynamically as your application demands more memory, but it does not instantly shrink back down when memory is freed. If `heapTotal` is a 500 MB warehouse, `heapUsed` is the 200 MB of physical boxes currently sitting inside it. `heapUsed` will always be less than or equal to `heapTotal`. When `heapUsed` approaches the limit of `heapTotal`, V8 triggers garbage collection to clear out dead objects. If the garbage collector cannot free up enough space, V8 will reach out to the operating system to expand the warehouse, increasing `heapTotal`. In absolute terms, heapTotal can never be smaller than heapUsed. It is physically impossible for the contents (the used memory) to exceed the size of the container (the total allocated memory) at any given moment.

#### `external`

Property `external` is the memory used by whenever Javascript object requires a corresponding C++ object to store its undelying state, data, or buffers. This memory is allocated directly by the operating system (using C++ memory allocation like `malloc`) rather than being placed on the V8 JavaScript engine's garbage-collected heap. The primary scenarios that trigger `external` memory allocation such as using native C++ addons, cryptographic operations, networking and I/O handles, webasembly, and raw binary data (buffers) like instances like `Buffer` or `ArrayBuffer`.

#### `arrayBuffers`

Property `arrayBuffers` is the memory allocated to various Buffer-like objects. While `external` tracks memory managed outside the V8 JavaScript heap (like memory used by C++ objects linked to JavaScript objects), `arrayBuffers` specifically isolates the binary data allocations.

### Benchmark

The benchmark will use scenario storing state using boolean and bit flags for `10.000.000` random data. The data then will be checked for truthy values. The code for test is like bellow.

```typescript
import { performance } from "node:perf_hooks";
import v8 from "node:v8";

interface EditorSetting {
  autoSave: boolean;
  formatOnType: boolean;
  wordWrap: boolean;
  showLines: boolean;
  minimapEnabled: boolean;
}

const enum EditorSettingAction {
  AutoSave = 1 << 0,
  FormatOnType = 1 << 1,
  WordWrap = 1 << 2,
  ShowLines = 1 << 3,
  MinimapEnabled = 1 << 4,
}

const ITERATIONS = 10_000_000;

function testBoolean() {
  const booleanData: EditorSetting[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const autoSave = Math.random() < 0.5;
    const formatOnType = Math.random() < 0.5;
    const wordWrap = Math.random() < 0.5;
    const showLines = Math.random() < 0.5;
    const minimapEnabled = Math.random() < 0.5;

    booleanData.push({
      autoSave,
      formatOnType,
      wordWrap,
      showLines,
      minimapEnabled,
    });
  }

  let matchCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    const item = booleanData[i];
    if (!item) continue;

    const ALL_ENABLED =
      item.autoSave &&
      item.formatOnType &&
      item.wordWrap &&
      item.showLines &&
      item.minimapEnabled;

    if (ALL_ENABLED) {
      matchCount++;
    }
  }
  return matchCount;
}

function testBitwise() {
  const bitwiseData: Uint8Array = new Uint8Array(ITERATIONS);

  for (let i = 0; i < ITERATIONS; i++) {
    const autoSave = Math.random() < 0.5;
    const formatOnType = Math.random() < 0.5;
    const wordWrap = Math.random() < 0.5;
    const showLines = Math.random() < 0.5;
    const minimapEnabled = Math.random() < 0.5;

    let flags = 0b00000000;
    if (autoSave) flags |= EditorSettingAction.AutoSave;
    if (formatOnType) flags |= EditorSettingAction.FormatOnType;
    if (wordWrap) flags |= EditorSettingAction.WordWrap;
    if (showLines) flags |= EditorSettingAction.ShowLines;
    if (minimapEnabled) flags |= EditorSettingAction.MinimapEnabled;

    bitwiseData[i] = flags;
  }

  let matchCount = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    const flags = bitwiseData[i];
    if (!flags) continue;

    const ALL_ENABLED_MASK =
      EditorSettingAction.AutoSave |
      EditorSettingAction.FormatOnType |
      EditorSettingAction.WordWrap |
      EditorSettingAction.ShowLines |
      EditorSettingAction.MinimapEnabled;

    if ((flags & ALL_ENABLED_MASK) === ALL_ENABLED_MASK) {
      matchCount++;
    }
  }
  return matchCount;
}

function benchmark(name: string, cb: () => number) {
  if (global.gc) global.gc();

  const startMemory = process.memoryUsage();
  const startPerformance = performance.now();
  const match = cb();
  const endPerformance = performance.now();
  const endMemory = process.memoryUsage();

  const usage = {
    rss: endMemory.rss - startMemory.rss,
    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
    external: Math.max(endMemory.external - startMemory.external, 0),
    arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
  };

  if (global.gc) global.gc();

  const metrics = [
    {
      metric: "Pure CPU Time (ms)",
      value: endPerformance - startPerformance,
    },
    {
      metric: "Match count",
      value: match,
    },
    {
      metric: "RSS Start",
      value: startMemory.rss / 1024 / 1024,
    },
    {
      metric: "RSS End (MB)",
      value: endMemory.rss / 1024 / 1024,
    },
    {
      metric: "RSS Delta (MB)",
      value: usage.rss / 1024 / 1024,
    },
    {
      metric: "Heap Total Start (MB)",
      value: startMemory.heapTotal / 1024 / 1024,
    },
    {
      metric: "Heap Total End (MB)",
      value: endMemory.heapTotal / 1024 / 1024,
    },
    {
      metric: "Heap Total Delta (MB)",
      value: usage.heapTotal / 1024 / 1024,
    },
    {
      metric: "Heap Used Start (MB)",
      value: startMemory.heapUsed / 1024 / 1024,
    },
    {
      metric: "Heap Used End (MB)",
      value: endMemory.heapUsed / 1024 / 1024,
    },
    {
      metric: "Heap Used Delta (MB)",
      value: usage.heapUsed / 1024 / 1024,
    },
    {
      metric: "External Start (MB)",
      value: startMemory.external / 1024 / 1024,
    },
    {
      metric: "External End (MB)",
      value: endMemory.external / 1024 / 1024,
    },
    {
      metric: "External Delta (MB)",
      value: usage.external / 1024 / 1024,
    },
    {
      metric: "Array Buffers Start (MB)",
      value: startMemory.arrayBuffers / 1024 / 1024,
    },
    {
      metric: "Array Buffers End (MB)",
      value: endMemory.arrayBuffers / 1024 / 1024,
    },
    {
      metric: "Array Buffers Delta (MB)",
      value: usage.arrayBuffers / 1024 / 1024,
    },
  ];

  console.log(`Benchmark: ${name}`);
  console.table(metrics);
}

console.log("Warming up...");
for (let i = 0; i < 10; i++) {
  testBoolean();
  testBitwise();
}

console.log("Starting benchmark...");
const { heap_size_limit } = v8.getHeapStatistics();
console.log(`Heap size limit: ${heap_size_limit / 1024 / 1024} MB`);
console.log("-----------------------------\n");

benchmark("Boolean", testBoolean);
benchmark("Bitwise", testBitwise);
```

Before running benchmark, the Typescript code will be compiled into Javascript codes using `tsc` to make the code startup run faster then using `ts-node` because the code is already plain Javascript and Node.js can executes it immediately with zero overhead.

To make the tests fair, garbage collector will run before the tests run using `global.gc()` and running Node.js application with flag `--expose-gc`. It makes the memory usage calculation has no noise (garbage memory which is not the part of the process).

This benchmark run on Macbook Air M1 8GB. The result of the benchmark is like bellow.

```bash
tsc && node --expose-gc index.js

Warming up...
Starting benchmark...
Heap size limit: 2096 MB
-----------------------------

Benchmark: Boolean
┌─────────┬────────────────────────────┬──────────────────────┐
│ (index) │ metric                     │ value                │
├─────────┼────────────────────────────┼──────────────────────┤
│ 0       │ 'Pure CPU Time (ms)'       │ 1300.9317090000004   │
│ 1       │ 'Match count'              │ 312183               │
│ 2       │ 'RSS Start'                │ 1095.484375          │
│ 3       │ 'RSS End (MB)'             │ 1242.140625          │
│ 4       │ 'RSS Delta (MB)'           │ 146.65625            │
│ 5       │ 'Heap Total Start (MB)'    │ 38.90625             │
│ 6       │ 'Heap Total End (MB)'      │ 838.34375            │
│ 7       │ 'Heap Total Delta (MB)'    │ 799.4375             │
│ 8       │ 'Heap Used Start (MB)'     │ 2.95263671875        │
│ 9       │ 'Heap Used End (MB)'       │ 805.5026550292969    │
│ 10      │ 'Heap Used Delta (MB)'     │ 802.5500183105469    │
│ 11      │ 'External Start (MB)'      │ 11.176488876342773   │
│ 12      │ 'External End (MB)'        │ 1.6397838592529297   │
│ 13      │ 'External Delta (MB)'      │ -9.536705017089844   │
│ 14      │ 'Array Buffers Start (MB)' │ 0.010157585144042969 │
│ 15      │ 'Array Buffers End (MB)'   │ 0.010157585144042969 │
│ 16      │ 'Array Buffers Delta (MB)' │ 0                    │
└─────────┴────────────────────────────┴──────────────────────┘
Benchmark: Bitwise
┌─────────┬────────────────────────────┬──────────────────────┐
│ (index) │ metric                     │ value                │
├─────────┼────────────────────────────┼──────────────────────┤
│ 0       │ 'Pure CPU Time (ms)'       │ 527.9737090000017    │
│ 1       │ 'Match count'              │ 313045               │
│ 2       │ 'RSS Start'                │ 1053.875             │
│ 3       │ 'RSS End (MB)'             │ 1053.875             │
│ 4       │ 'RSS Delta (MB)'           │ 0                    │
│ 5       │ 'Heap Total Start (MB)'    │ 36.40625             │
│ 6       │ 'Heap Total End (MB)'      │ 36.40625             │
│ 7       │ 'Heap Total Delta (MB)'    │ 0                    │
│ 8       │ 'Heap Used Start (MB)'     │ 3.0230178833007812   │
│ 9       │ 'Heap Used End (MB)'       │ 10.905799865722656   │
│ 10      │ 'Heap Used Delta (MB)'     │ 7.882781982421875    │
│ 11      │ 'External Start (MB)'      │ 1.6452407836914062   │
│ 12      │ 'External End (MB)'        │ 11.181983947753906   │
│ 13      │ 'External Delta (MB)'      │ 9.5367431640625      │
│ 14      │ 'Array Buffers Start (MB)' │ 0.010157585144042969 │
│ 15      │ 'Array Buffers End (MB)'   │ 9.546900749206543    │
│ 16      │ 'Array Buffers Delta (MB)' │ 9.5367431640625      │
└─────────┴────────────────────────────┴──────────────────────┘
```

The result explanation is as follow.

#### CPU Execution Speed

The bitwise approach is approximately 2.4 times faster than the boolean approach.

- **Boolean (1300.93 ms):** The engine spends this time evaluating standard object logic. For 10 million items, it must locate each object on the heap, resolve its hidden class structure, look up the specific autoSave and wordWrap properties, and evaluate the && condition.

- **Bitwise (527.97 ms):** The engine bypasses object property lookups entirely. It loads integers directly into the CPU registers and executes a single hardware-level bitwise & instruction per item.

#### Process Footprint (`rss`)

The Resident Set Size (`rss`) delta shows the impact on the operating system's actual RAM allocation.

- **Boolean `rss` Delta (146.65 MB):** As the heap ballooned by 800 MB, the Node.js process had to claim an additional 146 MB of physical RAM from the OS to maintain its operations.

- **Bitwise `rss` Delta (0 MB):** The bitwise execution was so efficient that the overall physical footprint of the Node.js process did not grow at all during the 10 million iterations.

#### Heap Memory Allocation

This is where the structural difference is most visible, demonstrating the massive overhead of standard JavaScript objects.

- **Boolean Heap Used Delta (802.55 MB):** Pushing 10 million simple objects (e.g., `{ autoSave: true }`) onto a standard array forces V8 to allocate over 800 MB of memory. This includes the memory for the boolean primitives themselves, plus the hidden class metadata, prototype pointers, and hash map structures required to maintain the array and objects.

- **Bitwise Heap Used Delta (7.88 MB):** The bitwise approach barely touches the V8 JavaScript heap. V8 highly optimizes small integers (`smis`), meaning the numeric flags themselves require zero additional heap allocation.

#### External Memory and Array Buffers

The External Delta measures the change in memory allocated outside of V8's standard JavaScript heap during the benchmark's execution. In Node.js, this external memory is managed directly by underlying C++ bindings and is primarily used for storing raw binary data structures such as `ArrayBuffer`, `Buffer`, and `TypedArray`.

##### The Bitwise Benchmark (+9.53 MB)

In the Bitwise results, both the External Delta and the Array Buffers Delta increased by precisely 9.5367431640625 MB.

- **The 10 Million Byte Allocation:** Because 1 Megabyte equals 1,048,576 bytes, 9.53674 MB equates to exactly 10,000,000 bytes. This confirms that the Bitwise implementation stored its 10 million boolean states inside a single, tightly packed `Uint8Array` or native `Buffer`.

- **Bypassing the Heap:** Because the data was stored as contiguous raw bytes in C++, it completely bypassed the V8 JavaScript heap. This is why the Heap Used Delta for the Bitwise test remained at a negligible 7.88 MB.

##### The Boolean Benchmark (-9.53 MB)

The Boolean results show a negative External Delta of -9.536705017089844 MB. This negative value does not mean boolean logic generates free memory; it is a side effect of extreme memory pressure triggering the V8 Garbage Collector.

- **The 800 MB Panic:** The Boolean implementation relied on standard JavaScript objects (e.g., `{ autoSave: true }`). Pushing 10 million of these objects onto an array forced the V8 engine to allocate over 800 MB on the JavaScript heap (as seen in the Heap Used Delta).

- **Emergency Sweeping:** This massive, rapid allocation caused severe memory pressure. To prevent the process from crashing, V8 was forced to run an aggressive garbage collection sweep while the benchmark was executing.

- **The Math:** During this sweep, V8 found and destroyed the exact 10 MB ArrayBuffer left over from a previous run or warm-up phase. Because the benchmark script recorded 11.17 MB of external memory before the test and only 1.63 MB after the test, the mathematical difference resulted in the -9.53 MB delta.

#### Data Integrity (Match Count)

The match count serves as a critical sanity check for the benchmark. It verifies that both implementations actually performed the requested work rather than skipping iterations or failing to evaluate the logic.

- **Verification of Work:** Out of 10 million items, the Boolean test found 312,183 valid matches, and the Bitwise test found 313,045 matches. This confirms that both loops successfully evaluated the conditions across the entire dataset and extracted the approximately 3.1% of items that met the criteria.

- **The Variance:** The slight difference in the final count indicates that the mock data for each test was generated independently, likely using a random or alternating distribution (e.g., Math.random() > 0.5).

Because both approaches arrived at an equivalent logical outcome across 10 million randomized items, the match count proves that the massive CPU and memory gains of the bitwise approach are legitimate hardware-level optimizations, not the result of flawed code bypassing the actual work.

---

## When Should You Use Bitwise?

Use bitwise when memory efficiency, raw CPU execution speed, or data density are critical requirements, rather than for standard business logic. They are highly specialized tools best reserved for the following scenarios:

### High-Frequency Execution Loops

When building game engines, physics simulations, or real-time data parsers, functions may run thousands of times per second (e.g., a 60 FPS rendering loop). Using bitwise to check entity states (e.g., `isMoving`, `isHidden`, `isColliding`) bypasses JavaScript object allocation and garbage collection pauses, preventing dropped frames.

### Managing Massive Datasets

If your application needs to hold millions of records in memory simultaneously, such as caching a massive grid, processing pixels in an image, or filtering large data streams, wrapping booleans in JavaScript objects will cause the heap to balloon. Storing bitmasks inside a `TypedArray` (like `Uint8Array`) allows you to store millions of states using only a few megabytes of RAM.

### Complex, Overlapping State Management

When an entity or component has many distinct states that can exist simultaneously, bit flags prevent messy `if/else` chains. UI library creators often use bitmasks to manage complex component states (e.g., a dropdown that is simultaneously `Hovered`, `Focused`, `Disabled`, and `HasError`) because a single bitwise & or | can evaluate or apply multiple states in one CPU cycle.

### Network and Storage Optimization

When bandwidth or storage is strictly limited, sending a massive JSON object full of boolean properties over a WebSocket or saving it to a database is inefficient. Compressing 30 boolean configurations into a single 32-bit integer payload drastically reduces the payload size and serialization time.

### Interfacing with Lower-Level Systems

You must use bitwise when interacting with hardware, reading raw file buffers, implementing cryptography, or parsing binary network protocols. Node.js native APIs (like the `fs` module for file permissions) and WebGL require bitmasks to communicate effectively with the underlying C++ or GPU layers.

## When to Avoid Bitwise

Bitwise operations are not a silver bullet. Although it has effiency on time and memory usage, some scenarios use can avoid use it for the following scenarios:

### Standard Business Logic

If you are building a standard web form or a typical CRUD backend, the microsecond performance gain is not worth the loss of readability. Stick to booleans for things like `user.isEmailVerified`.

### Small Numbers of States

If an object only has two or three simple properties, standard booleans are perfectly fine and easier for junior developers to read.

### More than 31 States (in JavaScript/TypeScript)

Because JavaScript bitwise operators treat numbers as 32-bit signed integers, you only have 31 bits available before the sign bit causes unexpected behavior. If you need 32 or more distinct flags, you must use `BigInt` bitwise operations or an array of integers, which adds complexity.

---

## Final Recap

> Sometimes, dropping down to the lowest level is the most elegant way to solve high-level performance problems.
