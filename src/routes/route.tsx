import { Navigate, Route, Routes } from "react-router-dom";
import RoleBasedRoute from "./role_based_route";
import DashboardPage from "../pages/admin/dashboard";
import MainLayout from "../layouts/main_layout";
import Course from "../pages/admin/course";
import CreateCoursePage from "../pages/admin/add_course";
import EditCourse from "../pages/admin/edit_course";
import ClassListPage from "../pages/admin/class";
import AddClassPage from "../pages/admin/add_class";
import Login from "../auth/login";
import ForgotPassword from "../auth/forgot_password";
import ResetPassword from "../auth/reset_password";
import { useAuth } from "../hook/useAuth";
import ProtectedRoute from "./protected_route";
import Timetable from "../pages/admin/schedule";
import EditClass from "../pages/admin/edit_class";
import Student from "../pages/admin/student";
import StudentDetail from "../pages/admin/student_detail";
import AddStudentPage from "../pages/admin/add_student";
import PromotionListPage from "../pages/admin/promotion_list";
import AddPromotionPage from "../pages/admin/add_promotion";
import PromotionDetailPage from "../pages/admin/promotion_detail";
import TeacherListPage from "../pages/admin/teacher_list";
import AddTeacherPage from "../pages/admin/add_teacher";
import TeacherDetailPage from "../pages/admin/teacher_detail";
import TeacherDashboard from "../pages/teacher/dashboard";
import TeacherSchedule from "../pages/teacher/schedule";
import TeacherClassList from "../pages/teacher/class_list";
import TeacherClassDetail from "../pages/teacher/class_detail";
import TeacherAttendance from "../pages/teacher/attendance";
import TeacherAttendanceList from "../pages/teacher/attendance_list";
import TeacherProfile from "../pages/teacher/profile";
import TeacherScoreManagement from "../pages/teacher/score_management";
import CategoryPage from "../pages/admin/category_page";
import RoomPage from "../pages/admin/room_page";
import RoomDetailPage from "../pages/admin/room_detail";
import Unauthorized from "../pages/unauthorized";

function HomeRedirect() {
  const { role } = useAuth();
  if (role === 'ADMIN') {
    return <DashboardPage />;
  } else if (role === 'TEACHER') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
}

function AppRoutes() {
  const { accessToken, role, isLoading } = useAuth();

  if (isLoading) return <div>Loading session...</div>;

  return (
    <div>
      <Routes>
        {/* Common Authenticated Routes */}
        {accessToken ? (
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomeRedirect />} />
            </Route>
          </Route>
        ) : null}

        {/* Admin Routes - Only for ADMIN role */}
        {accessToken ? (
          <Route element={<RoleBasedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/courses" element={<Course />}></Route>
                <Route path="/addCourse" element={<CreateCoursePage />}></Route>
                <Route path="/editCourse/:id" element={<EditCourse />}></Route>
                <Route path="/class" element={<ClassListPage />}></Route>
                <Route path="/class/add" element={<AddClassPage />}></Route>
                <Route path="/schedule" element={<Timetable />}></Route>
                <Route path="/class/edit/:id" element={<EditClass />}></Route>
                <Route path="/students" element={<Student />}></Route>
                <Route path="/students/add" element={<AddStudentPage />}></Route>
                <Route path="/students/:id" element={<StudentDetail />}></Route>
                <Route path="/promotions" element={<PromotionListPage />}></Route>
                <Route path="/promotions/add" element={<AddPromotionPage />}></Route>
                <Route path="/promotions/:id" element={<PromotionDetailPage />}></Route>
                <Route path="/teachers" element={<TeacherListPage />}></Route>
                <Route path="/teachers/add" element={<AddTeacherPage />}></Route>
                <Route path="/teachers/:id" element={<TeacherDetailPage />}></Route>
                <Route path="/categories" element={<CategoryPage />}></Route>
                <Route path="/rooms" element={<RoomPage />}></Route>
                <Route path="/rooms/:id" element={<RoomDetailPage />}></Route>
              </Route>
            </Route>
          </Route>
        ) : null}

        {/* Teacher Routes - For TEACHER and ADMIN roles */}
        {accessToken ? (
          <Route element={<RoleBasedRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                <Route path="/teacher/classes" element={<TeacherClassList />} />
                <Route path="/teacher/classes/:classId" element={<TeacherClassDetail />} />
                <Route path="/teacher/classes/:classId/attendance" element={<TeacherAttendance />} />
                <Route path="/teacher/classes/:classId/scores" element={<TeacherScoreManagement />} />
                <Route path="/teacher/attendance" element={<TeacherAttendanceList />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
              </Route>
            </Route>
          </Route>
        ) : null}

        {/* Unauthorized page - accessible to all authenticated users */}
        {accessToken ? (
          <Route element={<ProtectedRoute />}>
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>
        ) : null}

        {/* Login Route */}
        <Route path="/login" element={<Login />}></Route>

        {/* Forgot Password Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>

        {/* Catch-all route */}
        <Route
          path="*"
          element={<Navigate to={accessToken ? "/" : "/login"} replace />}
        ></Route>
      </Routes>
    </div>
  );
}
export default AppRoutes;
