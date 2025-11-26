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
import Timetable from "../pages/schedule";
import EditClass from "../pages/edit_class";
import Student from "../pages/student";
import StudentDetail from "../pages/student_detail";
import PromotionListPage from "../pages/promotion_list";
import AddPromotionPage from "../pages/add_promotion";
import PromotionDetailPage from "../pages/promotion_detail";
import TeacherListPage from "../pages/teacher_list";
import AddTeacherPage from "../pages/add_teacher";
import TeacherDetailPage from "../pages/teacher_detail";

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
              <Route path="/schedule" element={<Timetable />}></Route>
              <Route path="/class/edit/:id" element={<EditClass />}></Route>
              <Route path="/students" element={<Student />}></Route>
              <Route path="/student/:id" element={<StudentDetail />}></Route>
              <Route path="/promotions" element={<PromotionListPage />}></Route>
              <Route path="/promotions/add" element={<AddPromotionPage />}></Route>
              <Route path="/promotions/:id" element={<PromotionDetailPage />}></Route>
              <Route path="/teachers" element={<TeacherListPage />}></Route>
              <Route path="/teachers/add" element={<AddTeacherPage />}></Route>
              <Route path="/teachers/:id" element={<TeacherDetailPage />}></Route>
            </Route>
          </Route>
        ) : (
          <Route path="/login" element={<Login />}></Route>
        )}

        <Route
          path="*"
          element={<Navigate to={accessToken ? "/" : "/login"} replace />}
        ></Route>
      </Routes>
    </div>
  );
}
export default AppRoutes;
