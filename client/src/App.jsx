import { Routes, Route } from "react-router-dom";

import PublicLeadForm from "./pages/PublicLeadForm";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import LeadDetails from "./pages/LeadDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLeadForm />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Member Route */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRole="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      {/* Logged-in users */}
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;