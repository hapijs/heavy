// Load modules

var Lab = require('lab');
var Heavy = require('..');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;


describe('Heavy', { parallel: false }, function () {

    it('requires load interval when maxEventLoopDelay is set', function (done) {

        expect(function () {

            new Heavy({ sampleInterval: 0, maxEventLoopDelay: 10, maxHeapUsedBytes: 0, maxRssBytes: 0 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    it('requires load interval when maxHeapUsedBytes is set', function (done) {

        expect(function () {

            new Heavy({ sampleInterval: 0, maxEventLoopDelay: 0, maxHeapUsedBytes: 10, maxRssBytes: 0 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    it('requires load interval when maxRssBytes is set', function (done) {

        expect(function () {

            new Heavy({ sampleInterval: 0, maxEventLoopDelay: 0, maxHeapUsedBytes: 0, maxRssBytes: 10 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    var sleep = function (msec) {

        var start = Date.now();
        while (Date.now() - start < msec);
    };

    it('measures load', function (done) {

        var heavy = new Heavy({ sampleInterval: 4 });
        heavy.start();

        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(5);
        setImmediate(function () {

            sleep(5);
            expect(heavy.load.eventLoopDelay).to.be.above(0);

            setImmediate(function () {

                sleep(5);

                expect(heavy.load.eventLoopDelay).to.be.above(0);
                expect(heavy.load.heapUsed).to.be.above(1024 * 1024);
                expect(heavy.load.rss).to.be.above(1024 * 1024);
                heavy.stop();
                done();
            });
        });
    });

    it('rejects request due to high rss load', function (done) {

        var heavy = new Heavy({ sampleInterval: 5, maxRssBytes: 1 });
        heavy.start();
        expect(heavy.check()).to.equal(true);

        setTimeout(function () {

            expect(heavy.check()).to.equal(false);
            expect(heavy.load.rss).to.be.above(10000);
            heavy.stop();
            done();
        }, 10);
    });

    it('rejects request due to high heap load', function (done) {

        var heavy = new Heavy({ sampleInterval: 5, maxHeapUsedBytes: 1 });
        heavy.start();
        expect(heavy.check()).to.equal(true);

        setTimeout(function () {

            expect(heavy.check()).to.equal(false);
            expect(heavy.load.heapUsed).to.be.above(0);
            heavy.stop();
            done();
        }, 10);
    });

    it('rejects request due to high event loop delay load', function (done) {

        var heavy = new Heavy({ sampleInterval: 1, maxEventLoopDelay: 5 });
        heavy.start();

        expect(heavy.check()).to.equal(true);
        expect(heavy.load.eventLoopDelay).to.equal(0);
        setImmediate(function () {

            sleep(10);

            setImmediate(function () {

                expect(heavy.check()).to.equal(false);
                expect(heavy.load.eventLoopDelay).to.be.above(0);
                heavy.stop();
                done();
            });
        });
    });

    it('rejects request due to high event loop delay load (delayed measure)', function (done) {

        var heavy = new Heavy({ sampleInterval: 1, maxEventLoopDelay: 5 });
        heavy.start();

        expect(heavy.check()).to.equal(true);
        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(10);

        expect(heavy.check()).to.equal(false);
        expect(heavy.load.eventLoopDelay).to.be.above(0);
        heavy.stop();
        done();
    });

    it('disabled by default', function (done) {

        var heavy = new Heavy();
        heavy.start();
        setImmediate(function () {

            expect(heavy.load.rss).to.equal(0);
            expect(heavy.check()).to.equal(true);
            heavy.stop();
            done();
        });
    });
});
