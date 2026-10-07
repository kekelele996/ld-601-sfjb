import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";
import type { RouteRiskFactor } from "../types/RouteRisk";
import type { RiskLevel } from "../constants/RiskLevel";
import { evaluateRouteRisk } from "../utils/routeRisk";
import { accessibleFacilityRepository } from "./AccessibleFacilityRepository";
import { barrierReportRepository } from "./BarrierReportRepository";

type SeedRoute = Omit<RoutePlan, "risk_policy"> & {
  risk_policy?: RoutePlan["risk_policy"];
  risk_evaluated_at?: string;
  risk_factors?: RouteRiskFactor[];
};

/**
 * 内存持久化（本项目数据全部来自本地种子）。
 * 种子路线若带保存时风险快照则直接沿用（可表达「当时 HIGH、现已回落」的历史高位）；
 * 没带快照的，加载时统一按当时数据补算一次并锁定。
 */
function hydrateSeedRows(): RoutePlan[] {
  const facilities = accessibleFacilityRepository.findAll();
  const reports = barrierReportRepository.findAll();
  return (seed.routePlan as unknown as SeedRoute[]).map((row) => {
    const hasSnapshot = Array.isArray(row.risk_factors) && row.risk_factors.length > 0;
    const snapshot = hasSnapshot
      ? { level: row.risk_level as RiskLevel, evaluated_at: row.risk_evaluated_at ?? row.created_at, factors: row.risk_factors as RouteRiskFactor[] }
      : evaluateRouteRisk(row.facility_ids, facilities, reports, row.created_at);
    return {
      ...row,
      risk_level: snapshot.level,
      estimated_minutes: typeof row.estimated_minutes === "number" ? row.estimated_minutes : Number(row.estimated_minutes) || 0,
      risk_policy: row.risk_policy ?? "PEAK_HOLD",
      risk_evaluated_at: snapshot.evaluated_at,
      risk_factors: snapshot.factors
    };
  });
}

let rows: RoutePlan[] = hydrateSeedRows();
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const routePlanRepository = {
  findAll: (): RoutePlan[] => rows,
  findById: (id: number): RoutePlan | undefined => rows.find((row) => row.id === id),
  insert(row: RoutePlan): RoutePlan {
    const stored: RoutePlan = { ...row, id: nextId++ };
    rows = [...rows, stored];
    return stored;
  },
  update(id: number, patch: Partial<RoutePlan>): RoutePlan | undefined {
    let updated: RoutePlan | undefined;
    rows = rows.map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch, id: row.id };
      return updated;
    });
    return updated;
  }
};
