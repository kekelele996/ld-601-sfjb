import type { RoutePlan } from "../../types/RoutePlan";
import { useRouteRisk } from "../../hooks/useRouteRisk";
import { StatusBadge } from "./StatusBadge";

// 风险说明面板：展示保存时算出的等级、所采用的回落策略，以及把等级抬上去的设施与障碍上报。
export function RouteRiskPanel({ route }: { route: RoutePlan | null | undefined }) {
  const risk = useRouteRisk(route);
  if (!risk) {
    return <div className="shared-widget"><strong>风险说明</strong><p>选择一条路线后展示风险等级与抬级来源。</p></div>;
  }
  return (
    <div className="shared-widget risk-panel">
      <div className="risk-head">
        <strong>风险说明</strong>
        <StatusBadge value={risk.level} />
        <span>{risk.levelText}风险</span>
      </div>
      <p className="risk-policy">等级策略：{risk.policyText}</p>
      <ul className="risk-reasons">
        {risk.reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
      {risk.facilityContributors.length > 0 && (
        <div>
          <h3>参与计算的设施</h3>
          <ul>
            {risk.facilityContributors.map((item) => (
              <li key={item.id}>
                {item.name}（{item.statusText}）→ {item.levelText}档
              </li>
            ))}
          </ul>
        </div>
      )}
      {risk.reportContributors.length > 0 && (
        <div>
          <h3>未关闭的障碍上报</h3>
          <ul>
            {risk.reportContributors.map((item) => (
              <li key={item.id}>上报 #{item.id}（设施 #{item.facilityId}，{item.verifyStatusText}）</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
