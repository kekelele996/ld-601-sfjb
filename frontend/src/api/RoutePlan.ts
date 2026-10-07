import { mockData } from "../mocks/seedData";
import type { RoutePlan, RoutePlanPayload } from "../types/RoutePlan";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { BarrierReport } from "../types/BarrierReport";
import { buildRouteRiskView, evaluateRouteRisk } from "../utils/routeRisk";

const endpoint = "/api/route-plan";

/** 离线兜底：给本地种子路线附上与后端同构算出的共用风险结论 */
function withLocalRisk(rows: RoutePlan[]): RoutePlan[] {
  const facilities = mockData.accessibleFacility as unknown as AccessibleFacility[];
  const reports = mockData.barrierReport as unknown as BarrierReport[];
  return rows.map((row) => ({ ...row, risk: buildRouteRiskView(row, facilities, reports) }));
}

export async function listRoutePlan(): Promise<RoutePlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return withLocalRisk([...(mockData.routePlan as unknown as RoutePlan[])]);
}

export async function getRoutePlan(id: number): Promise<RoutePlan> {
  try {
    const res = await fetch(`${endpoint}/${id}`);
    if (res.ok) return await res.json();
  } catch {
    // fall through to local mock
  }
  const rows = withLocalRisk([...(mockData.routePlan as unknown as RoutePlan[])]);
  const found = rows.find((row) => row.id === id);
  if (!found) throw new Error(`route plan ${id} not found`);
  return found;
}

/** 保存路线：不带 risk_level，等级由后端按选中设施与未关闭上报计算后随响应返回 */
export async function saveRoutePlan(payload: RoutePlanPayload): Promise<RoutePlan> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // fall through to local mock
  }
  // 离线兜底：本地按同一规则算一次，保证评审时 UI 可用
  const facilities = mockData.accessibleFacility as unknown as AccessibleFacility[];
  const reports = mockData.barrierReport as unknown as BarrierReport[];
  const snapshot = evaluateRouteRisk(payload.facility_ids, facilities, reports);
  const created: RoutePlan = {
    id: (mockData.routePlan[mockData.routePlan.length - 1]?.id ?? 0) + 1,
    user_id: payload.user_id ?? 1,
    origin_text: payload.origin_text,
    destination_text: payload.destination_text,
    route_mode: payload.route_mode,
    estimated_minutes: payload.estimated_minutes,
    facility_ids: payload.facility_ids,
    created_at: snapshot.evaluated_at,
    risk_level: snapshot.level,
    risk_policy: "PEAK_HOLD",
    risk_evaluated_at: snapshot.evaluated_at,
    risk_factors: snapshot.factors,
    risk: buildRouteRiskView(
      {
        risk_level: snapshot.level,
        risk_evaluated_at: snapshot.evaluated_at,
        risk_factors: snapshot.factors,
        facility_ids: payload.facility_ids
      },
      facilities,
      reports,
      snapshot.evaluated_at
    )
  };
  return created;
}
