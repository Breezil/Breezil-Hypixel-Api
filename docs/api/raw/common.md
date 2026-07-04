# Common

The common module provides the safe field-reader helpers that the rest of the library is built on. Every parser reads raw Hypixel API JSON through these functions, so the defaults defined here are the defaults the whole library relies on. Each helper takes a possibly-`undefined` source object and a string key, performs no computation beyond a type guard, never throws, and returns a well-defined fallback when the value is missing or has the wrong type.

## num

Reads a numeric field from a raw object.

```ts
function num(obj: Record<string, unknown> | undefined, key: string): number;
```

Returns `obj[key]` when it is a `number`. Returns `0` when `obj` is `undefined`, when `key` is missing, or when the value is not a `number`.

## str

Reads a string field from a raw object.

```ts
function str(obj: Record<string, unknown> | undefined, key: string): string;
```

Returns `obj[key]` when it is a `string`. Returns `""` when `obj` is `undefined`, when `key` is missing, or when the value is not a `string`.

## bool

Reads a boolean field from a raw object.

```ts
function bool(obj: Record<string, unknown> | undefined, key: string): boolean;
```

Returns `true` only when `obj[key]` is strictly equal to `true`. Returns `false` in every other case — `undefined` object, missing key, `false`, or any non-`true` value (including truthy non-booleans such as `1` or `"true"`).

## obj

Reads a nested object field from a raw object, falling back to an empty object so callers can keep reading safely.

```ts
function obj(
  parent: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown>;
```

Returns `parent[key]` when it is a non-null, non-array `object`. Returns a new empty object (`{}`) when `parent` is `undefined`, when `key` is missing, when the value is `null`, when the value is an array, or when the value is any non-object.

## date

Reads an epoch-milliseconds field from a raw object as a `Date`.

```ts
function date(
  obj: Record<string, unknown> | undefined,
  key: string,
): Date | null;
```

Returns `new Date(obj[key])` when `obj[key]` is a `number` greater than `0`. Returns `null` when `obj` is `undefined`, when `key` is missing, when the value is not a `number`, or when the value is `<= 0`.
