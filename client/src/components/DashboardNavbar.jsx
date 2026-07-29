import LogoutButton from "./LogoutButton";

const DashboardNavbar = ({ role }) => {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand">
        <h2>LeadFlow</h2>
        <span>Lead Management System</span>
      </div>

      <div className="navbar-account">
        <div className="user-info">
          <strong>{storedUser.name || "User"}</strong>
          <span>{role === "admin" ? "Administrator" : "Team Member"}</span>
        </div>

        <span
          className={`role-badge ${
            role === "member" ? "member-role-badge" : ""
          }`}
        >
          {role === "admin" ? "Admin" : "Member"}
        </span>

        <LogoutButton />
      </div>
    </nav>
  );
};

export default DashboardNavbar;