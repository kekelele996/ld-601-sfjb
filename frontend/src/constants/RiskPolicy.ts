export const RiskPolicy = ["PEAK_HOLD", "LIVE_REFRESH"] as const;
export type RiskPolicy = (typeof RiskPolicy)[number];

/**
 * 本平台路线风险统一采用「高位保留」策略：
 * 设施恢复可用、障碍上报关闭后，已保存路线算出的高等级不自动回落。
 */
export const RouteRiskPolicy: RiskPolicy = "PEAK_HOLD";

export const RiskPolicyText: Record<RiskPolicy, string> = {
  PEAK_HOLD: "高位保留",
  LIVE_REFRESH: "实时回落"
};

export const RiskPolicyDescription: Record<RiskPolicy, string> = {
  PEAK_HOLD: "设施恢复可用或障碍上报关闭后，保存时算出的高等级不会当场回落，继续按历史高位向出行者提示；若当前实时风险更高，则按更高的实时等级提示。",
  LIVE_REFRESH: "设施恢复或障碍关闭后风险等级立即回落到实时计算值（本平台未启用）。"
};
