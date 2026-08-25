import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <p className="dashboard-eyebrow">
          WELCOME TO DE ZÉRO
        </p>

        <h1>
          Welcome back,
          <span>{user?.name || "Developer"}.</span>
        </h1>

        <p className="dashboard-description">
          Your personalized developer journey starts here.
        </p>

        <div className="dashboard-card">
          <h2>Your journey</h2>
          <p>
            This is your personalized dashboard. We’ll build your
            learning path, projects, interview preparation and
            career progress here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;