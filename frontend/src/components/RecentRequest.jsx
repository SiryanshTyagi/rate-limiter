function RecentRequests({ requests }) {
  return (
    <div className="recent-requests">
      <h2>Recent Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="2">No requests yet.</td>
            </tr>
          ) : (
            requests.map((request, index) => (
              <tr key={index}>
                <td>{request.time}</td>

                <td>
                  <span
                    className={
                      request.status === 200
                        ? "status-badge allowed"
                        : "status-badge blocked"
                    }
                  >
                    {request.status === 200 ? "Allowed" : "Blocked"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RecentRequests;
