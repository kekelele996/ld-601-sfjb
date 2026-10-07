import { DEFAULT_RISK_POLICY } from "../constants/RiskLevel";

export const createRoutePlanDto = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  origin_text: "origin text 1",
  destination_text: "destination text 1",
  route_mode: "MIXED",
  risk_level: "LOW",
  risk_policy: DEFAULT_RISK_POLICY,
  risk_snapshot: null,
  estimated_minutes: 15,
  facility_ids: [1, 2],
  created_at: "2026-06-11T09:00:00Z",
  ...overrides
});
