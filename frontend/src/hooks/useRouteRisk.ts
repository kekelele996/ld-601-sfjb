import { useMemo } from "react";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { BarrierReport } from "../types/BarrierReport";
import type { RoutePlan } from "../types/RoutePlan";
import type { RouteRiskView } from "../types/RouteRisk";
import { buildRouteRiskView, evaluateRouteRisk } from "../utils/routeRisk";
import { RiskPolicyText, RiskPolicyDescription } from "../constants/RiskPolicy";
import { RiskLevelText } from "../constants/RiskLevel";
import { formatDate } from "../utils/formatters";

/**
 * 路线风险的唯一解读入口：路线列表、路线详情、风险说明面板都从这里拿同一份结论。
 * - 已保存路线：优先使用接口返回的 risk（后端在保存时算出并锁定），离线时本地重算；
 * - 未保存草稿：按当前勾选的设施实时预览。
 */
export function useRouteRisk(
  route: Pick<RoutePlan, "risk_level" | "risk_evaluated_at" | "risk_factors" | "facility_ids"> | null | undefined,
  facilities: AccessibleFacility[] = [],
  reports: BarrierReport[] = []
): {
  risk: RouteRiskView | null;
  levelText: string;
  policyText: string;
  policyDescription: string;
  savedAtText: string;
  liveAtText: string;
  /** 真正把等级抬到当前档位的设施/上报 */
  decisiveFactors: RouteRiskView["saved_factors"];
} {
  return useMemo(() => {
    if (!route) {
      return { risk: null, levelText: "—", policyText: RiskPolicyText.PEAK_HOLD, policyDescription: RiskPolicyDescription.PEAK_HOLD, savedAtText: "—", liveAtText: "—", decisiveFactors: [] };
    }
    const risk: RouteRiskView = buildRouteRiskView(route, facilities, reports);
    return {
      risk,
      levelText: RiskLevelText[risk.level],
      policyText: RiskPolicyText[risk.policy],
      policyDescription: RiskPolicyDescription[risk.policy],
      savedAtText: formatDate(risk.saved_at),
      liveAtText: formatDate(risk.live_evaluated_at),
      decisiveFactors: risk.saved_factors.filter((factor) => factor.decisive)
    };
  }, [route, facilities, reports]);
}

/** 表单里还没保存时的实时风险预览（保存动作最终以后端计算为准） */
export function useRouteRiskPreview(facilityIds: number[], facilities: AccessibleFacility[], reports: BarrierReport[]) {
  return useMemo(() => {
    const result = evaluateRouteRisk(facilityIds, facilities, reports);
    return { ...result, levelText: RiskLevelText[result.level] };
  }, [facilityIds, facilities, reports]);
}
