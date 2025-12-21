import { create } from 'zustand';

interface EventState {
  eventThisSec: number;
  totalEvents: number;
  setEventThisSec: (newValue: number) => void;
  incrementTotalEvents: (newValue: number) => void;
}

const useEventStore = create<EventState>((set) => ({
  eventThisSec: 0,
  totalEvents: 0,

  setEventThisSec: (newValue: number) =>
    set({ eventThisSec: newValue }),

  incrementTotalEvents: (newValue: number) =>
    set((state) => ({ totalEvents: state.totalEvents + newValue })),
}));

export default useEventStore;