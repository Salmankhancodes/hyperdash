import { create } from "zustand";

const MAX_EVENTS = 5000;

interface EventState {
  eventThisSec: number;
  totalEvents: number;
  eventsBuffer: number[];
  workerEnabled: boolean;
  batchInterval: number
  toggleWorker: () => void
  setBatchInterval: (ms: number) => void
  setEventThisSec: (val: number) => void;
  incrementTotalEvents: (val: number) => void;
  pushEvents: (count: number) => void;
}

const useEventStore = create<EventState>((set) => ({
  eventThisSec: 0,
  totalEvents: 0,
  eventsBuffer: [],
  workerEnabled: false,
  batchInterval: 10,
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
      const newEvents = Array.from({ length: count }, () => Date.now());

      const merged = [...state.eventsBuffer, ...newEvents];

      return {
        eventsBuffer:
          merged.length > MAX_EVENTS
            ? merged.slice(merged.length - MAX_EVENTS)
            : merged,
      };
    }),
}));

export default useEventStore;