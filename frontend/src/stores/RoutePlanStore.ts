import { create } from "zustand";
import { getRoutePlan, listRoutePlan, saveRoutePlan } from "../api/RoutePlan";
import type { RoutePlan, RoutePlanPayload } from "../types/RoutePlan";

type State = {
  rows: RoutePlan[];
  loading: boolean;
  saving: boolean;
  selectedId: number | null;
  selected: RoutePlan | null;
  load: () => Promise<void>;
  select: (id: number | null) => Promise<void>;
  save: (payload: RoutePlanPayload) => Promise<RoutePlan>;
};

export const useRoutePlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  saving: false,
  selectedId: null,
  selected: null,
  async load() {
    set({ loading: true });
    try {
      set({ rows: await listRoutePlan(), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async select(id) {
    if (id === null) {
      set({ selectedId: null, selected: null });
      return;
    }
    set({ selectedId: id, selected: await getRoutePlan(id) });
  },
  async save(payload) {
    set({ saving: true });
    try {
      const saved = await saveRoutePlan(payload);
      set((state) => ({ rows: [saved, ...state.rows], saving: false, selectedId: saved.id, selected: saved }));
      await get().load();
      return saved;
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  }
}));
