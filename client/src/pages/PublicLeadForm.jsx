import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const PublicLeadForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/public/leads", formData);

      setMessage(response.data.message || "Lead submitted successfully");

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      <header className="public-header">
        <div>
          <h2>LeadFlow</h2>
          <span>Lead Management System</span>
        </div>

        <Link to="/login" className="login-link">
          Team Login
        </Link>
      </header>

      <main className="public-main">
        <div className="public-intro">
          <div className="public-features">
            <div>
              <strong>Quick Response</strong>
              <span>Submit your enquiry in minutes.</span>
            </div>

            <div>
              <strong>Simple Process</strong>
              <span>Our team will review your request.</span>
            </div>

            <div>
              <strong>Direct Follow-up</strong>
              <span>A team member will contact you.</span>
            </div>
          </div>
          <span className="eyebrow">GET IN TOUCH</span>

          <h1>Let's start a conversation.</h1>

          <p>
            Tell us a little about yourself and our team will get in touch with
            you shortly.
          </p>
        </div>

        <div className="lead-form-card">
          <h2>Contact Us</h2>
          <p>Enter your details below and we'll contact you.</p>

          <form onSubmit={handleSubmit}>
            <label>Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Company</label>
            <input
              type="text"
              name="company"
              placeholder="Company name (optional)"
              value={formData.company}
              onChange={handleChange}
            />

            <button
              className="submit-lead-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </button>
          </form>

          {message && <p className="form-message">{message}</p>}
        </div>
      </main>

      <footer>
        <p>
          Built for Digital Heroes Training Task{" "}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digital Heroes
          </a>
        </p>
      </footer>
    </div>
  );
};

export default PublicLeadForm;
