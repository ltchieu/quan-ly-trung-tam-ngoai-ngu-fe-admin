export interface StudentModel {
  mahocvien: number;
  manguoidung: number;
  hoten: string;
  gioitinh: boolean; // true: Nam, false: Nữ
  ngaysinh: string;
  sdt: string;
  email: string;
  diachi: string;
  hinhanh: string;
  trinhdo: string;
}

export interface StudentAdminResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  dateOfBirth: string;
  address: string | null;
  occupation: string | null;
  educationLevel: string | null;
  enrollmentDate: string;
  totalClassesEnrolled: number;
  enrolledClassIds: number[];
}

export interface StudentListResponse {
  content: StudentAdminResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateStudentAdminRequest {
  phoneNumber: string;
  email?: string;
  name: string;
  dateOfBirth?: string;
  gender?: boolean;
  address?: string;
  job?: string;
}

export interface CreateStudentAdminResponse {
  studentId: number;
  name: string;
  dateOfBirth: string;
  gender: boolean;
  jobs: string;
  email: string;
  phoneNumber: string;
  address: string;
  image: string | null;
}
