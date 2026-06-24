export const MAX_RETAINED_EVENTS = 20000;
export const MAX_THROUGHPUT_SAMPLES = 10;

export interface ThroughputSample {
  timestamp: number;
  count: number;
}

export function mergeBufferedEvents<T>(
  current: T[],
  incoming: T[],
  maxEvents = MAX_RETAINED_EVENTS,
) {
  const merged = [...current, ...incoming];

  if (merged.length <= maxEvents) {
    return merged;
  }

  return merged.slice(merged.length - maxEvents);
}

export function appendThroughputSample(
  history: ThroughputSample[],
  sample: ThroughputSample,
  maxSamples = MAX_THROUGHPUT_SAMPLES,
) {
  const nextHistory = [...history, sample];

  if (nextHistory.length <= maxSamples) {
    return nextHistory;
  }

  return nextHistory.slice(nextHistory.length - maxSamples);
}

export function applyDegradationLimit(
  requestedEvents: number,
  currentSecondCount: number,
  degradeEnabled: boolean,
  maxEventsPerSecond: number,
) {
  if (!degradeEnabled) {
    return {
      acceptedEvents: requestedEvents,
      droppedEvents: 0,
      nextSecondCount: currentSecondCount,
    };
  }

  const remainingCapacity = Math.max(maxEventsPerSecond - currentSecondCount, 0);
  const acceptedEvents = Math.min(requestedEvents, remainingCapacity);

  return {
    acceptedEvents,
    droppedEvents: requestedEvents - acceptedEvents,
    nextSecondCount: currentSecondCount + acceptedEvents,
  };
}

export function averageOf(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}