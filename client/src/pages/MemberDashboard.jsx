import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";

const MemberDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get("/leads");
        setLeads(response.data.leads || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch assigned leads",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) {
    return <p>Loading leads...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

 return (
  <div className="dashboard-page">
    <DashboardNavbar role="member" />
    <header className="dashboard-header">
      <div>
        <span className="dashboard-label">MEMBER PORTAL</span>
        <h1>My Leads</h1>
        <p>View and manage the leads assigned to you.</p>
      </div>
    </header>

    <main className="dashboard-content">
      {/* Summary Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span>Assigned Leads</span>
          <strong>{leads.length}</strong>
        </div>

        <div className="stat-card">
          <span>New</span>
          <strong>
            {leads.filter((lead) => lead.status === "new").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Contacted</span>
          <strong>
            {leads.filter((lead) => lead.status === "contacted").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Qualified</span>
          <strong>
            {leads.filter((lead) => lead.status === "qualified").length}
          </strong>
        </div>
      </section>

      {/* Assigned Leads */}
      <section className="dashboard-card">
        <div className="section-heading">
          <div>
            <h2>My Assigned Leads</h2>
            <p>
              Open a lead to update its status, add notes and
              review activity.
            </p>
          </div>

          <span className="lead-count">
            {leads.length} {leads.length === 1 ? "Lead" : "Leads"}
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="empty-state">
            <h3>No leads assigned</h3>
            <p>
              You currently don't have any leads assigned to you.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="leads-table member-leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <Link
                        className="lead-name"
                        to={`/leads/${lead._id}`}
                      >
                        {lead.name}
                      </Link>
                    </td>

                    <td>
                      <div className="contact-cell">
                        <span>{lead.email}</span>
                        <small>{lead.phone || "No phone"}</small>
                      </div>
                    </td>

                    <td>{lead.company || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${lead.status}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        className="view-lead-button"
                        to={`/leads/${lead._id}`}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  </div>
);
};

export default MemberDashboard;
