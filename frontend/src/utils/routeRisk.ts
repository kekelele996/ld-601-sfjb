import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { BarrierReport } from "../types/BarrierReport";
import type { RoutePlan } from "../types/RoutePlan";
import {
  DEFAULT_RISK_POLICY,
  RISK_LEVEL_RANK,
  RiskLevel,
  RiskPolicyText,
  type RiskPolicy
} from "../constants/RiskLevel";
import { BarrierVerifyStatusText, CLOSED_BARRIER_VERIFY_STATUSES, type BarrierVerifyStatus } from "../constants/BarrierVerifyStatus";
import { formatRisk, formatStatus } from "./formatters";

// 与 backend/src/services/RouteRiskService.ts 保持同一套规则：
// 设施状态定基准档，未关闭障碍上报按数量抬级，状态未知一律按最保守档。
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
  facilities: { id: number; name: string; status: string; level: RiskLevel }[];
  reports: { id: number; facility_id: number; verify_status: string }[];
}

export function evaluateRouteRisk(facilityIds: number[], facilities: AccessibleFacility[], reports: BarrierReport[]): RouteRiskEvaluation {
  const facilityContributors = facilityIds.map((id) => {
    const facility = facilities.find((row) => row.id === id);
    // 设施记录缺失同样视为状态未知，按最保守档计。
    const status = facility?.status ?? "UNKNOWN";
    return { id, name: facility?.name ?? `设施#${id}`, status, level: facilityLevelOf(status) };
  });
  const openReports = reports
    .filter((report) => facilityIds.includes(report.facility_id) && !CLOSED_BARRIER_VERIFY_STATUSES.includes(report.verify_status))
    .map((report) => ({ id: report.id, facility_id: report.facility_id, verify_status: report.verify_status }));
  const baseRank = facilityContributors.reduce((max, item) => Math.max(max, RISK_LEVEL_RANK[item.level]), 0);
  const openReportBoost = openReports.length >= 2 ? 2 : openReports.length === 1 ? 1 : 0;
  const computedLevel = levelOfRank(Math.min(baseRank + openReportBoost, RISK_LEVEL_RANK.CRITICAL));
  return { computedLevel, openReportBoost, facilities: facilityContributors, reports: openReports };
}

// STICKY_HIGH：与历史等级取高，设施恢复、上报关闭后不当场回落。
export function applyStickyPolicy(previousLevel: string | undefined | null, computedLevel: RiskLevel): RiskLevel {
  const previousRank = RISK_LEVEL_RANK[previousLevel as RiskLevel] ?? RISK_LEVEL_RANK.LOW;
  return previousRank > RISK_LEVEL_RANK[computedLevel] ? (previousLevel as RiskLevel) : computedLevel;
}

// 离线回退时使用：为没有风险快照的路线（手填老数据或本地新建）补算快照，
// 手填/既有等级视作历史高位参与 STICKY_HIGH 合并。
export function ensureLocalRiskSnapshot(row: RoutePlan, facilities: AccessibleFacility[], reports: BarrierReport[]): RoutePlan {
  if (row.risk_snapshot) return row;
  const evaluation = evaluateRouteRisk(row.facility_ids ?? [], facilities, reports);
  const level = applyStickyPolicy(row.risk_level, evaluation.computedLevel);
  return {
    ...row,
    risk_level: level,
    risk_policy: DEFAULT_RISK_POLICY,
    risk_snapshot: {
      level,
      computed_level: evaluation.computedLevel,
      policy: DEFAULT_RISK_POLICY,
      open_report_boost: evaluation.openReportBoost,
      facilities: evaluation.facilities,
      reports: evaluation.reports,
      computed_at: new Date().toISOString()
    }
  };
}

export interface RouteRiskView {
  level: string;
  levelText: string;
  computedLevel: string;
  computedLevelText: string;
  policy: RiskPolicy;
  policyText: string;
  heldByStickyPolicy: boolean;
  openReportBoost: number;
  facilityContributors: { id: number; name: string; status: string; statusText: string; level: string; levelText: string; raisesRisk: boolean }[];
  reportContributors: { id: number; facilityId: number; verifyStatus: string; verifyStatusText: string }[];
  reasons: string[];
}

// 把路线上保存的风险快照格式化成展示模型，路线详情与 RouteRiskPanel 共用它。
export function buildRouteRiskView(route: RoutePlan | null | undefined): RouteRiskView | null {
  if (!route) return null;
  const snapshot = route.risk_snapshot ?? null;
  const level = snapshot?.level ?? route.risk_level;
  const computedLevel = snapshot?.computed_level ?? route.risk_level;
  const policy = route.risk_policy ?? DEFAULT_RISK_POLICY;
  const levelRank = RISK_LEVEL_RANK[level as RiskLevel] ?? 0;
  const computedRank = RISK_LEVEL_RANK[computedLevel as RiskLevel] ?? 0;
  const heldByStickyPolicy = levelRank > computedRank;
  const facilityContributors = (snapshot?.facilities ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    statusText: formatStatus(item.status),
    level: item.level,
    levelText: formatRisk(item.level),
    raisesRisk: (RISK_LEVEL_RANK[item.level as RiskLevel] ?? 0) > RISK_LEVEL_RANK.LOW
  }));
  const reportContributors = (snapshot?.reports ?? []).map((item) => ({
    id: item.id,
    facilityId: item.facility_id,
    verifyStatus: item.verify_status,
    verifyStatusText: BarrierVerifyStatusText[item.verify_status as BarrierVerifyStatus] ?? formatStatus(item.verify_status)
  }));
  const reasons: string[] = [];
  for (const item of facilityContributors) {
    if (item.status === "UNKNOWN" || !(item.status in FACILITY_STATUS_LEVEL)) {
      reasons.push(`设施「${item.name}」状态未知，按最保守档「${item.levelText}」计入`);
    } else if (item.raisesRisk) {
      reasons.push(`设施「${item.name}」状态为 ${item.statusText}，按「${item.levelText}」档计入`);
    }
  }
  if (reportContributors.length > 0) {
    const boost = snapshot?.open_report_boost ?? 0;
    reasons.push(`未关闭障碍上报 ${reportContributors.length} 条（${reportContributors.map((item) => `#${item.id}`).join("、")}），等级上调 ${boost} 档`);
  }
  if (heldByStickyPolicy) {
    reasons.push(`按当前设施与上报仅算出「${formatRisk(computedLevel)}」，因${RiskPolicyText[policy]}，等级维持历史高位「${formatRisk(level)}」`);
  }
  if (reasons.length === 0) {
    reasons.push("所选设施均可用，且无未关闭障碍上报");
  }
  return {
    level,
    levelText: formatRisk(level),
    computedLevel,
    computedLevelText: formatRisk(computedLevel),
    policy,
    policyText: RiskPolicyText[policy],
    heldByStickyPolicy,
    openReportBoost: snapshot?.open_report_boost ?? 0,
    facilityContributors,
    reportContributors,
    reasons
  };
}
