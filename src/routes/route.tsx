import { Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/dashboard";
import MainLayout from "../layouts/main_layout";
import Course from "../pages/course";
import CreateCoursePage from "../pages/add_course";

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />}></Route>
          <Route path="/course" element={<Course />}></Route>
          <Route path="/addCourse" element={<CreateCoursePage />}></Route>
        </Route>
      </Routes>
    </div>
  );
}
export default AppRoutes;
