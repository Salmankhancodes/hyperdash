import { create } from "zustand";

const MAX_EVENTS = 2000;

interface EventState {
  eventThisSec: number;
  totalEvents: number;
  eventsBuffer: number[];
  workerEnabled: boolean;
  batchInterval: number;
  eventRatePreset: 'normal' | 'high' | 'extreme'
  toggleWorker: () => void
  setBatchInterval: (ms: number) => void
  setEventThisSec: (val: number) => void;
  incrementTotalEvents: (val: number) => void;
  pushEvents: (count: number) => void;
  flushCount: number;
  incrementFlushCount: () => void;
  setEventRatePreset: (rate: 'normal' | 'high' | 'extreme') => void;
}

const useEventStore = create<EventState>((set) => ({
  eventThisSec: 0,
  totalEvents: 0,
  eventsBuffer: [],
  workerEnabled: true,
  batchInterval: 500,
  flushCount: 0,
  eventRatePreset: 'normal',
  incrementFlushCount: () =>
    set((state) => ({
      flushCount: state.flushCount + 1,
    })),
  setEventThisSec: (val) => set({ eventThisSec: val }),
  toggleWorker: () => set((state) => {
    return {
      ...state,
      workerEnabled: !state.workerEnabled
    }
  }),
  setBatchInterval: (ms) => set({ batchInterval: ms }),
  incrementTotalEvents: (val) =>
    set((state) => ({
      totalEvents: state.totalEvents + val,
    })),

  pushEvents: (count) =>
    set((state) => {
      const newEvents = Array.from({ length: count }, () => Math.floor(Math.random() * 100));

      const merged = [...state.eventsBuffer, ...newEvents];

      return {
        eventsBuffer:
          merged.length > MAX_EVENTS
            ? merged.slice(merged.length - MAX_EVENTS)
            : merged,
      };
    }),
  setEventRatePreset: (rate) => set({ eventRatePreset: rate }),
}));

export default useEventStore;