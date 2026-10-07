import { useEffect, useMemo, useState } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { createRoutePlanForm } from "../constructors/RoutePlanConstructor";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { FacilityTag } from "../components/common/FacilityTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatRisk, formatRiskPolicy } from "../utils/formatters";
import { DEFAULT_RISK_POLICY } from "../constants/RiskLevel";
import type { RoutePlan } from "../types/RoutePlan";

const ROUTE_MODE_OPTIONS = [
  { value: "INDOOR", label: "室内优先" },
  { value: "OUTDOOR", label: "室外优先" },
  { value: "MIXED", label: "室内外混合" }
];

export function RoutesPage() {
  const { rows, loading, load, create } = useRoutePlanStore();
  const { rows: facilities, load: loadFacilities } = useAccessibleFacilityStore();
  const { load: loadReports } = useBarrierReportStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<RoutePlan>(() => createRoutePlanForm());

  useEffect(() => {
    load();
    loadFacilities();
    loadReports();
  }, [load, loadFacilities, loadReports]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId]
  );

  const toggleFacility = (id: number) => {
    setForm((prev) => ({
      ...prev,
      facility_ids: prev.facility_ids.includes(id)
        ? prev.facility_ids.filter((item) => item !== id)
        : [...prev.facility_ids, id]
    }));
  };

  const submit = async () => {
    const saved = await create({ ...form, estimated_minutes: Number(form.estimated_minutes) || 0 });
    setSelectedId(saved.id);
    setForm(createRoutePlanForm());
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>路线规划</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <section className="workbench">
        <div className="panel wide">
          <h2>路线列表</h2>
          {rows.length === 0 && !loading ? (
            <EmptyState title="暂无路线" />
          ) : (
            <div className="table">
              {rows.map((row) => (
                <article
                  key={row.id}
                  className={"row route-row" + (selected?.id === row.id ? " selected" : "")}
                  onClick={() => setSelectedId(row.id)}
                >
                  <strong>{row.origin_text} → {row.destination_text}</strong>
                  <span>{row.facility_ids.length} 个设施 · {row.estimated_minutes} 分钟</span>
                  <StatusBadge value={row.risk_level} />
                </article>
              ))}
            </div>
          )}
          <h2>新建路线</h2>
          <div className="route-form">
            <label>
              起点
              <input value={form.origin_text} onChange={(event) => setForm({ ...form, origin_text: event.target.value })} />
            </label>
            <label>
              终点
              <input value={form.destination_text} onChange={(event) => setForm({ ...form, destination_text: event.target.value })} />
            </label>
            <label>
              出行方式
              <select value={form.route_mode} onChange={(event) => setForm({ ...form, route_mode: event.target.value })}>
                {ROUTE_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              预计分钟
              <input
                type="number"
                value={form.estimated_minutes}
                onChange={(event) => setForm({ ...form, estimated_minutes: Number(event.target.value) })}
              />
            </label>
            <fieldset>
              <legend>沿途设施（保存时按设施状态与未关闭障碍上报自动计算风险等级，无需手填）</legend>
              {facilities.map((facility) => (
                <label key={facility.id} className="facility-option">
                  <input
                    type="checkbox"
                    checked={form.facility_ids.includes(facility.id)}
                    onChange={() => toggleFacility(facility.id)}
                  />
                  <FacilityTag title={facility.name} value={facility.status} />
                </label>
              ))}
            </fieldset>
            <button className="primary" onClick={submit} disabled={loading}>保存路线并计算风险</button>
          </div>
        </div>
        <div className="panel">
          <h2>路线详情</h2>
          {selected ? (
            <>
              <dl className="route-detail">
                <dt>起终点</dt>
                <dd>{selected.origin_text} → {selected.destination_text}</dd>
                <dt>出行方式</dt>
                <dd>{ROUTE_MODE_OPTIONS.find((option) => option.value === selected.route_mode)?.label ?? selected.route_mode}</dd>
                <dt>风险等级</dt>
                <dd><StatusBadge value={selected.risk_level} /> {formatRisk(selected.risk_level)}</dd>
                <dt>等级策略</dt>
                <dd>{formatRiskPolicy(selected.risk_policy ?? DEFAULT_RISK_POLICY)}</dd>
                <dt>沿途设施</dt>
                <dd>{selected.facility_ids.map((id) => facilities.find((facility) => facility.id === id)?.name ?? `#${id}`).join("、") || "无"}</dd>
              </dl>
              <RouteRiskPanel route={selected} />
            </>
          ) : (
            <EmptyState title="暂无路线，请先新建" />
          )}
        </div>
      </section>
    </main>
  );
}
