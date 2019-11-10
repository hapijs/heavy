/// <reference types="node" />

declare namespace Heavy {
    /**
     * unsigned integer
     */
    export type uint = number
    export type milliseconds = uint
    export type bytes = number

    /**
     * Configuration options for Heavy
     */
    export type Options = {
        /**
         * Frequency of load sampling in milliseconds (zero is no sampling)
         */
        sampleInterval?: milliseconds
        /**
         * Reject requests when V8 heap is over size in bytes (zero is no max)
         */
        maxHeapUsedBytes?: bytes
        /**
         * Reject requests when process RSS is over size in bytes (zero is no max)
         */
        maxEventLoopDelay?: milliseconds
        /**
         * Milliseconds of delay after which requests are rejected (zero is no max)
         */
        maxRssBytes?: bytes
    }

    /**
     * Current load of the process
     */
    export type Load = {
        /**
         * Time, in milliseconds, since the event loop executed the sampling function.
         * This indicates how delayed the event loop is delayed in executing code on
         * the main event-loop thread.
         */
        eventLoopDelay: milliseconds,
        /**
         * "heapUsed refer to V8's memory usage. [...]
         * The heap is where objects, strings, and closures are stored.
         * Variables are stored in the stack and the actual JavaScript
         * code resides in the code segment."
         * https://nodejs.org/api/process.html#process_process_memoryusage
         */
        heapUsed: bytes,
        /**
         * "Resident Set Size, is the amount of space occupied in the main memory
         * device (that is a subset of the total allocated memory) for the process,
         * which includes the heap, code segment and stack."
         * https://nodejs.org/api/process.html#process_process_memoryusage
         */
        rss: bytes,
    }
}

/**
 * Measure process load.
 *
 * Usage:
 *      const heavy = new Heavy()
 *      heavy.start()
 *      heavy.check() -- throws Boom Error if overloaded
 */
declare class Heavy {
    /**
     * Create a new instance of Heavy
     * @param {"@hapi/heavy".Heavy.Options} options
     */
    constructor(options?: Heavy.Options)

    /**
     * Current load statistics
     */
    public load: Heavy.Load

    /**
     * Start sampling the process for load.
     */
    public start(): void

    /**
     * Stop sampling the process for load.
     */
    public stop(): void

    /**
     * Check the process for load.
     * @throws {Error} Boom "Unavailable" Error
     */
    public check(): void
}

export = Heavy
