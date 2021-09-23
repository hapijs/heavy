# `new Heavy(options)`

Creates a new heavy instance where:

- `options`
  - `sampleInterval` - frequency of load sampling in milliseconds. Defaults to `0` (no sampling).
  - `maxHeapUsedBytes` - maximum V8 heap size bytes. Defaults to `0` (no limit).
  - `maxRssBytes` - maximum process RSS size bytes. Defaults to `0` (no limit).
  - `maxEventLoopDelay` - maximum event loop delay duration in milliseconds. Defaults to `0` (no limit).

Returns a new `Heavy` object.

## `heavy.start()`

Starts the sampling operation with `sampleInterval` frequency. When `sampleInterval` is `0`, this operation does nothing.

## `heavy.stop()`

Stops the sampling operation.

## `heavy.check()`

Verifies the current process load and throws a [server unavailable](https://hapi.dev/module/boom/api?#boomserverunavailablemessage-data)
error when any of the configured limits is exceeded. The current process load is assigned to `error.data`.
When `sampleInterval` is `0`, this operation does nothing.

## `heavy.load`

Object with the current process load:

- `eventLoopDelay` - current event loop delay milliseconds.
- `heapUsed` - current V8 heap size bytes.
- `rss` - current process RSS size bytes.
