import type { RiskPolicy } from "../constants/RiskLevel";

export interface RouteRiskFacilityContributor {
  id: number;
  name: string;
  status: string;
  level: string;
}

export interface RouteRiskReportContributor {
  id: number;
  facility_id: number;
  verify_status: string;
}

// 保存路线时落库的风险快照：路线列表、路线详情、风险说明面板共用这一份结果。
export interface RouteRiskSnapshot {
  level: string;
  computed_level: string;
  policy: string;
  open_report_boost: number;
  facilities: RouteRiskFacilityContributor[];
  reports: RouteRiskReportContributor[];
  computed_at: string;
}

export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  risk_policy?: RiskPolicy;
  risk_snapshot?: RouteRiskSnapshot | null;
  estimated_minutes: number;
  facility_ids: number[];
  created_at: string;
}
