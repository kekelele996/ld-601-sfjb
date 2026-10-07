import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { buildRouteRiskView, evaluateRouteRisk } from "../utils/routeRisk";
import { RouteRiskPolicy } from "../constants/RiskPolicy";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RoutePlanPayload } from "../types/RoutePlanPayload";
import type { RoutePlan } from "../models/RoutePlan";
import type { RoutePlanView } from "../types/RoutePlanView";

const nowIso = () => new Date().toISOString();

const toView = (row: RoutePlan): RoutePlanView => ({
  ...row,
  risk: buildRouteRiskView(
    { level: row.risk_level, evaluated_at: row.risk_evaluated_at, factors: row.risk_factors },
    row.facility_ids,
    accessibleFacilityRepository.findAll(),
    barrierReportRepository.findAll()
  )
});

const validatePayload = (payload: RoutePlanPayload) => {
  if (!payload.origin_text || !payload.destination_text) {
    const error = new Error(`${ERROR_MESSAGES.VALIDATION_FAILED}: origin_text/destination_text required`);
    (error as Error & { code?: string; status?: number }).code = ERROR_CODES.VALIDATION_FAILED;
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  const facilityIds = Array.isArray(payload.facility_ids)
    ? payload.facility_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];
  if (facilityIds.length === 0) {
    const error = new Error(`${ERROR_MESSAGES.VALIDATION_FAILED}: facility_ids must not be empty`);
    (error as Error & { code?: string; status?: number }).code = ERROR_CODES.VALIDATION_FAILED;
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  return facilityIds;
};

const buildStoredRow = (payload: RoutePlanPayload, existing?: RoutePlan): RoutePlan => {
  const facilityIds = validatePayload(payload);
  const createdAt = existing?.created_at ?? nowIso();
  // 保存时按选中设施 + 未关闭障碍上报算一次，结果锁定为历史高位
  const snapshot = evaluateRouteRisk(
    facilityIds,
    accessibleFacilityRepository.findAll(),
    barrierReportRepository.findAll(),
    nowIso()
  );
  return {
    id: existing?.id ?? 0,
    user_id: Number(payload.user_id ?? existing?.user_id ?? 1),
    origin_text: payload.origin_text ?? existing?.origin_text ?? "",
    destination_text: payload.destination_text ?? existing?.destination_text ?? "",
    route_mode: payload.route_mode ?? existing?.route_mode ?? "WALK",
    estimated_minutes: Number(payload.estimated_minutes ?? existing?.estimated_minutes ?? 0) || 0,
    facility_ids: facilityIds,
    created_at: createdAt,
    risk_level: snapshot.level,
    risk_policy: RouteRiskPolicy,
    risk_evaluated_at: snapshot.evaluated_at,
    risk_factors: snapshot.factors
  };
};

export const routePlanService = {
  list: (): RoutePlanView[] => routePlanRepository.findAll().map(toView),
  detail: (id: number): RoutePlanView => {
    const row = routePlanRepository.findById(id);
    if (!row) {
      const error = new Error(`route plan ${id} not found`);
      (error as Error & { code?: string; status?: number }).code = ERROR_CODES.VALIDATION_FAILED;
      (error as Error & { status?: number }).status = 404;
      throw error;
    }
    return toView(row);
  },
  create: (payload: RoutePlanPayload): RoutePlanView => {
    try {
      const stored = routePlanRepository.insert(buildStoredRow(payload));
      console.info(LOG_TEMPLATES.RoutePlan[0], { id: stored.id, risk_level: stored.risk_level, factors: stored.risk_factors.length });
      return toView(stored);
    } catch (error) {
      // service 层包装一次：保留风险计算阶段的校验语义
      throw error;
    }
  },
  /** 重新保存常用路线：按当前数据刷新快照，PEAK_HOLD 展示仍取 max(历史, 实时) */
  resave: (id: number, payload: RoutePlanPayload): RoutePlanView => {
    const existing = routePlanRepository.findById(id);
    if (!existing) {
      const error = new Error(`route plan ${id} not found`);
      (error as Error & { code?: string; status?: number }).code = ERROR_CODES.VALIDATION_FAILED;
      (error as Error & { status?: number }).status = 404;
      throw error;
    }
    const updated = routePlanRepository.update(id, buildStoredRow(payload, existing));
    console.info(LOG_TEMPLATES.RoutePlan[1], { id, risk_level: updated?.risk_level });
    console.info(LOG_TEMPLATES.RoutePlan[2], { id, saved_level: updated?.risk_level, live_level: toView(updated as RoutePlan).risk.live_level });
    return toView(updated as RoutePlan);
  }
};
