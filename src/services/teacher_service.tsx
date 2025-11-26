import { GiangVien } from "../model/teacher_model";

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
  trinhdo: ["Thạc sĩ", "Tiến sĩ", "Cử nhân"][index % 3],
  mota: "Giảng viên giàu kinh nghiệm",
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

export const getTeacherById = async (id: number): Promise<GiangVien | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_TEACHERS.find((t) => t.magv === id);
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
