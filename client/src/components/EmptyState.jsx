export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={34} strokeWidth={1.5} />
        </div>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
