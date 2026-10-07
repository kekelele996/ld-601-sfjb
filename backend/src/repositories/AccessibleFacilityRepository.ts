import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";

export const accessibleFacilityRepository = {
  findAll: (): AccessibleFacility[] => seed.accessibleFacility as unknown as AccessibleFacility[],
  findByIds: (ids: number[]): AccessibleFacility[] =>
    (seed.accessibleFacility as unknown as AccessibleFacility[]).filter((item) => ids.includes(item.id)),
  save: (row: unknown) => row
};
