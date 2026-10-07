import type { RoutePlan, RoutePlanPayload } from "../types/RoutePlan";

export const createDefaultRoutePlan = (overrides: Partial<RoutePlan> = {}): RoutePlan => ({
  id: 1,
  user_id: 1,
  origin_text: "",
  destination_text: "",
  route_mode: "WALK",
  risk_level: "LOW",
  estimated_minutes: 15,
  facility_ids: [],
  created_at: "2026-10-01T08:00:00Z",
  risk_policy: "PEAK_HOLD",
  risk_evaluated_at: "2026-10-01T08:00:00Z",
  risk_factors: [],
  ...overrides
});

/** 保存路线的表单对象：不包含风险字段，风险由服务端计算 */
export const createRoutePlanForm = (overrides: Partial<RoutePlanPayload> = {}): RoutePlanPayload => ({
  user_id: 1,
  origin_text: "",
  destination_text: "",
  route_mode: "WALK",
  estimated_minutes: 15,
  facility_ids: [],
  ...overrides
});

export const createRoutePlanResponse = createDefaultRoutePlan;
