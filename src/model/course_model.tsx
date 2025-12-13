import { DocumentData } from "../pages/admin/add_course";
import { ClassInfo } from "./class_model";

export interface Objective {
  id: number;
  objectiveName: string;
}

export interface DanhMuc {
  madanhmuc: number;
  tendm: string;
}

//Tài liệu của module
export interface Document {
  documentId: number;
  fileName: string;
  link: string;
  description: string;
  image: string;
}

//Nội dung trong module
export interface ModuleContent {
  id: number;
  contentName: string;
}

//Mỗi module trong khóa học
export interface Module {
  moduleId: number;
  moduleName: string;
  duration: number;
  contents: ModuleContent[];
  documents: Document[];
}

//Toàn bộ khóa học
export interface CourseModel {
  courseId: number;
  courseName: string;
  studyHours: number;
  tuitionFee: number;
  numberOfSessions: number;
  video: string;
  isActive: boolean;
  createdDate: string;
  objectives: Objective[];
  modules: Module[];
}

export interface CourseCreateRequest {
  courseName: string;
  tuitionFee: number;
  video: string;
  description: string;
  studyHours: number;
  courseCategoryId: number;
  entryLevel: string;
  targetLevel: string;
  image: string;

  objectives: { objectiveName: string }[];

  skillIds: number[];

  modules: {
    moduleName: string;
    skillId: number;
    duration: number;
    documents: {
      fileName: string;
      link: string;
      description: string;
      image: string;
    }[];
    contents: {
      contentName: string;
    }[];
  }[];
}

export interface CourseDetails {
  // Bảng khoahoc
  tenkhoahoc: string;
  sogiohoc: number;
  hocphi: number;
  video: string;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;
  trangthai: boolean;
  courseCategoryId: number | string;

  // Bảng muctieukh
  muctieu: { tenmuctieu: string }[];

  // Bảng module và các bảng con
  modules: {
    tenmodule: string;
    thoiluong: number;
    noidung: { tennoidung: string }[];
    tailieu: DocumentData[];
  }[];
  skillIds?: number[];
}

export interface CourseUpdateRequest {
  courseName: string;
  tuitionFee: number;
  video: string;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;
  categoryId: number;
  studyHours: number;
  skillIdsToAdd: number[];
  skillIdsToRemove: number[];
}

export enum ActionEnum {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface ContentUpdateRequest {
  id?: number;
  contentName?: string;
  action: ActionEnum;
}

export interface DocumentUpdateRequest {
  id?: number;
  fileName?: string;
  link?: string;
  description?: string;
  image?: string;
  action: ActionEnum;
}

export interface ModuleUpdateRequest {
  documents?: DocumentUpdateRequest[];
  contents?: ContentUpdateRequest[];
}

export interface ModuleUpdateBasicInfoRequest {
  moduleName: string;
  duration: number;
}

export interface SkillResponse {
  id: number;
  skillName: string;
}

export interface SkillModuleGroup {
  skillId: number;
  skillName: string;
  modules: Module[];
}

export interface ComboPromotionInfo {
  comboName: string;
  discountPercent: number;
  requiredCourseNames: string[];
}

export interface CourseDetailResponse {
  courseId: number;
  courseName: string;
  studyHours: number;
  tuitionFee: number;
  PromotionPrice: number;
  video: string;
  status: boolean;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;
  courseCategoryId: number;
  category: string;
  level: string;
  objectives: Objective[];
  skillModules: SkillModuleGroup[];
  comboPromotions: ComboPromotionInfo[];
  classInfos: ClassInfo[];
}
