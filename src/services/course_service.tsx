import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import {
  CourseCreateRequest,
  CourseUpdateRequest,
  ModuleUpdateRequest,
  SkillResponse,
} from "../model/course_model";
import { ModuleData } from "../model/module_model";
import { NewCourseState } from "../pages/admin/add_course";

export function getAllCourse(page: number, size: number) {
  return axiosClient.get("/courses", {
    params: {
      page: page,
      size: size,
    },
  });
}

export function getCourseDetail(id?: number) {
  return axiosClient.get(`/courses/${id}`);
}

export function updateCourse(
  courseId: number,
  updateData: CourseUpdateRequest
) {
  return axiosClient.put(`/courses/${courseId}`, updateData);
}

export function getModulesByCourseId(courseId: number) {
  return axiosClient.get<ModuleData[]>("/modules", { params: { courseId } });
}

export function updateModule(
  moduleId: number,
  updateData: ModuleUpdateRequest
) {
  console.log("Updating module:", moduleId, "Data:", updateData);
  return axiosClient.put(`/modules/${moduleId}`, updateData);
}

export function createModule(
  courseId: number,
  moduleData: { moduleName: string; duration: number }
) {
  return axiosClient.post("/modules", { ...moduleData, courseId });
}

export function deleteModule(moduleId: number) {
  return axiosClient.delete(`/modules/${moduleId}`);
}

//Tạo khóa học
export function createNewCourse(courseData: NewCourseState) {
  // Map dữ liệu từ frontend (NewCourseState) sang backend (CourseCreateRequest)
  const requestData: CourseCreateRequest = {
    courseName: courseData.tenkhoahoc,
    tuitionFee: courseData.hocphi,
    video: courseData.video,
    description: courseData.description,
    studyHours: courseData.sogiohoc,
    courseCategoryId: Number(courseData.courseCategoryId),
    entryLevel: courseData.entryLevel,
    targetLevel: courseData.targetLevel,
    image: courseData.image,

    objectives: courseData.muctieu.map((obj) => ({
      objectiveName: obj.tenmuctieu,
    })),

    skillIds: courseData.skillIds,

    modules: courseData.modules.map((mod) => ({
      moduleName: mod.tenmodule,
      skillId: mod.skillId,
      duration: mod.duration,
      documents: mod.tailieu.map((doc) => ({
        fileName: doc.tenfile,
        link: doc.link,
        description: doc.mota,
        image: doc.hinh,
      })),
      contents: mod.noidung.map((con) => ({
        contentName: con.tennoidung,
      })),
    })),
  };
  console.log("Request Data for creating course:", requestData);
  return axiosClient.post("/courses", requestData);
}



export function changeCourseStatus(courseId: number) {
  const url = `/courses/status/${courseId}`;
  return axiosClient.post(url);
}

// Cập nhật mục tiêu
export function updateObjective(objectiveId: number, description: string) {
  return axiosClient.put(`/courses/objectives/${objectiveId}`, {
    objectiveName: description,
  });
}

//Lấy danh sách các skills
export const getAllSkills = async (): Promise<ApiResponse<SkillResponse[]>> => {
  try {
    const res = await axiosClient.get<ApiResponse<SkillResponse[]>>("/skills");

    if (res.data) {
      return res.data;
    } else {
      throw new Error("Không thể lấy danh sách kỹ năng");
    }
  } catch (err: any) {
    console.error("Lỗi API getAllSkills:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách kỹ năng"
    );
  }
};
