import { StatusBadge } from "./StatusBadge";

const FACILITY_STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "AVAILABLE",
  BLOCKED: "BLOCKED",
  MAINTENANCE: "MAINTENANCE",
  UNKNOWN: "UNKNOWN"
};

export function FacilityTag({ name, status, locationCode, selected = false, onClick }: {
  name: string;
  status?: string;
  locationCode?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const badge = status ? FACILITY_STATUS_BADGE[status] ?? "UNKNOWN" : undefined;
  return (
    <button
      type="button"
      className={`shared-widget facility-tag${selected ? " selected" : ""}${onClick ? " clickable" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <strong>{name}</strong>
      {locationCode && <span className="facility-code">{locationCode}</span>}
      {badge && <StatusBadge value={badge} />}
    </button>
  );
}
