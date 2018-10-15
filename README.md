# Heavy

Measure process load.

[![Build Status](https://secure.travis-ci.org/hapijs/heavy.png)](http://travis-ci.org/hapijs/heavy)

## Example

```
  const Heavy = require('heavy')

  let interval = 1000,
      threshold = 40,
      logInterval = null;

  intervalHandler = () => {

    if (heavy.load && heavy.load.eventLoopDelay > threshold) {
      
      let info = {
          threshold: threshold,
          event_loop_delay: heavy.load.eventLoopDelay,
          heap_used: heavy.load.heapUsed,
          rss: heavy.load.rss
        };

      console.error(info);

    }

  };

  heavy = new Heavy({
      sampleInterval: interval // Frequency of load sampling in milliseconds (zero is no sampling)
      maxHeapUsedBytes: 0, // Reject requests when V8 heap is over size in bytes (zero is no max)
      maxRssBytes: 0, // Reject requests when process RSS is over size in bytes (zero is no max)
      maxEventLoopDelay: 0 // Milliseconds of delay after which requests are rejected (zero is no max)
    });

  heavy.start();

  if (logInterval) {
    clearInterval(logInterval);
  }

  logInterval = setInterval(intervalHandler, interval);
```

Lead Maintainer - [Eran Hammer](https://github.com/hueniverse)
