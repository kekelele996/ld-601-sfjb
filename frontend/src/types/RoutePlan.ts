import type { RiskLevel } from "../constants/RiskLevel";
import type { RiskPolicy } from "../constants/RiskPolicy";
import type { RouteRiskFactor, RouteRiskView } from "./RouteRisk";

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
  /** 接口附带的共用风险结论（列表/详情/风险说明面板同一份结果） */
  risk?: RouteRiskView;
}

/** 保存路线入参：不含 risk_level / risk_factors，风险一律由后端计算 */
export interface RoutePlanPayload {
  id?: number;
  user_id?: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  estimated_minutes: number;
  facility_ids: number[];
}
