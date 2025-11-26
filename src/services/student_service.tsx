import { StudentModel } from "../model/student_model";

const MOCK_STUDENTS: StudentModel[] = Array.from({ length: 50 }).map((_, index) => ({
  mahocvien: index + 1,
  manguoidung: 100 + index,
  hoten: `Học viên ${index + 1}`,
  gioitinh: index % 2 === 0, // Nam/Nữ xen kẽ
  ngaysinh: "2000-01-01",
  sdt: `090${1000000 + index}`,
  email: `student${index + 1}@example.com`,
  diachi: `Số ${index + 1} Đường ABC, Quận XYZ, TP.HCM`,
  hinhanh: "https://via.placeholder.com/150",
  trinhdo: ["Beginner", "Intermediate", "Advanced"][index % 3],
}));

export const getAllStudents = async (page: number, limit: number) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const start = page * limit;
  const end = start + limit;
  const data = MOCK_STUDENTS.slice(start, end);

  return {
    data: {
      data: {
        students: data,
        totalItems: MOCK_STUDENTS.length,
      },
    },
  };
};

export const getStudentById = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const student = MOCK_STUDENTS.find((s) => s.mahocvien === id);
  return {
    data: {
      data: student,
    },
  };
};

export const updateStudent = async (id: number, data: Partial<StudentModel>) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Updated student", id, data);
  return {
    data: {
      message: "Cập nhật thành công",
    },
  };
};
