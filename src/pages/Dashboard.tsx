import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import FacultyDashboard from "@/components/dashboard/FacultyDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function Dashboard() {
  const { role } = useAuth();
  
  if (role === "admin") return <AdminDashboard />;
  if (role === "faculty") return <FacultyDashboard />;
  if (role === "student") return <StudentDashboard />;
  
  return null;
}
