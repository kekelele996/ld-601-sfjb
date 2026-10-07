import { mockData } from "../mocks/seedData";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { BarrierReport } from "../types/BarrierReport";
import type { RoutePlan } from "../types/RoutePlan";
import { ensureLocalRiskSnapshot } from "../utils/routeRisk";

const endpoint = "/api/route-plan";

const mockFacilities = () => mockData.accessibleFacility as unknown as AccessibleFacility[];
const mockReports = () => mockData.barrierReport as unknown as BarrierReport[];

export async function listRoutePlan(): Promise<RoutePlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  // 离线回退：按与后端一致的规则为手填老数据补算风险快照。
  return (mockData.routePlan as unknown as RoutePlan[]).map((row) =>
    ensureLocalRiskSnapshot({ ...row, facility_ids: [...row.facility_ids] }, mockFacilities(), mockReports())
  );
}

export async function saveRoutePlan(payload: RoutePlan): Promise<RoutePlan> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  // 离线回退：本地按同一套规则计算风险等级与快照（既有等级参与 STICKY_HIGH 合并）。
  const id = payload.id > 0 ? payload.id : Date.now();
  return ensureLocalRiskSnapshot({ ...payload, id, risk_snapshot: null }, mockFacilities(), mockReports());
}
