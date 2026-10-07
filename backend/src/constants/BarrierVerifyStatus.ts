export const BarrierVerifyStatus = ["SUBMITTED", "VERIFIED", "REJECTED", "CLOSED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];

export const BarrierVerifyStatusText: Record<BarrierVerifyStatus, string> = {
  SUBMITTED: "待审核",
  VERIFIED: "已核实",
  REJECTED: "已驳回",
  CLOSED: "已关闭"
};

/** 只有这两种终态视为「已关掉」，不再抬高路线风险 */
export const ClosedBarrierVerifyStatus: readonly BarrierVerifyStatus[] = ["CLOSED", "REJECTED"];
