import { useMemo } from "react";
import type { RoutePlan } from "../types/RoutePlan";
import { buildRouteRiskView, type RouteRiskView } from "../utils/routeRisk";

// 路线详情与 RouteRiskPanel 共用这个 hook，保证读到的是同一份风险快照。
export function useRouteRisk(route: RoutePlan | null | undefined): RouteRiskView | null {
  return useMemo(() => buildRouteRiskView(route), [route]);
}
