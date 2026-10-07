import { useEffect, useMemo, useState } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { FacilityTag } from "../components/common/FacilityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { useRouteRisk, useRouteRiskPreview } from "../hooks/useRouteRisk";
import { createRoutePlanForm } from "../constructors/RoutePlanConstructor";
import { formatDate, formatRisk, formatRiskPolicy } from "../utils/formatters";
import type { RoutePlan, RoutePlanPayload } from "../types/RoutePlan";

type View = { mode: "list" } | { mode: "create" } | { mode: "detail"; id: number };

export function RoutesPage({ initialView }: { initialView?: Extract<View, { mode: "detail" }> | null }) {
  const [view, setView] = useState<View>(initialView ?? { mode: "list" });
  const routeStore = useRoutePlanStore();
  const facilityStore = useAccessibleFacilityStore();
  const reportStore = useBarrierReportStore();

  useEffect(() => {
    void routeStore.load();
    void facilityStore.load();
    void reportStore.load();
    // 仅在进入页面时加载一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (id: number) => setView({ mode: "detail", id });

  return (
    <section className="routes-page">
      <header className="page-head-inline">
        <div>
          <p className="eyebrow">accessroute / 路线规划</p>
          <h1>路线规划</h1>
          <p className="page-desc">保存路线时按选中设施的巡检状态与未关闭的障碍上报自动计算风险等级，列表、详情与风险说明共用同一结果。</p>
        </div>
        {view.mode !== "create" && <button className="primary-btn" onClick={() => setView({ mode: "create" })}>新建路线</button>}
      </header>

      {view.mode === "list" && (
        <RouteList rows={routeStore.rows} loading={routeStore.loading} onOpen={openDetail} onCreate={() => setView({ mode: "create" })} />
      )}
      {view.mode === "create" && (
        <RouteCreateForm
          facilities={facilityStore.rows}
          reports={reportStore.rows}
          saving={routeStore.saving}
          onCancel={() => setView({ mode: "list" })}
          onSaved={(row) => openDetail(row.id)}
        />
      )}
      {view.mode === "detail" && (
        <RouteDetail
          id={view.id}
          facilities={facilityStore.rows}
          reports={reportStore.rows}
          onBack={() => setView({ mode: "list" })}
        />
      )}
    </section>
  );
}

function riskBadge(level: string) {
  return level === "LOW" ? "LOW_RISK" : level === "MEDIUM" ? "MEDIUM_RISK" : "HIGH_RISK";
}

function RouteList({ rows, loading, onOpen, onCreate }: { rows: RoutePlan[]; loading: boolean; onOpen: (id: number) => void; onCreate: () => void }) {
  if (loading) return <p className="state-text">正在加载路线…</p>;
  if (rows.length === 0) {
    return <EmptyState title="还没有保存的路线" description="新建一条路线并选择沿途设施，风险等级会自动计算。" actionText="新建路线" onAction={onCreate} />;
  }
  return (
    <div className="panel wide">
      <h2>已保存路线（{rows.length}）</h2>
      <div className="table route-table">
        <div className="row table-head">
          <span>起终点</span><span>沿途设施</span><span>风险等级</span><span>策略</span><span>保存时间</span><span></span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="row" onClick={() => onOpen(row.id)} role="button" tabIndex={0}>
            <span className="route-endpoints">
              <strong>{row.origin_text}</strong>
              <em> → {row.destination_text}</em>
              <small>{row.route_mode} · 约 {row.estimated_minutes} 分钟</small>
            </span>
            <span className="route-facility-ids">{row.facility_ids.map((id) => `#${id}`).join("、") || "未选设施"}</span>
            <span><StatusBadge value={riskBadge(row.risk?.level ?? row.risk_level)} /></span>
            <span className="risk-policy-text">{formatRiskPolicy(row.risk?.policy ?? row.risk_policy)}</span>
            <span className="muted">{formatDate(row.created_at)}</span>
            <span className="link-btn">详情</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteCreateForm({ facilities, reports, saving, onCancel, onSaved }: {
  facilities: ReturnType<typeof useAccessibleFacilityStore.getState>["rows"];
  reports: ReturnType<typeof useBarrierReportStore.getState>["rows"];
  saving: boolean;
  onCancel: () => void;
  onSaved: (row: RoutePlan) => void;
}) {
  const [form, setForm] = useState<RoutePlanPayload>(createRoutePlanForm());
  const selectedIds = form.facility_ids;
  const preview = useRouteRiskPreview(selectedIds, facilities, reports);

  const toggleFacility = (id: number) => {
    setForm((current) => ({
      ...current,
      facility_ids: current.facility_ids.includes(id)
        ? current.facility_ids.filter((item) => item !== id)
        : [...current.facility_ids, id]
    }));
  };

  const canSubmit = form.origin_text.trim() !== "" && form.destination_text.trim() !== "" && selectedIds.length > 0 && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    const saved = await useRoutePlanStore.getState().save(form);
    onSaved(saved);
  };

  return (
    <div className="route-form-layout">
      <div className="panel wide">
        <h2>新建路线</h2>
        <p className="muted">风险等级不再手填：保存时由后端按下方勾选设施及这些设施上未关闭的障碍上报计算。</p>
        <div className="form-grid">
          <label>起点
            <input value={form.origin_text} onChange={(event) => setForm({ ...form, origin_text: event.target.value })} placeholder="例如：东门公交站" />
          </label>
          <label>终点
            <input value={form.destination_text} onChange={(event) => setForm({ ...form, destination_text: event.target.value })} placeholder="例如：社区服务中心" />
          </label>
          <label>出行方式
            <select value={form.route_mode} onChange={(event) => setForm({ ...form, route_mode: event.target.value })}>
              <option value="WALK">步行 / 视障引导</option>
              <option value="WHEELCHAIR">轮椅通行</option>
              <option value="ELDERLY">慢行协助</option>
            </select>
          </label>
          <label>预计用时（分钟）
            <input type="number" min={1} value={form.estimated_minutes} onChange={(event) => setForm({ ...form, estimated_minutes: Number(event.target.value) })} />
          </label>
        </div>

        <h3 className="form-subhead">选择沿途设施（{selectedIds.length}）</h3>
        <div className="facility-picker">
          {facilities.map((facility) => (
            <FacilityTag
              key={facility.id}
              name={`#${facility.id} ${facility.name}`}
              status={facility.status}
              locationCode={facility.location_code}
              selected={selectedIds.includes(facility.id)}
              onClick={() => toggleFacility(facility.id)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button className="primary-btn" disabled={!canSubmit} onClick={submit}>{saving ? "保存中…" : "保存路线"}</button>
          <button onClick={onCancel}>取消</button>
        </div>
      </div>

      <aside className="panel">
        <h2>保存前实时预览</h2>
        <p className="muted small">最终等级以保存时后端计算为准，保存后采用「{formatRiskPolicy("PEAK_HOLD")}」策略锁定高位。</p>
        <div className="preview-risk">
          <div className="preview-level">
            <StatusBadge value={riskBadge(preview.level)} />
            <b>{formatRisk(preview.level)}</b>
          </div>
          <ul className="risk-factors preview-factors">
            {preview.factors.filter((factor) => factor.level !== "LOW").map((factor) => (
              <li key={`${factor.kind}-${factor.ref_id}`} className={factor.decisive ? "risk-factor decisive" : "risk-factor"}>
                <span className="risk-source">{factor.kind === "FACILITY" ? `设施 #${factor.ref_id}` : `障碍上报 #${factor.ref_id}`} · {factor.facility_name}</span>
                <span className="risk-reason">{factor.reason}</span>
              </li>
            ))}
            {preview.factors.every((factor) => factor.level === "LOW") && <li className="muted small">所选设施当前均可用，且没有未关闭的障碍上报。</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function RouteDetail({ id, facilities, reports, onBack }: {
  id: number;
  facilities: ReturnType<typeof useAccessibleFacilityStore.getState>["rows"];
  reports: ReturnType<typeof useBarrierReportStore.getState>["rows"];
  onBack: () => void;
}) {
  const selected = useRoutePlanStore((state) => state.selected);
  const selectedId = useRoutePlanStore((state) => state.selectedId);
  const select = useRoutePlanStore((state) => state.select);
  const load = useRoutePlanStore((state) => state.load);

  useEffect(() => {
    void select(id);
    return () => {
      void select(null);
    };
  }, [id, select]);

  // 刚保存后 store 里已有 selected；刷新兜底：从 rows 里取（selector 返回稳定引用）
  const allRows = useRoutePlanStore((state) => state.rows);
  const selectedRow = selectedId === id ? selected ?? undefined : undefined;
  const route = selectedRow ?? allRows.find((item) => item.id === id);

  const { risk, levelText, policyText, policyDescription, savedAtText, liveAtText, decisiveFactors } = useRouteRisk(
    route
      ? {
          risk_level: route.risk_level,
          risk_evaluated_at: route.risk_evaluated_at,
          risk_factors: route.risk_factors,
          facility_ids: route.facility_ids
        }
      : null,
    facilities,
    reports
  );

  const openReportsOnRoute = useMemo(
    () => reports.filter((report) => route?.facility_ids.includes(report.facility_id)),
    [reports, route]
  );

  if (!route) return <p className="state-text">正在加载路线详情…<button onClick={() => void load()}>重试</button></p>;

  return (
    <div className="route-detail-layout">
      <div className="panel wide">
        <button className="back-btn" onClick={onBack}>← 返回列表</button>
        <h2>{route.origin_text} → {route.destination_text}</h2>
        <p className="muted">{route.route_mode} · 约 {route.estimated_minutes} 分钟 · 保存于 {formatDate(route.created_at)}</p>

        <h3 className="form-subhead">沿途设施（{route.facility_ids.length}）</h3>
        <div className="facility-picker">
          {route.facility_ids.map((facilityId) => {
            const facility = facilities.find((item) => item.id === facilityId);
            return (
              <FacilityTag
                key={facilityId}
                name={facility ? `#${facility.id} ${facility.name}` : `#${facilityId} 记录缺失`}
                status={facility?.status ?? "UNKNOWN"}
                locationCode={facility?.location_code}
              />
            );
          })}
        </div>

        <h3 className="form-subhead">这些设施上的障碍上报</h3>
        {openReportsOnRoute.length === 0 ? (
          <EmptyState title="没有相关障碍上报" description="沿途设施当前没有任何障碍工单。" />
        ) : (
          <ul className="report-list">
            {openReportsOnRoute.map((report) => {
              const facility = facilities.find((item) => item.id === report.facility_id);
              const closed = ["CLOSED", "REJECTED"].includes(report.verify_status);
              return (
                <li key={report.id} className={closed ? "report-row closed" : "report-row open"}>
                  <div>
                    <strong>上报 #{report.id}</strong>
                    <span className="muted"> · 设施 #{report.facility_id} {facility?.name ?? ""} · {report.priority}</span>
                    <p>{report.description}</p>
                  </div>
                  <StatusBadge value={report.verify_status} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="panel detail-risk">
        <RouteRiskPanel title="风险说明" risk={risk ?? route.risk ?? null} />
        <div className="risk-legend">
          <h4>本路线风险口径</h4>
          <p><b>对出行者提示：</b>{levelText}</p>
          <p><b>采用策略：</b>{policyText}</p>
          <p className="muted small">{policyDescription}</p>
          <p className="muted small">保存时峰值时间：{savedAtText}；实时评级时间：{liveAtText}。</p>
          <h4>把等级抬到当前档位的来源</h4>
          {decisiveFactors.length === 0 ? (
            <p className="muted small">没有中/高风险因子，当前为低风险。</p>
          ) : (
            <ul className="risk-source-list">
              {decisiveFactors.map((factor) => (
                <li key={`${factor.kind}-${factor.ref_id}`}>
                  {factor.kind === "FACILITY" ? `设施「${factor.facility_name}」(#${factor.ref_id})` : `障碍上报 #${factor.ref_id}（设施「${factor.facility_name}」）`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
