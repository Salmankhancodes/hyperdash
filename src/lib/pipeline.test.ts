import test from "node:test";
import assert from "node:assert/strict";

import {
  appendThroughputSample,
  applyDegradationLimit,
  MAX_RETAINED_EVENTS,
  mergeBufferedEvents,
} from "@/lib/pipeline";

test("mergeBufferedEvents keeps the newest retained events only", () => {
  const current = Array.from({ length: MAX_RETAINED_EVENTS - 2 }, (_, index) => index);
  const incoming = [MAX_RETAINED_EVENTS - 2, MAX_RETAINED_EVENTS - 1, MAX_RETAINED_EVENTS];

  const merged = mergeBufferedEvents(current, incoming, MAX_RETAINED_EVENTS);

  assert.equal(merged.length, MAX_RETAINED_EVENTS);
  assert.equal(merged[0], 1);
  assert.equal(merged.at(-1), MAX_RETAINED_EVENTS);
});

test("applyDegradationLimit admits full traffic when degradation is off", () => {
  const result = applyDegradationLimit(32, 120, false, 100);

  assert.deepEqual(result, {
    acceptedEvents: 32,
    droppedEvents: 0,
    nextSecondCount: 120,
  });
});

test("applyDegradationLimit drops only the overflow above the configured ceiling", () => {
  const result = applyDegradationLimit(32, 90, true, 100);

  assert.deepEqual(result, {
    acceptedEvents: 10,
    droppedEvents: 22,
    nextSecondCount: 100,
  });
});

test("appendThroughputSample keeps a bounded rolling window", () => {
  const history = [{ timestamp: 1, count: 100 }, { timestamp: 2, count: 200 }];

  const next = appendThroughputSample(history, { timestamp: 3, count: 300 }, 2);

  assert.deepEqual(next, [
    { timestamp: 2, count: 200 },
    { timestamp: 3, count: 300 },
  ]);
});