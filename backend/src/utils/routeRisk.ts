import type { AccessibleFacility } from "../models/AccessibleFacility";
import type { BarrierReport } from "../models/BarrierReport";
import {
  HIGHEST_RISK_LEVEL,
  LOWEST_RISK_LEVEL,
  RiskLevelRank,
  RiskLevelText,
  type RiskLevel as RiskLevelType
} from "../constants/RiskLevel";
import { ClosedBarrierVerifyStatus } from "../constants/BarrierVerifyStatus";
import { BarrierPriority, BarrierPriorityText } from "../constants/BarrierPriority";
import type { RouteRiskFactor, RouteRiskView } from "../types/RouteRisk";
import { RouteRiskPolicy } from "../constants/RiskPolicy";

export const maxRiskLevel = (a: RiskLevelType, b: RiskLevelType): RiskLevelType =>
  RiskLevelRank[a] >= RiskLevelRank[b] ? a : b;

/** 设施状态 -> 风险档位；UNKNOWN 及任何无法识别的状态一律按最保守的 HIGH */
export const facilityStatusRisk = (status: string | undefined): RiskLevelType => {
  if (status === "AVAILABLE") return "LOW";
  if (status === "MAINTENANCE") return "MEDIUM";
  if (status === "BLOCKED") return "HIGH";
  // UNKNOWN 与未知/缺失状态：最保守一档
  return HIGHEST_RISK_LEVEL;
};

/** 障碍上报是否已经关掉（关闭/驳回的终态不再抬级） */
export const isBarrierReportClosed = (verifyStatus: string): boolean =>
  (ClosedBarrierVerifyStatus as readonly string[]).includes(verifyStatus);

/** 未关闭上报的风险档位：高优先级 -> HIGH，可识别的其余优先级 -> MEDIUM，无法识别 -> HIGH */
export const openBarrierRisk = (priority: string): RiskLevelType => {
  if (priority === "HIGH") return "HIGH";
  if ((BarrierPriority as readonly string[]).includes(priority) && priority !== "HIGH") return "MEDIUM";
  return HIGHEST_RISK_LEVEL;
};

interface FactorDraft {
  kind: "FACILITY" | "BARRIER_REPORT";
  ref_id: number;
  facility_id: number;
  facility_name: string;
  level: RiskLevelType;
  reason: string;
}

/**
 * 依据路线选中的设施、以及这些设施上还没关掉的障碍上报算出风险等级。
 * 返回抬级因子清单（LOW 也记录为因子，但决定性因子只标记最高档）。
 */
export function evaluateRouteRisk(facilityIds: number[], facilities: AccessibleFacility[], reports: BarrierReport[], now: string = new Date().toISOString()) {
  const drafts: FactorDraft[] = [];
  let level: RiskLevelType = LOWEST_RISK_LEVEL;
  const seenFacility = new Set<number>();

  facilityIds.forEach((facilityId) => {
    if (seenFacility.has(facilityId)) return;
    seenFacility.add(facilityId);
    const facility = facilities.find((item) => item.id === facilityId);
    const facilityName = facility?.name ?? `设施#${facilityId}`;

    if (!facility) {
      level = maxRiskLevel(level, HIGHEST_RISK_LEVEL);
      drafts.push({
        kind: "FACILITY",
        ref_id: facilityId,
        facility_id: facilityId,
        facility_name: facilityName,
        level: HIGHEST_RISK_LEVEL,
        reason: "选中的设施在巡检记录中查不到，状态未知，按最保守的高风险处理"
      });
      return;
    }

    const facilityLevel = facilityStatusRisk(facility.status);
    level = maxRiskLevel(level, facilityLevel);
    drafts.push({
      kind: "FACILITY",
      ref_id: facility.id,
      facility_id: facility.id,
      facility_name: facility.name,
      level: facilityLevel,
      reason: facilityLevel === "LOW"
        ? `设施巡检状态为可用（${facility.status}）`
        : `设施巡检状态为 ${facility.status}，对应${RiskLevelText[facilityLevel]}`
    });
  });

  reports
    .filter((report) => facilityIds.includes(report.facility_id) && !isBarrierReportClosed(report.verify_status))
    .forEach((report) => {
      const facility = facilities.find((item) => item.id === report.facility_id);
      const facilityName = facility?.name ?? `设施#${report.facility_id}`;
      const reportLevel = openBarrierRisk(report.priority);
      level = maxRiskLevel(level, reportLevel);
      const priorityText = (BarrierPriorityText as Record<string, string>)[report.priority]
        ?? `未识别优先级（${report.priority || "空"}，按高风险处理）`;
      drafts.push({
        kind: "BARRIER_REPORT",
        ref_id: report.id,
        facility_id: report.facility_id,
        facility_name: facilityName,
        level: reportLevel,
        reason: `障碍上报 #${report.id} 尚未关闭（状态 ${report.verify_status}，${priorityText}）：${report.description}`
      });
    });

  const factors: RouteRiskFactor[] = drafts.map((draft) => ({
    ...draft,
    decisive: RiskLevelRank[draft.level] === RiskLevelRank[level] && RiskLevelRank[level] > RiskLevelRank[LOWEST_RISK_LEVEL]
  }));

  return { level, evaluated_at: now, factors };
}

/**
 * 组装路线列表 / 详情 / 风险说明面板共用的风险视图。
 * PEAK_HOLD：展示等级 = max(保存时峰值, 当前实时值)。
 */
export function buildRouteRiskView(
  saved: { level: RiskLevelType; evaluated_at: string; factors: RouteRiskFactor[] } | undefined,
  facilityIds: number[],
  facilities: AccessibleFacility[],
  reports: BarrierReport[],
  now: string = new Date().toISOString()
): RouteRiskView {
  const live = evaluateRouteRisk(facilityIds, facilities, reports, now);
  const fallbackSaved = saved ?? {
    level: LOWEST_RISK_LEVEL as RiskLevelType,
    evaluated_at: now,
    factors: live.factors.map((factor) => ({ ...factor, decisive: false }))
  };
  const level = maxRiskLevel(fallbackSaved.level, live.level);
  return {
    saved_level: fallbackSaved.level,
    live_level: live.level,
    level,
    policy: RouteRiskPolicy,
    saved_at: fallbackSaved.evaluated_at,
    live_evaluated_at: live.evaluated_at,
    saved_factors: markDecisive(fallbackSaved.factors, level),
    live_factors: markDecisive(live.factors, level),
    held_above_live: RiskLevelRank[fallbackSaved.level] > RiskLevelRank[live.level],
    live_exceeds_saved: RiskLevelRank[live.level] > RiskLevelRank[fallbackSaved.level]
  };
}

function markDecisive(factors: RouteRiskFactor[], level: RiskLevelType): RouteRiskFactor[] {
  return factors.map((factor) => ({
    ...factor,
    decisive: factor.level === level && level !== LOWEST_RISK_LEVEL
  }));
}
