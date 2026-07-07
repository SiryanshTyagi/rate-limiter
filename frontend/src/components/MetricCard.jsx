function MetricCard({ title, value }) {
  return (
    <div className="metric-card">
      <p className="metric-title">{title}</p>
      <h2 className="metric-value">{value}</h2>
    </div>
  );
}
export default MetricCard;
