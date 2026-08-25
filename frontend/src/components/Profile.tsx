import "./Profile.css";

function Profile() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

 const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Go to onboarding / landing page after logout
  window.location.href = "/";
};

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-avatar">
          {(user.name || "S").charAt(0).toUpperCase()}
        </div>

        <h1>
          {user.name || "Student"}
        </h1>

        <p className="profile-email">
          {user.email || "No email available"}
        </p>

        <div className="profile-info">

          <div>
            <span>Name</span>
            <strong>
              {user.name || "Student"}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>
              {user.email || "No email available"}
            </strong>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;