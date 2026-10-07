export function EmptyState({ title = "暂无数据", description, actionText, onAction }: {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {description && <p className="muted small">{description}</p>}
      {actionText && onAction && <button className="primary-btn" onClick={onAction}>{actionText}</button>}
    </div>
  );
}
