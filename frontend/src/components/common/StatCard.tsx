export function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "default" | "danger" }) {
  return <div className={`stat${tone === "danger" ? " danger" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}
