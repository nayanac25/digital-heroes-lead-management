import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const [noteText, setNoteText] = useState("");
  const [noteMessage, setNoteMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = storedUser.role === "admin";

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await api.get(`/leads/${id}`);
        const leadData = response.data.lead || response.data;

        setLead(leadData);
        setStatus(leadData.status);

        setEditData({
          name: leadData.name || "",
          email: leadData.email || "",
          phone: leadData.phone || "",
          company: leadData.company || "",
        });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch lead");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader"></div>
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Unable to load lead</h2>
        <p>{error}</p>

        <button type="button" onClick={() => navigate(-1)}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="page-error">
        <h2>Lead not found</h2>
        <p>The requested lead could not be found.</p>

        <button type="button" onClick={() => navigate(-1)}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    try {
      setMessage("");

      const response = await api.patch(`/leads/${id}/status`, {
        status,
      });

      setMessage(response.data.message || "Lead status updated successfully");

      setLead((previousLead) => ({
        ...previousLead,
        status,
      }));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to update lead status",
      );
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      setNoteMessage("Please enter a note");
      return;
    }

    try {
      setNoteMessage("");

      const response = await api.post(`/leads/${id}/notes`, {
        text: noteText,
      });

      setNoteMessage(response.data.message || "Note added successfully");

      setNoteText("");

      // Fetch latest lead again so notes + activity history refresh
      const updatedResponse = await api.get(`/leads/${id}`);
      const updatedLead = updatedResponse.data.lead || updatedResponse.data;

      setLead(updatedLead);
      setStatus(updatedLead.status);
    } catch (error) {
      setNoteMessage(error.response?.data?.message || "Failed to add note");
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();

    try {
      setEditMessage("");

      const response = await api.patch(`/leads/${id}`, editData);

      setEditMessage(response.data.message || "Lead updated successfully");

      const updatedLead = response.data.lead;

      setLead(updatedLead);

      setEditData({
        name: updatedLead.name || "",
        email: updatedLead.email || "",
        phone: updatedLead.phone || "",
        company: updatedLead.company || "",
      });
    } catch (error) {
      setEditMessage(error.response?.data?.message || "Failed to update lead");
    }
  };

  return (
    <div className="lead-details-page">
      <DashboardNavbar role={isAdmin ? "admin" : "member"} />
      <header className="lead-details-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to Dashboard
        </button>

        <div className="lead-title-row">
          <div>
            <span className="dashboard-label">LEAD DETAILS</span>
            <h1>{lead.name}</h1>
            <p>{lead.company || "No company provided"}</p>
          </div>

          <span className={`status-badge status-${lead.status}`}>
            {lead.status}
          </span>
        </div>
      </header>

      <main className="lead-details-content">
        <div className="lead-details-grid">
          {/* LEFT COLUMN */}
          <div className="lead-main-column">
            {/* Lead Information */}
            <section className="details-card">
              <div className="section-heading">
                <div>
                  <h2>Lead Information</h2>
                  <p>Contact and assignment details.</p>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span>Email</span>
                  <strong>{lead.email}</strong>
                </div>

                <div className="info-item">
                  <span>Phone</span>
                  <strong>{lead.phone || "-"}</strong>
                </div>

                <div className="info-item">
                  <span>Company</span>
                  <strong>{lead.company || "-"}</strong>
                </div>

                <div className="info-item">
                  <span>Assigned To</span>
                  <strong>{lead.assignedTo?.name || "Unassigned"}</strong>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="details-card">
              <div className="section-heading">
                <div>
                  <h2>Notes</h2>
                  <p>Add and review notes for this lead.</p>
                </div>
              </div>

              <div className="add-note-box">
                <textarea
                  placeholder="Write a note about this lead..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows="4"
                />

                <button type="button" onClick={handleAddNote}>
                  Add Note
                </button>

                {noteMessage && (
                  <div
                    className={`inline-message ${
                      noteMessage.toLowerCase().includes("failed") ||
                      noteMessage.toLowerCase().includes("please")
                        ? "inline-error"
                        : "inline-success"
                    }`}
                  >
                    {noteMessage}
                  </div>
                )}
              </div>

              <div className="notes-list">
                {lead.notes?.length > 0 ? (
                  [...lead.notes].reverse().map((note) => (
                    <div className="note-item" key={note._id}>
                      <p>{note.text}</p>

                      <div className="note-meta">
                        <span>Added by {note.addedBy?.name || "User"}</span>

                        {note.createdAt && (
                          <span>
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No notes available.</p>
                )}
              </div>
            </section>

            {/* Activity */}
            <section className="details-card">
              <div className="section-heading">
                <div>
                  <h2>Activity History</h2>
                  <p>Timeline of actions performed on this lead.</p>
                </div>
              </div>

              <div className="activity-timeline">
                {lead.activities?.length > 0 ? (
                  [...lead.activities].reverse().map((activity) => (
                    <div className="activity-item" key={activity._id}>
                      <div className="activity-dot"></div>

                      <div className="activity-content">
                        <p>{activity.action}</p>

                        <div className="activity-meta">
                          {activity.performedBy?.name && (
                            <span>By {activity.performedBy.name}</span>
                          )}

                          {activity.createdAt && (
                            <span>
                              {new Date(activity.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No activity available.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="lead-side-column">
            {/* Status */}
            <section className="details-card">
              <h2>Update Status</h2>

              <p className="card-description">
                Move this lead through the sales pipeline.
              </p>

              <label>Lead Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <button
                type="button"
                className="full-width-button"
                onClick={handleStatusUpdate}
              >
                Update Status
              </button>

              {message && (
                <div
                  className={`inline-message ${
                    message.toLowerCase().includes("failed")
                      ? "inline-error"
                      : "inline-success"
                  }`}
                >
                  {message}
                </div>
              )}
            </section>

            {/* Admin Edit */}
            {isAdmin && (
              <section className="details-card">
                <h2>Edit Lead</h2>

                <p className="card-description">
                  Update the lead's contact information.
                </p>

                <form onSubmit={handleUpdateLead}>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    required
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    required
                  />

                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                  />

                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editData.company}
                    onChange={handleEditChange}
                  />

                  <button type="submit" className="full-width-button">
                    Save Changes
                  </button>
                </form>

                {editMessage && (
                  <div
                    className={`inline-message ${
                      editMessage.toLowerCase().includes("failed")
                        ? "inline-error"
                        : "inline-success"
                    }`}
                  >
                    {editMessage}
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default LeadDetails;
