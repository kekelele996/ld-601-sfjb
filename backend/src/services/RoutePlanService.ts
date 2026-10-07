import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { routeRiskService } from "./RouteRiskService";
import { DEFAULT_RISK_POLICY } from "../constants/RiskLevel";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { RoutePlan, RouteRiskSnapshot } from "../models/RoutePlan";
import type { RoutePlanPayload } from "../types/RoutePlanPayload";

const buildSnapshot = (facilityIds: number[], previousLevel: string | undefined | null): { risk_level: string; snapshot: RouteRiskSnapshot } => {
  const evaluation = routeRiskService.evaluateRouteRisk(facilityIds);
  const level = routeRiskService.applyStickyPolicy(previousLevel, evaluation.computedLevel);
  return {
    risk_level: level,
    snapshot: {
      level,
      computed_level: evaluation.computedLevel,
      policy: DEFAULT_RISK_POLICY,
      open_report_boost: evaluation.openReportBoost,
      facilities: evaluation.facilities,
      reports: evaluation.reports,
      computed_at: new Date().toISOString()
    }
  };
};

// 老数据只有手填等级、没有风险快照：读取时按当前设施与未关闭上报补算，
// 手填等级视作历史高位参与 STICKY_HIGH 合并，并回写仓库，保证列表/详情/面板读到同一份结果。
const ensureSnapshot = (row: RoutePlan): RoutePlan => {
  if (row.risk_snapshot) return row;
  const { risk_level, snapshot } = buildSnapshot(row.facility_ids ?? [], row.risk_level);
  return routePlanRepository.save({ ...row, risk_level, risk_policy: DEFAULT_RISK_POLICY, risk_snapshot: snapshot });
};

export const routePlanService = {
  list: (): RoutePlan[] => routePlanRepository.findAll().map(ensureSnapshot),

  create(payload: RoutePlanPayload): RoutePlan {
    if (!payload || typeof payload.origin_text !== "string" || typeof payload.destination_text !== "string" || !Array.isArray(payload.facility_ids)) {
      throw Object.assign(new Error(ERROR_MESSAGES.VALIDATION_FAILED), { status: 400, code: ERROR_CODES.VALIDATION_FAILED });
    }
    const id = typeof payload.id === "number" && payload.id > 0 ? payload.id : routePlanRepository.nextId();
    const previous = routePlanRepository.findById(id);
    const { risk_level, snapshot } = buildSnapshot(payload.facility_ids.map(Number), previous?.risk_level);
    const row: RoutePlan = {
      id,
      user_id: Number(payload.user_id ?? previous?.user_id ?? 1),
      origin_text: payload.origin_text,
      destination_text: payload.destination_text,
      route_mode: String(payload.route_mode ?? previous?.route_mode ?? "MIXED"),
      risk_level,
      risk_policy: DEFAULT_RISK_POLICY,
      risk_snapshot: snapshot,
      estimated_minutes: Number(payload.estimated_minutes ?? previous?.estimated_minutes ?? 0),
      facility_ids: payload.facility_ids.map(Number),
      created_at: previous?.created_at ?? new Date().toISOString()
    };
    console.info(LOG_TEMPLATES.RoutePlan[4], { id, risk_level, computed_level: snapshot.computed_level });
    return routePlanRepository.save(row);
  }
};
