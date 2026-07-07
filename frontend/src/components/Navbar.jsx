function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>Token Bucket Rate Limiter</h1>
        <p>Backend Showcase Dashboard</p>
      </div>

      <div className="navbar-status">
        <span className="status up">Backend: UP</span>
        <span className="status connected">Redis: CONNECTED</span>
      </div>
    </header>
  );
}

export default Navbar;
