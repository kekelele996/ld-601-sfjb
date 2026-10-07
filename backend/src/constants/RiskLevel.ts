export const RiskLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RiskLevel)[number];

export const RiskLevelRank: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export const RiskLevelText: Record<RiskLevel, string> = {
  LOW: "低风险",
  MEDIUM: "中风险",
  HIGH: "高风险"
};

/** 设施状态未知 / 数据缺失时统一按这一档计算（对出行者最保守） */
export const HIGHEST_RISK_LEVEL: RiskLevel = "HIGH";
export const LOWEST_RISK_LEVEL: RiskLevel = "LOW";
