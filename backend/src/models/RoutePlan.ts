import type { RiskLevel } from "../constants/RiskLevel";
import type { RiskPolicy } from "../constants/RiskPolicy";
import type { RouteRiskFactor } from "../types/RouteRisk";

export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  /** 保存时计算并锁定的风险峰值（PEAK_HOLD） */
  risk_level: RiskLevel;
  estimated_minutes: number;
  facility_ids: number[];
  created_at: string;
  risk_policy: RiskPolicy;
  risk_evaluated_at: string;
  risk_factors: RouteRiskFactor[];
}
