import { useEffect } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { useRouteRisk } from "../hooks/useRouteRisk";
import { RiskLevelRank } from "../constants/RiskLevel";
import { formatDate } from "../utils/formatters";
import type { RoutePlan } from "../types/RoutePlan";

export function DashboardPage({ onOpenRoute }: { onOpenRoute?: (id: number) => void }) {
  const routeStore = useRoutePlanStore();
  const facilityStore = useAccessibleFacilityStore();
  const reportStore = useBarrierReportStore();

  useEffect(() => {
    void routeStore.load();
    void facilityStore.load();
    void reportStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = routeStore.rows;
  const highRiskCount = rows.filter((row) => RiskLevelRank[(row.risk?.level ?? row.risk_level)] >= RiskLevelRank.HIGH).length;
  const heldCount = rows.filter((row) => row.risk?.held_above_live).length;
  const openReportCount = reportStore.rows.filter((report) => !["CLOSED", "REJECTED"].includes(report.verify_status)).length;
  const riskyRoutes = [...rows]
    .sort((a, b) => RiskLevelRank[(b.risk?.level ?? b.risk_level)] - RiskLevelRank[(a.risk?.level ?? a.risk_level)])
    .slice(0, 3);

  return (
    <section className="dashboard-page">
      <header className="page-head-inline">
        <div>
          <p className="eyebrow">accessroute / 通行总览</p>
          <h1>通行总览</h1>
        </div>
      </header>

      <section className="metrics">
        <StatCard label="已保存路线" value={rows.length} />
        <StatCard label="高风险路线" value={highRiskCount} tone={highRiskCount > 0 ? "danger" : "default"} />
        <StatCard label="未关闭障碍上报" value={openReportCount} tone={openReportCount > 0 ? "danger" : "default"} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>需要重点提示的路线</h2>
          {riskyRoutes.length === 0 && <p className="muted">暂无路线数据。</p>}
          <div className="risk-route-list">
            {riskyRoutes.map((row) => (
              <RiskRouteCard key={row.id} row={row} onOpen={() => onOpenRoute?.(row.id)} />
            ))}
          </div>
          {heldCount > 0 && <p className="risk-note hold">其中 {heldCount} 条路线的实时风险已经回落，但按「高位保留」策略仍在向出行者提示历史高位。</p>}
        </div>
        <div className="panel">
          <h2>口径说明</h2>
          <p>风险等级在<b>保存路线</b>时按选中设施的巡检状态与设施上未关闭的障碍上报自动计算，列表、详情与风险说明面板共用同一结果。</p>
          <p>设施状态为「未知」或巡检记录缺失时，一律按<b>最保守的高风险</b>处理。</p>
          <StatusBadge value="LOCAL_DATA" />
        </div>
      </section>
    </section>
  );
}

function RiskRouteCard({ row, onOpen }: { row: RoutePlan; onOpen: () => void }) {
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const reports = useBarrierReportStore((state) => state.rows);
  const { risk } = useRouteRisk(
    {
      risk_level: row.risk_level,
      risk_evaluated_at: row.risk_evaluated_at,
      risk_factors: row.risk_factors,
      facility_ids: row.facility_ids
    },
    facilities,
    reports
  );
  const view = risk ?? row.risk ?? null;

  return (
    <article className="risk-route-card" onClick={onOpen} role="button" tabIndex={0}>
      <div className="risk-route-head">
        <strong>{row.origin_text} → {row.destination_text}</strong>
        <small className="muted">保存于 {formatDate(row.created_at)}</small>
      </div>
      <RouteRiskPanel title="风险说明" risk={view} compact />
    </article>
  );
}
