'use strict';

const Code = require('@hapi/code');
const Heavy = require('..');
const Hoek = require('@hapi/hoek');
const Lab = require('@hapi/lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Heavy', () => {

    it('requires load interval when maxEventLoopDelay is set', () => {

        expect(() => new Heavy({ sampleInterval: 0, maxEventLoopDelay: 10, maxEventLoopUtilization: 0, maxHeapUsedBytes: 0, maxRssBytes: 0 })).to.throw('Load sample interval must be set to enable load limits');
    });

    it('requires load interval when maxEventLoopUtilization is set', () => {

        expect(() => new Heavy({ sampleInterval: 0, maxEventLoopDelay: 0, maxEventLoopUtilization: 10, maxHeapUsedBytes: 0, maxRssBytes: 0 })).to.throw('Load sample interval must be set to enable load limits');
    });

    it('requires load interval when maxHeapUsedBytes is set', () => {

        expect(() => new Heavy({ sampleInterval: 0, maxEventLoopDelay: 0, maxEventLoopUtilization: 0, maxHeapUsedBytes: 10, maxRssBytes: 0 })).to.throw('Load sample interval must be set to enable load limits');
    });

    it('requires load interval when maxRssBytes is set', () => {

        expect(() => new Heavy({ sampleInterval: 0, maxEventLoopDelay: 0, maxEventLoopUtilization: 0, maxHeapUsedBytes: 0, maxRssBytes: 10 })).to.throw('Load sample interval must be set to enable load limits');
    });

    const sleep = function (msec) {

        const start = Date.now();
        while (Date.now() - start < msec) { }
    };

    it('measures load', async () => {

        const heavy = new Heavy({ sampleInterval: 4 });
        heavy.start();

        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(5);
        await Hoek.wait(0);
        sleep(5);
        expect(heavy.load.eventLoopDelay).to.be.above(0);

        await Hoek.wait(0);
        sleep(5);

        expect(heavy.load.eventLoopDelay).to.be.above(0);
        expect(heavy.load.eventLoopUtilization).to.be.above(0);
        expect(heavy.load.heapUsed).to.be.above(1024 * 1024);
        expect(heavy.load.rss).to.be.above(1024 * 1024);
        heavy.stop();
    });

    it('ignores load when sample is zero', () => {

        const heavy = new Heavy({ sampleInterval: 0 });
        heavy.start();
        heavy.check();
        heavy.stop();
    });

    it('throws when process not started', () => {

        const heavy = new Heavy({ sampleInterval: 5, maxRssBytes: 1 });

        expect(() => heavy.check()).to.throw('Cannot check load when sampler is not started');
    });

    it('fails check due to high rss load', async () => {

        const heavy = new Heavy({ sampleInterval: 5, maxRssBytes: 1 });

        heavy.start();
        expect(() => heavy.check()).to.not.throw();

        await Hoek.wait(10);

        expect(() => heavy.check()).to.throw('Server under heavy load (rss)');
        expect(heavy.load.rss).to.be.above(10000);
        heavy.stop();
    });

    it('fails check due to high heap load', async () => {

        const heavy = new Heavy({ sampleInterval: 5, maxHeapUsedBytes: 1 });

        heavy.start();
        expect(() => heavy.check()).to.not.throw();

        await Hoek.wait(10);

        expect(() => heavy.check()).to.throw('Server under heavy load (heap)');
        expect(heavy.load.heapUsed).to.be.above(0);
        heavy.stop();
    });

    it('fails check due to high event loop delay load (delayed measure)', () => {

        const heavy = new Heavy({ sampleInterval: 1, maxEventLoopDelay: 5 });

        heavy.start();

        expect(() => heavy.check()).to.not.throw();
        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(10);

        expect(() => heavy.check()).to.throw('Server under heavy load (event loop)');
        expect(heavy.load.eventLoopDelay).to.be.above(0);
        heavy.stop();
    });

    it('fails check due to high event loop utilization value', async () => {

        const heavy = new Heavy({ sampleInterval: 1, maxEventLoopUtilization: 0.1 });

        heavy.start();

        expect(() => heavy.check()).to.not.throw();
        expect(heavy.load.eventLoopUtilization).to.equal(0);

        await Hoek.wait(0);
        sleep(500);

        expect(() => heavy.check()).to.throw('Server under heavy load (event loop utilization)');
        expect(heavy.load.eventLoopUtilization).to.be.above(0);
        heavy.stop();
    });

    it('disabled by default', async () => {

        const heavy = new Heavy();

        heavy.start();
        await Hoek.wait(0);

        expect(heavy.load.rss).to.equal(0);
        expect(() => heavy.check()).to.not.throw();
        heavy.stop();
    });
});
