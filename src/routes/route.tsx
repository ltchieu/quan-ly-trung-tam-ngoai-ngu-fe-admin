import { Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/dashboard";
import MainLayout from "../layouts/main_layout";
import Course from "../pages/course";
import CreateCoursePage from "../pages/add_course";
import EditCourse from "../pages/edit_course";

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />}></Route>
          <Route path="/courses" element={<Course />}></Route>
          <Route path="/addCourse" element={<CreateCoursePage />}></Route>
          <Route path="/editCourse/:id" element={<EditCourse />}></Route>
        </Route>
      </Routes>
    </div>
  );
}
export default AppRoutes;
