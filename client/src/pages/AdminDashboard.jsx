import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [message, setMessage] = useState("");

  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const limit = 5;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const response = await api.post("/leads", formData);

      setMessage(response.data.message || "Lead created successfully");

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
      });

      // Refresh lead list
      setPage(1);
      await fetchLeads();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create lead");
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (memberFilter) {
        params.assignedTo = memberFilter;
      }

      const response = await api.get("/leads", { params });

      setLeads(response.data.leads || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalLeads(response.data.totalLeads || 0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, memberFilter]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/auth/members");
        setMembers(response.data.members || []);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Unable to load leads</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const handleAssignLead = async (leadId) => {
    const memberId = selectedMembers[leadId];

    if (!memberId) {
      setMessage("Please select a member");
      return;
    }

    try {
      setMessage("");

      const response = await api.patch(`/leads/${leadId}/assign`, {
        userId: memberId,
      });

      setMessage(response.data.message || "Lead assigned successfully");

      // Refresh leads
      await fetchLeads();

      setSelectedMembers((previous) => ({
        ...previous,
        [leadId]: "",
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to assign lead");
    }
  };

  const handleDeleteLead = async (leadId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await api.delete(`/leads/${leadId}`);

      setMessage(response.data.message || "Lead deleted successfully");

      await fetchLeads();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMemberFilter("");
    setPage(1);
  };

  return (
    <div className="dashboard-page">
      <DashboardNavbar role="admin" />
      <header className="dashboard-header">
        <div>
          <span className="dashboard-label">ADMIN PORTAL</span>
          <h1>Lead Management</h1>
          <p>Manage, assign and track your sales leads.</p>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Summary Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Leads</span>
            <strong>{leads.length}</strong>
          </div>

          <div className="stat-card">
            <span>New</span>
            <strong>
              {leads.filter((lead) => lead.status === "new").length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Qualified</span>
            <strong>
              {leads.filter((lead) => lead.status === "qualified").length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Won</span>
            <strong>
              {leads.filter((lead) => lead.status === "won").length}
            </strong>
          </div>
        </section>

        {message && (
          <div
            className={`dashboard-message ${
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("please")
                ? "message-error"
                : "message-success"
            }`}
          >
            <span>{message}</span>

            <button
              type="button"
              className="message-close"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Create Lead */}
        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <h2>Create New Lead</h2>
              <p>Add a new prospect to your lead pipeline.</p>
            </div>
          </div>

          <form className="create-lead-form" onSubmit={handleCreateLead}>
            <div>
              <label>Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Company</label>
              <input
                type="text"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="create-button-wrapper">
              <button type="submit">Create Lead</button>
            </div>
          </form>
        </section>

        {/* Leads */}
        <section className="dashboard-card">
          <div className="section-heading">
            <div className="lead-toolbar">
              <form className="lead-search" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search name, email, company or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <button type="submit">Search</button>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={memberFilter}
                onChange={(e) => {
                  setMemberFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Members</option>

                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="secondary-button"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>

            <div>
              <h2>All Leads</h2>
              <p>View, assign and manage all leads in the system.</p>
            </div>

            <span className="lead-count">
              {leads.length} {leads.length === 1 ? "Lead" : "Leads"}
            </span>
          </div>

          {leads.length === 0 ? (
            <div className="empty-state">
              <h3>No leads found</h3>
              <p>Create your first lead using the form above.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <Link className="lead-name" to={`/leads/${lead._id}`}>
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
                        <span className={`status-badge status-${lead.status}`}>
                          {lead.status}
                        </span>
                      </td>

                      <td>
                        {lead.assignedTo?.name ? (
                          <span className="assigned-user">
                            {lead.assignedTo.name}
                          </span>
                        ) : (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </td>

                      <td>
                        <div className="lead-actions">
                          <select
                            value={selectedMembers[lead._id] || ""}
                            onChange={(e) =>
                              setSelectedMembers({
                                ...selectedMembers,
                                [lead._id]: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Member</option>

                            {members.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name}
                              </option>
                            ))}
                          </select>

                          <div className="action-buttons">
                            <button
                              type="button"
                              onClick={() => handleAssignLead(lead._id)}
                            >
                              Assign
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => navigate(`/leads/${lead._id}`)}
                            >
                              View / Edit
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => handleDeleteLead(lead._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination">
            <div className="pagination-info">
              {totalLeads === 0
                ? "No leads found"
                : `Showing ${(page - 1) * limit + 1}-${Math.min(
                    page * limit,
                    totalLeads,
                  )} of ${totalLeads} leads`}
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="secondary-button"
                disabled={page <= 1}
                onClick={() => setPage((previous) => previous - 1)}
              >
                Previous
              </button>

              <span>
                Page <strong>{page}</strong> of{" "}
                <strong>{Math.max(totalPages, 1)}</strong>
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((previous) => previous + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
