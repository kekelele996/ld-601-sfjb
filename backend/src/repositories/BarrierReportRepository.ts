import { seed } from "../seed";
import type { BarrierReport } from "../models/BarrierReport";

export const barrierReportRepository = {
  findAll: (): BarrierReport[] => seed.barrierReport as unknown as BarrierReport[],
  findByFacilityIds: (facilityIds: number[]): BarrierReport[] =>
    (seed.barrierReport as unknown as BarrierReport[]).filter((report) => facilityIds.includes(report.facility_id)),
  save: (row: unknown) => row
};
