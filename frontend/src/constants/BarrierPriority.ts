export const BarrierPriority = ["LOW", "MEDIUM", "HIGH"] as const;
export type BarrierPriority = (typeof BarrierPriority)[number];

export const BarrierPriorityText: Record<BarrierPriority, string> = {
  LOW: "低优先级",
  MEDIUM: "中优先级",
  HIGH: "高优先级"
};
