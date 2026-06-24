import { create } from "zustand";
import {
  appendThroughputSample,
  MAX_RETAINED_EVENTS,
  type ThroughputSample,
  mergeBufferedEvents,
} from "@/lib/pipeline";

export interface EventData {
  value: number;
  source: 'worker' | 'main-thread';
  timestamp: number;
}

interface Snapshot {
  totalEvents: number;
  eventThisSec: number;
  eventsBuffer: EventData[];
  throughputHistory: ThroughputSample[];
  flushCount: number;
  droppedEvents: number;
  workerEnabled: boolean;
  batchInterval: number;
  eventRatePreset: 'normal' | 'high' | 'extreme';
  degradeEnabled: boolean;
  maxEventsPerSecond: number;
  pausedAt: number;
}

interface DrillWindow {
  start: number;  // timestamp ms
  end: number;    // timestamp ms
  source: string; // what triggered it (e.g. 'chart')
}

/** Captured performance baseline for Worker-ON vs Worker-OFF comparison. */
export interface Baseline {
  fps: number;
  throughput: number;          // eventThisSec at capture time
  droppedEvents: number;
  flushCount: number;
  avgProcessingMs: number;
  workerEnabled: boolean;
  eventRatePreset: 'normal' | 'high' | 'extreme';
  capturedAt: number;
}

interface EventState {
  eventThisSec: number;
  totalEvents: number;
  eventsBuffer: EventData[];
  throughputHistory: ThroughputSample[];
  workerEnabled: boolean;
  batchInterval: number;
  eventRatePreset: 'normal' | 'high' | 'extreme'
  degradeEnabled: boolean;
  maxEventsPerSecond: number;
  droppedEvents: number;
  isPaused: boolean;
  snapshot: Snapshot | null;
  drillWindow: DrillWindow | null;

  /* Performance comparison */
  fps: number;
  avgProcessingMs: number;
  baseline: Baseline | null;

  toggleWorker: () => void
  setBatchInterval: (ms: number) => void
  setEventThisSec: (val: number) => void;
  flushBatch: (events: EventData[]) => void;
  flushCount: number;
  setEventRatePreset: (rate: 'normal' | 'high' | 'extreme') => void;
  toggleDegrade: () => void;
  setMaxEventsPerSecond: (val: number) => void;
  incrementDroppedEvents: (val: number) => void;
  togglePause: () => void;
  startDrill: (window: DrillWindow) => void;
  endDrill: () => void;

  /* Performance comparison actions */
  setFps: (val: number) => void;
  setAvgProcessingMs: (val: number) => void;
  captureBaseline: () => void;
  clearBaseline: () => void;
}

const useEventStore = create<EventState>((set) => ({
  eventThisSec: 0,
  totalEvents: 0,
  eventsBuffer: [],
  throughputHistory: [],
  workerEnabled: true,
  batchInterval: 100,
  flushCount: 0,
  eventRatePreset: 'normal',
  degradeEnabled: false,
  maxEventsPerSecond: 100,
  droppedEvents: 0,
  isPaused: false,
  snapshot: null,
  drillWindow: null,

  /* Performance comparison defaults */
  fps: 0,
  avgProcessingMs: 0,
  baseline: null,
  incrementFlushCount: () =>
    set((state) => ({
      flushCount: state.flushCount + 1,
    })),
  setEventThisSec: (val) =>
    set((state) => ({
      eventThisSec: val,
      throughputHistory: appendThroughputSample(state.throughputHistory, {
        timestamp: Date.now(),
        count: val,
      }),
    })),
  toggleWorker: () => set((state) => {
    return {
      ...state,
      workerEnabled: !state.workerEnabled
    }
  }),
  setBatchInterval: (ms) => set({ batchInterval: ms }),

  // Single atomic flush: commit real events in ONE set() call
  flushBatch: (newEvents) =>
    set((state) => {
      return {
        flushCount: state.flushCount + 1,
        totalEvents: state.totalEvents + newEvents.length,
        eventsBuffer: mergeBufferedEvents(
          state.eventsBuffer,
          newEvents,
          MAX_RETAINED_EVENTS,
        ),
      };
    }),
  setEventRatePreset: (rate) => set({ eventRatePreset: rate }),
  toggleDegrade: () => set((state) => ({
    degradeEnabled: !state.degradeEnabled,
  })),
  setMaxEventsPerSecond: (val) => set({ maxEventsPerSecond: val }),
  incrementDroppedEvents: (val) =>
    set((state) => ({
      droppedEvents: state.droppedEvents + val,
    })),
  togglePause: () =>
    set((state) => {
      if (state.isPaused) {
        // Resume: discard snapshot
        return { isPaused: false, snapshot: null };
      }
      // Pause: capture snapshot
      return {
        isPaused: true,
        snapshot: {
          totalEvents: state.totalEvents,
          eventThisSec: state.eventThisSec,
          eventsBuffer: state.eventsBuffer,
          throughputHistory: state.throughputHistory,
          flushCount: state.flushCount,
          droppedEvents: state.droppedEvents,
          workerEnabled: state.workerEnabled,
          batchInterval: state.batchInterval,
          eventRatePreset: state.eventRatePreset,
          degradeEnabled: state.degradeEnabled,
          maxEventsPerSecond: state.maxEventsPerSecond,
          pausedAt: Date.now(),
        },
      };
    }),
  startDrill: (window) =>
    set((state) => ({
      drillWindow: window,
      // Reuse pause: freeze UI commits while drilling
      isPaused: true,
      snapshot: {
        totalEvents: state.totalEvents,
        eventThisSec: state.eventThisSec,
        eventsBuffer: state.eventsBuffer,
        throughputHistory: state.throughputHistory,
        flushCount: state.flushCount,
        droppedEvents: state.droppedEvents,
        workerEnabled: state.workerEnabled,
        batchInterval: state.batchInterval,
        eventRatePreset: state.eventRatePreset,
        degradeEnabled: state.degradeEnabled,
        maxEventsPerSecond: state.maxEventsPerSecond,
        pausedAt: Date.now(),
      },
    })),
  endDrill: () =>
    set({
      drillWindow: null,
      isPaused: false,
      snapshot: null,
    }),

  /* Performance comparison actions */
  setFps: (val) => set({ fps: val }),
  setAvgProcessingMs: (val) => set({ avgProcessingMs: val }),
  captureBaseline: () =>
    set((state) => ({
      baseline: {
        fps: state.fps,
        throughput: state.eventThisSec,
        droppedEvents: state.droppedEvents,
        flushCount: state.flushCount,
        avgProcessingMs: state.avgProcessingMs,
        workerEnabled: state.workerEnabled,
        eventRatePreset: state.eventRatePreset,
        capturedAt: Date.now(),
      },
    })),
  clearBaseline: () => set({ baseline: null }),
}));

export default useEventStore;