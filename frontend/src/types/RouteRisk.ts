import type { RiskLevel } from "../constants/RiskLevel";
import type { RiskPolicy } from "../constants/RiskPolicy";

/** 把等级抬上去的单个来源（设施或未关闭的障碍上报） */
export interface RouteRiskFactor {
  kind: "FACILITY" | "BARRIER_REPORT";
  ref_id: number;
  facility_id: number;
  facility_name: string;
  level: RiskLevel;
  reason: string;
  /** 是否为决定当前等级的最高档因子之一 */
  decisive: boolean;
}

/** 保存路线时按当时设施/上报算出的快照 */
export interface RouteRiskSnapshot {
  level: RiskLevel;
  evaluated_at: string;
  factors: RouteRiskFactor[];
}

/** 路线列表、路线详情、风险说明面板共用的同一份风险结论 */
export interface RouteRiskView {
  saved_level: RiskLevel;
  live_level: RiskLevel;
  level: RiskLevel;
  policy: RiskPolicy;
  saved_at: string;
  live_evaluated_at: string;
  saved_factors: RouteRiskFactor[];
  live_factors: RouteRiskFactor[];
  held_above_live: boolean;
  live_exceeds_saved: boolean;
}
