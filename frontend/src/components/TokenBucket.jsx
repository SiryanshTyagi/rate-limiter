function TokenBucket({ tokens, bucketSize }) {
  const percentage = (tokens / bucketSize) * 100;

  return (
    <div className="token-card">
      <h2>Token Bucket</h2>

      <p className="token-label">Remaining Tokens</p>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <h3>
        {tokens} / {bucketSize}
      </h3>
    </div>
  );
}

export default TokenBucket;
