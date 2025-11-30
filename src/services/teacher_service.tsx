import { axiosClient } from "../api/axios_client";
import { GiangVien, LoaiBangCap, BangCap, TeacherInfo } from "../model/teacher_model";
import { ApiResponse } from "../model/api_respone";

export const getTeacherInfoById = async (id?: number | string): Promise<TeacherInfo> => {
  try {
    const role = localStorage.getItem("role");
    let url = "";

    if (role?.toUpperCase() === "LECTURER") {
      url = "/lecturers/me";
    } else if (role?.toUpperCase() === "ADMIN" && id) {
      url = `/lecturers/${id}`;
    } else {
      // Default or fallback if needed, or throw error if neither matches expectations
      // For now, let's assume if ID is provided we try to fetch by ID, otherwise me?
      // But the requirement is specific.
      if (id) url = `/lecturers/${id}`;
      else url = "/lecturers/me";
    }

    const response = await axiosClient.get<ApiResponse<TeacherInfo>>(url);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch teacher profile");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Teacher Profile API error:", message);
    throw new Error(message);
  }
};




// Mock data for Degree Types
const MOCK_DEGREE_TYPES: LoaiBangCap[] = [
  { maLoai: 1, ten: "Cử nhân" },
  { maLoai: 2, ten: "Thạc sĩ" },
  { maLoai: 3, ten: "Tiến sĩ" },
  { maLoai: 4, ten: "Chứng chỉ ngoại ngữ" },
  { maLoai: 5, ten: "Chứng chỉ sư phạm" },
];

// Mock data for Degrees
let MOCK_DEGREES: BangCap[] = [
  { ma: 1, maGiangVien: 1, maLoai: 1, trinhDo: "Giỏi", loaiBangCap: { maLoai: 1, ten: "Cử nhân" } },
  { ma: 2, maGiangVien: 1, maLoai: 4, trinhDo: "IELTS 8.0", loaiBangCap: { maLoai: 4, ten: "Chứng chỉ ngoại ngữ" } },
  { ma: 3, maGiangVien: 2, maLoai: 2, trinhDo: "Khá", loaiBangCap: { maLoai: 2, ten: "Thạc sĩ" } },
];


// Mock Data for Teachers
let MOCK_TEACHERS: GiangVien[] = Array.from({ length: 20 }).map((_, index) => ({
  magv: index + 1,
  hoten: `Giảng viên ${index + 1}`,
  ngaysinh: "1985-01-01",
  gioitinh: index % 2 === 0, // Nam/Nữ xen kẽ
  sdt: `090${1000000 + index}`,
  email: `teacher${index + 1}@example.com`,
  diachi: `Số ${index + 1} Đường ABC, Quận XYZ, TP.HCM`,
  anhdaidien: "https://via.placeholder.com/150",

  mota: "Giảng viên giàu kinh nghiệm",
  bangCaps: [],
}));

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export const getAllTeachers = async (page: number = 0, limit: number = 10, keyword: string = ""): Promise<PaginatedResult<GiangVien>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = MOCK_TEACHERS;
  if (keyword) {
    filtered = MOCK_TEACHERS.filter(t => t.hoten.toLowerCase().includes(keyword.toLowerCase()));
  }

  const start = page * limit;
  const end = start + limit;
  return {
    data: filtered.slice(start, end),
    total: filtered.length
  };
};

export const createTeacher = async (teacher: Omit<GiangVien, "magv">): Promise<GiangVien> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newId = Math.max(...MOCK_TEACHERS.map((t) => t.magv), 0) + 1;
  const newTeacher = { ...teacher, magv: newId };
  MOCK_TEACHERS.push(newTeacher);
  return newTeacher;
};

export const updateTeacher = async (id: number, teacher: Partial<GiangVien>): Promise<GiangVien> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = MOCK_TEACHERS.findIndex((t) => t.magv === id);
  if (index === -1) throw new Error("Teacher not found");

  MOCK_TEACHERS[index] = { ...MOCK_TEACHERS[index], ...teacher };
  return MOCK_TEACHERS[index];
};

export const deleteTeacher = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  MOCK_TEACHERS = MOCK_TEACHERS.filter((t) => t.magv !== id);
};


export const updateTeacherProfileMock = async (profile: GiangVien): Promise<GiangVien | null> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const index = MOCK_TEACHERS.findIndex(t => t.magv === profile.magv);
  if (index !== -1) {
    MOCK_TEACHERS[index] = profile;
    return profile;
  }
  return null;
};

export const getDegreeTypesMock = async (): Promise<LoaiBangCap[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_DEGREE_TYPES;
};

export const getTeacherDegreesMock = async (teacherId: number): Promise<BangCap[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_DEGREES.filter(d => d.maGiangVien === teacherId);
};

export const addTeacherDegreeMock = async (degree: Omit<BangCap, "ma" | "loaiBangCap">): Promise<BangCap> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newId = Math.max(...MOCK_DEGREES.map(d => d.ma), 0) + 1;
  const type = MOCK_DEGREE_TYPES.find(t => t.maLoai === degree.maLoai);
  const newDegree: BangCap = { ...degree, ma: newId, loaiBangCap: type || { maLoai: degree.maLoai, ten: "Unknown" } };
  MOCK_DEGREES.push(newDegree);

  // Update teacher's degree list in MOCK_TEACHERS
  const teacher = MOCK_TEACHERS.find(t => t.magv === degree.maGiangVien);
  if (teacher) {
    teacher.bangCaps.push(newDegree);
  }

  return newDegree;
};

export const deleteTeacherDegreeMock = async (degreeId: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const degreeIndex = MOCK_DEGREES.findIndex(d => d.ma === degreeId);
  if (degreeIndex !== -1) {
    const degree = MOCK_DEGREES[degreeIndex];
    MOCK_DEGREES.splice(degreeIndex, 1);

    // Update teacher's degree list in MOCK_TEACHERS
    const teacher = MOCK_TEACHERS.find(t => t.magv === degree.maGiangVien);
    if (teacher) {
      teacher.bangCaps = teacher.bangCaps.filter(d => d.ma !== degreeId);
    }

    return true;
  }
  return false;
};
