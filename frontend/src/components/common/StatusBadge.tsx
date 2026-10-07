const BADGE_TEXT: Record<string, string> = {
  LOW_RISK: "低风险",
  MEDIUM_RISK: "中风险",
  HIGH_RISK: "高风险",
  LOCAL_DATA: "本地数据",
  READY: "就绪"
};

export function StatusBadge({ value }: { value: string }) {
  const key = String(value);
  return (
    <span className={"badge " + key.toLowerCase().replace(/_/g, "-")}>
      {BADGE_TEXT[key] ?? key.replace(/_/g, " ")}
    </span>
  );
}
