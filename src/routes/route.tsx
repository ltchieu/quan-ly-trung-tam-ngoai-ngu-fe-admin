import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/dashboard";
import MainLayout from "../layouts/main_layout";
import Course from "../pages/course";
import CreateCoursePage from "../pages/add_course";
import EditCourse from "../pages/edit_course";
import ClassListPage from "../pages/class";
import Login from "../auth/login";
import { useAuth } from "../hook/useAuth";
import ProtectedRoute from "./protected_route";

function AppRoutes() {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) return <div>Loading session...</div>;

  return (
    <div>
      <Routes>
        {accessToken ? (
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />}></Route>
              <Route path="/courses" element={<Course />}></Route>
              <Route path="/addCourse" element={<CreateCoursePage />}></Route>
              <Route path="/editCourse/:id" element={<EditCourse />}></Route>
              <Route path="/class" element={<ClassListPage />}></Route>
            </Route>
          </Route>
        ) : (
          <Route path="/login" element={<Login />}></Route>
        )}

        <Route path="*" element={<Navigate to={accessToken ? "/" : "/login"} replace />}></Route>
      </Routes>
    </div>
  );
}
export default AppRoutes;
