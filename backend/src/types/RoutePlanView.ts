import type { AccessibleFacility } from "../models/AccessibleFacility";
import type { BarrierReport } from "../models/BarrierReport";
import type { RoutePlan } from "../models/RoutePlan";
import type { RouteRiskView } from "./RouteRisk";

/** 路线列表 / 详情接口统一返回：路线本体 + 共用风险结论 */
export interface RoutePlanView extends RoutePlan {
  risk: RouteRiskView;
}

export interface RouteRiskDeps {
  facilities: AccessibleFacility[];
  reports: BarrierReport[];
}
