import { create } from "zustand";
import { listRoutePlan, saveRoutePlan } from "../api/RoutePlan";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RoutePlan } from "../types/RoutePlan";

type State = {
  rows: RoutePlan[];
  loading: boolean;
  load: () => Promise<void>;
  create: (payload: RoutePlan) => Promise<RoutePlan>;
};

export const useRoutePlanStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRoutePlan(), loading: false });
  },
  async create(payload) {
    set({ loading: true });
    const saved = await saveRoutePlan(payload);
    console.info(LOG_TEMPLATES.RoutePlan[4], saved.id, saved.risk_level);
    set((state) => ({ rows: [...state.rows.filter((row) => row.id !== saved.id), saved], loading: false }));
    return saved;
  }
}));
