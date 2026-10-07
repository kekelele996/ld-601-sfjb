import type { RoutePlan } from "../models/RoutePlan";

/** 响应 DTO 工厂：风险字段只透出服务端计算结果，不接受外部手填 */
export const createRoutePlanDto = (overrides: Partial<RoutePlan> = {}): RoutePlan => ({
  id: 1,
  user_id: 1,
  origin_text: "origin text 1",
  destination_text: "destination text 1",
  route_mode: "WALK",
  risk_level: "LOW",
  estimated_minutes: 10,
  facility_ids: [1],
  created_at: "2026-10-01T08:00:00Z",
  risk_policy: "PEAK_HOLD",
  risk_evaluated_at: "2026-10-01T08:00:00Z",
  risk_factors: [],
  ...overrides
});
