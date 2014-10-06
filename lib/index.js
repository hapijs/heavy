// Load modules

var Hoek = require('hoek');
var Joi = require('joi');


// Declare internals

var internals = {};


internals.schema = Joi.object({
    maxHeapUsedBytes: Joi.number().min(0),
    maxEventLoopDelay: Joi.number().min(0),
    maxRssBytes: Joi.number().min(0),
    sampleInterval: Joi.number().min(0)
});


internals.defaults = {
    maxHeapUsedBytes: 0,                        // Reject requests when V8 heap is over size in bytes (zero is no max)
    maxRssBytes: 0,                             // Reject requests when process RSS is over size in bytes (zero is no max)
    maxEventLoopDelay: 0,                       // Milliseconds of delay after which requests are rejected (zero is no max)
    sampleInterval: 0                           // Frequency of load sampling in milliseconds (zero is no sampling)
};


exports = module.exports = internals.Heavy = function (options) {

    options = options || {};

    Joi.assert(options, internals.schema, 'Invalid load monitoring options');
    Hoek.assert(options.sampleInterval || (!options.maxEventLoopDelay && !options.maxHeapUsedBytes && !options.maxRssBytes), 'Load sample interval must be set to enable load limits');

    this.settings = Hoek.applyToDefaults(internals.defaults, options);

    this._eventLoopTimer = null;
    this._loadBench = new Hoek.Bench();
    this.load = {
        eventLoopDelay: 0,
        heapUsed: 0,
        rss: 0
    };
};


internals.Heavy.prototype.start = function () {

    var self = this;

    if (!this.settings.sampleInterval) {
        return;
    }

    var loopSample = function () {

        self._loadBench.reset();
        var measure = function () {

            var mem = process.memoryUsage();

            // Retain the same this.load object to keep external references valid

            self.load.eventLoopDelay = (self._loadBench.elapsed() - self.settings.sampleInterval);
            self.load.heapUsed = mem.heapUsed;
            self.load.rss = mem.rss;

            loopSample();
        };

        self._eventLoopTimer = setTimeout(measure, self.settings.sampleInterval);
    };

    loopSample();
};


internals.Heavy.prototype.stop = function () {

    clearTimeout(this._eventLoopTimer);
};


internals.Heavy.prototype.check = function () {

    if (!this.settings.sampleInterval) {
        return true;
    }

    var elapsed = this._loadBench.elapsed();
    if (elapsed > this.settings.sampleInterval) {
        this.load.eventLoopDelay = Math.max(this.load.eventLoopDelay, elapsed - this.settings.sampleInterval);
    }

    return (!this.settings.maxEventLoopDelay || this.load.eventLoopDelay <= this.settings.maxEventLoopDelay) &&
           (!this.settings.maxHeapUsedBytes || this.load.heapUsed <= this.settings.maxHeapUsedBytes) &&
           (!this.settings.maxRssBytes || this.load.rss <= this.settings.maxRssBytes);
};