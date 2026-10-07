import type { RoutePlan } from "../types/RoutePlan";
import { DEFAULT_RISK_POLICY } from "../constants/RiskLevel";

export const createDefaultRoutePlan = (overrides: Partial<RoutePlan> = {}): RoutePlan => ({
  id: 1,
  user_id: 1,
  origin_text: "",
  destination_text: "",
  route_mode: "MIXED",
  risk_level: "LOW",
  risk_policy: DEFAULT_RISK_POLICY,
  risk_snapshot: null,
  estimated_minutes: 15,
  facility_ids: [],
  created_at: "2026-06-11T09:00:00Z",
  ...overrides
});

// 新建表单：id 置 0 表示尚未保存，风险等级与快照留空，保存时由系统按设施与未关闭上报计算。
export const createRoutePlanForm = (overrides: Partial<RoutePlan> = {}): RoutePlan =>
  createDefaultRoutePlan({ id: 0, risk_snapshot: null, ...overrides });

export const createRoutePlanResponse = createDefaultRoutePlan;
