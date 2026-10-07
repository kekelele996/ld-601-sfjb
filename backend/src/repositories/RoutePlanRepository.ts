import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";

const rows: RoutePlan[] = seed.routePlan.map((row) => ({
  ...(row as unknown as RoutePlan),
  facility_ids: [...row.facility_ids]
}));

export const routePlanRepository = {
  findAll: (): RoutePlan[] => [...rows],
  findById: (id: number): RoutePlan | undefined => rows.find((row) => row.id === id),
  save(row: RoutePlan): RoutePlan {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    return row;
  },
  nextId: (): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
