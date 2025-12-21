import { create } from "zustand";

const MAX_EVENTS = 5000;

interface EventState {
  eventThisSec: number;
  totalEvents: number;
  eventsBuffer: number[];

  setEventThisSec: (val: number) => void;
  incrementTotalEvents: (val: number) => void;
  pushEvents: (count: number) => void;
}

const useEventStore = create<EventState>((set) => ({
  eventThisSec: 0,
  totalEvents: 0,
  eventsBuffer: [],

  setEventThisSec: (val) => set({ eventThisSec: val }),

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