function Navbar({ health }) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>Token Bucket Rate Limiter</h1>
        <p>Backend Showcase Dashboard</p>
      </div>

      <div className="navbar-status">
        <span className="status up">
          Backend: {health ? health.status : "Loading..."}
        </span>

        <span className="status connected">
          Redis: {health ? health.redis : "Loading..."}
        </span>
        <p>Uptime: {health ? `${health.uptime}s` : "Loading..."}</p>
      </div>
    </header>
  );
}

export default Navbar;
