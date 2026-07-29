import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      // Save authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "member") {
        navigate("/member");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h2>LeadFlow</h2>
          <p>Lead Management System</p>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <div className="login-footer">
          <p>
            Want to submit an enquiry? <a href="/">Contact us</a>
            <p className="back-home">
              <a href="/">← Back to website</a>
            </p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
