import { StatusBadge } from "./StatusBadge";
import type { RouteRiskFactor, RouteRiskView } from "../../types/RouteRisk";
import { RiskPolicyText } from "../../constants/RiskPolicy";
import { RiskLevelText } from "../../constants/RiskLevel";
import { formatDate } from "../../utils/formatters";

type RiskLike = Pick<RouteRiskView, "level" | "saved_level" | "live_level" | "policy" | "saved_at" | "live_evaluated_at" | "held_above_live" | "live_exceeds_saved"> & {
  saved_factors: RouteRiskFactor[];
  live_factors?: RouteRiskFactor[];
};

export function RouteRiskPanel({ title = "风险说明", risk, compact = false }: { title?: string; risk: RiskLike | null; compact?: boolean }) {
  if (!risk) {
    return <div className="shared-widget risk-panel"><strong>{title}</strong><p className="risk-empty">保存路线后由选中设施与未关闭障碍上报自动计算。</p></div>;
  }

  const renderFactor = (factor: RouteRiskFactor) => (
    <li key={`${factor.kind}-${factor.ref_id}`} className={factor.decisive ? "risk-factor decisive" : "risk-factor"}>
      <span className="risk-factor-head">
        <StatusBadge value={factor.level === "LOW" ? "LOW_RISK" : factor.level === "MEDIUM" ? "MEDIUM_RISK" : "HIGH_RISK"} />
        {factor.decisive && <em className="risk-tag">抬升本档</em>}
        <em className="risk-source">{factor.kind === "FACILITY" ? `设施 #${factor.ref_id}` : `障碍上报 #${factor.ref_id}`}</em>
      </span>
      <span className="risk-facility">所在设施：{factor.facility_name}</span>
      <span className="risk-reason">{factor.reason}</span>
    </li>
  );

  const savedElevating = risk.saved_factors.filter((factor) => factor.level !== "LOW");

  return (
    <div className={`shared-widget risk-panel risk-${risk.level.toLowerCase()}${compact ? " compact" : ""}`}>
      <div className="risk-panel-head">
        <strong>{title}</strong>
        <StatusBadge value={risk.level === "LOW" ? "LOW_RISK" : risk.level === "MEDIUM" ? "MEDIUM_RISK" : "HIGH_RISK"} />
      </div>

      <p className="risk-level-line">
        当前对出行者提示：<b>{RiskLevelText[risk.level]}</b>
        <span className="risk-policy-tag">本路线策略：{RiskPolicyText[risk.policy]}（不随设施恢复当场回落）</span>
      </p>

      <div className="risk-compare">
        <span>保存时峰值：{RiskLevelText[risk.saved_level]}（{formatDate(risk.saved_at)}）</span>
        <span>当前实时评级：{RiskLevelText[risk.live_level]}（{formatDate(risk.live_evaluated_at)}）</span>
      </div>

      {risk.held_above_live && (
        <p className="risk-note hold">实时风险已回落至{RiskLevelText[risk.live_level]}，但本路线采用「{RiskPolicyText[risk.policy]}」，对出行者继续按历史高位 {RiskLevelText[risk.level]} 提示。</p>
      )}
      {risk.live_exceeds_saved && (
        <p className="risk-note rise">出现新的设施异常或未关闭障碍上报，实时评级 {RiskLevelText[risk.live_level]} 已高于保存时峰值，当前按更高的 {RiskLevelText[risk.level]} 提示。</p>
      )}

      {!compact && (
        <>
          <h4 className="risk-subhead">保存时把等级抬上去的设施 / 上报</h4>
          {savedElevating.length === 0
            ? <p className="risk-empty">保存时选中设施均可用且没有未关闭的障碍上报。</p>
            : <ul className="risk-factors">{savedElevating.map(renderFactor)}</ul>}
        </>
      )}
    </div>
  );
}
