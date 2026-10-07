export const BarrierVerifyStatus = ["PENDING", "VERIFIED", "CLOSED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];

// 只有明确关闭的上报才不再影响路线风险，其余一律视为未关闭（保守口径）。
export const CLOSED_BARRIER_VERIFY_STATUSES: readonly string[] = ["CLOSED"];
