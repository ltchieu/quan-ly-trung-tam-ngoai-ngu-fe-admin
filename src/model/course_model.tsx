import { DocumentData } from "../pages/add_course";

export interface Objective {
  id: number;
  objectiveName: string;
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
  entryLevel: string;
  targetLevel: string;
  image: string;
  objectives: { objectiveName: string }[];
  modules: {
    moduleName: string;
    duration: number;
    documents: {
      fileName: string;
      link: string;
      description: string;
    }[];
  contents: {
      contentName: string;
    }[]; 
}[]
}

export interface CourseDetails {
  // Bảng khoahoc
  tenkhoahoc: string;
  sogiohoc: number;
  hocphi: number;
  sobuoihoc: number;
  video: string;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;
  trangthai: boolean;

  // Bảng muctieukh
  muctieu: { tenmuctieu: string }[];

  // Bảng module và các bảng con
  modules: {
    tenmodule: string;
    thoiluong: number;
    noidung: { tennoidung: string }[];
    tailieu: DocumentData[];
  }[];
}

export interface CourseUpdateRequest {
  courseName: string;
  tuitionFee: number;
  video: string;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;
  // Objectives có thể gửi ở đây nếu backend xử lý
  // objectives?: { objectiveName: string }[];
}

export interface ModuleUpdateRequest {
  moduleName: string;
  duration: number;
  documents?: {
    fileName: string;
    link: string;
    description: string;
    image: string;
  }[];
  contents?: {
    id: number;
    contentName: string;
  }[];
}