export const BarrierVerifyStatus = ["PENDING", "VERIFIED", "CLOSED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];

export const BarrierVerifyStatusText: Record<BarrierVerifyStatus, string> = {
  PENDING: "待审核",
  VERIFIED: "已核实",
  CLOSED: "已关闭"
};

// 只有明确关闭的上报才不再影响路线风险，其余一律视为未关闭（保守口径）。
export const CLOSED_BARRIER_VERIFY_STATUSES: readonly string[] = ["CLOSED"];
