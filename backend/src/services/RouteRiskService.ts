import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { RISK_LEVEL_RANK, RiskLevel } from "../constants/RiskLevel";
import { CLOSED_BARRIER_VERIFY_STATUSES } from "../constants/BarrierVerifyStatus";
import type { RouteRiskFacilityContributor, RouteRiskReportContributor } from "../models/RoutePlan";

// 设施状态到风险档位的映射；状态未知（UNKNOWN 或无法识别的值）一律按最保守档处理。
const FACILITY_STATUS_LEVEL: Record<string, RiskLevel> = {
  AVAILABLE: "LOW",
  MAINTENANCE: "MEDIUM",
  BLOCKED: "HIGH",
  UNKNOWN: "CRITICAL"
};

const facilityLevelOf = (status: string | undefined | null): RiskLevel =>
  (status && FACILITY_STATUS_LEVEL[status]) || "CRITICAL";

const levelOfRank = (rank: number): RiskLevel => {
  const hit = Object.entries(RISK_LEVEL_RANK).find(([, value]) => value === rank);
  return (hit?.[0] as RiskLevel | undefined) ?? "CRITICAL";
};

export interface RouteRiskEvaluation {
  computedLevel: RiskLevel;
  openReportBoost: number;
  facilities: RouteRiskFacilityContributor[];
  reports: RouteRiskReportContributor[];
}

export const routeRiskService = {
  // 规则：设施状态定基准档（取最高），未关闭障碍上报按数量抬级（1 条 +1、≥2 条 +2），封顶 CRITICAL。
  evaluateRouteRisk(facilityIds: number[] = []): RouteRiskEvaluation {
    const facilities = accessibleFacilityRepository.findAll();
    const facilityContributors: RouteRiskFacilityContributor[] = facilityIds.map((id) => {
      const facility = facilities.find((row) => row.id === id);
      // 设施记录缺失同样视为状态未知，按最保守档计。
      const status: string = facility?.status ?? "UNKNOWN";
      return { id, name: facility?.name ?? `设施#${id}`, status, level: facilityLevelOf(status) };
    });
    const reports: RouteRiskReportContributor[] = barrierReportRepository
      .findAll()
      .filter((report) => facilityIds.includes(report.facility_id) && !CLOSED_BARRIER_VERIFY_STATUSES.includes(report.verify_status))
      .map((report) => ({ id: report.id, facility_id: report.facility_id, verify_status: report.verify_status }));
    const baseRank = facilityContributors.reduce((max, item) => Math.max(max, RISK_LEVEL_RANK[item.level as RiskLevel] ?? 0), 0);
    const openReportBoost = reports.length >= 2 ? 2 : reports.length === 1 ? 1 : 0;
    const computedLevel = levelOfRank(Math.min(baseRank + openReportBoost, RISK_LEVEL_RANK.CRITICAL));
    return { computedLevel, openReportBoost, facilities: facilityContributors, reports };
  },

  // STICKY_HIGH：与历史等级取高。设施恢复可用、上报关闭后，等级不当场回落，
  // 避免出行者在设施刚恢复、数据尚未复核时收到过于乐观的风险提示。
  applyStickyPolicy(previousLevel: string | undefined | null, computedLevel: RiskLevel): RiskLevel {
    const previousRank = RISK_LEVEL_RANK[previousLevel as RiskLevel] ?? RISK_LEVEL_RANK.LOW;
    return previousRank > RISK_LEVEL_RANK[computedLevel] ? (previousLevel as RiskLevel) : computedLevel;
  }
};
