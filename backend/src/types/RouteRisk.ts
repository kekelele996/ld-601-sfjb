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

/** 任意时刻基于最新设施与上报重算的结果 */
export interface RouteRiskLive {
  level: RiskLevel;
  evaluated_at: string;
  factors: RouteRiskFactor[];
}

/** 路线列表、路线详情、风险说明面板共用的同一份风险结论 */
export interface RouteRiskView {
  /** 保存时锁定的历史高位（PEAK_HOLD 的峰值） */
  saved_level: RiskLevel;
  /** 依据当前设施/上报实时算出的等级 */
  live_level: RiskLevel;
  /** 实际对出行者展示的等级 = max(保存峰值, 实时值) */
  level: RiskLevel;
  policy: RiskPolicy;
  saved_at: string;
  live_evaluated_at: string;
  saved_factors: RouteRiskFactor[];
  live_factors: RouteRiskFactor[];
  /** 实时风险已经回落，但按高位保留策略仍在展示历史峰值 */
  held_above_live: boolean;
  /** 实时风险比保存时更高（出现了新障碍），展示等级被实时值顶上去 */
  live_exceeds_saved: boolean;
}
