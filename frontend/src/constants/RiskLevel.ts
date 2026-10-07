export const RiskLevel = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof RiskLevel)[number];

export const RiskLevelText: Record<RiskLevel, string> = { LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重" };

export const RISK_LEVEL_RANK: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// STICKY_HIGH：保留历史高位，设施恢复、上报关闭后不当场回落（对出行者更稳妥，默认）。
// LIVE_RECOMPUTE：随设施与上报状态实时重算，立即可用即回落。
export const RiskPolicy = ["STICKY_HIGH", "LIVE_RECOMPUTE"] as const;
export type RiskPolicy = (typeof RiskPolicy)[number];

export const RiskPolicyText: Record<RiskPolicy, string> = {
  STICKY_HIGH: "保留历史高位（设施恢复后不自动回落）",
  LIVE_RECOMPUTE: "随设施状态实时重算"
};

export const DEFAULT_RISK_POLICY: RiskPolicy = "STICKY_HIGH";
