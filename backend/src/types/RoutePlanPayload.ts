import type { RiskPolicy } from "../constants/RiskPolicy";

/**
 * 创建/保存路线的入参。
 * 注意：risk_level / risk_factors 不接受手填，一律由后端按选中设施与未关闭障碍上报计算。
 */
export interface RoutePlanPayload {
  id?: number;
  user_id?: number;
  origin_text?: string;
  destination_text?: string;
  route_mode?: string;
  estimated_minutes?: number;
  facility_ids?: number[];
  risk_policy?: RiskPolicy;
}
