import { RiskLevelText, type RiskLevel } from "../constants/RiskLevel";
import { RiskPolicyText, type RiskPolicy } from "../constants/RiskPolicy";
import { BarrierVerifyStatusText } from "../constants/BarrierVerifyStatus";
import { BarrierPriorityText } from "../constants/BarrierPriority";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => RiskLevelText[value as RiskLevel] ?? ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatRiskPolicy = (value: string) => RiskPolicyText[value as RiskPolicy] ?? value;
export const formatVerifyStatus = (value: string) => BarrierVerifyStatusText[value as keyof typeof BarrierVerifyStatusText] ?? value.replace(/_/g, " ");
export const formatBarrierPriority = (value: string) => BarrierPriorityText[value as keyof typeof BarrierPriorityText] ?? value.replace(/_/g, " ");
