export interface LoaiBangCap {
  maLoai: number;
  ten: string;
}

export interface BangCap {
  ma: number;
  maGiangVien: number;
  maLoai: number;
  trinhDo: string;
  loaiBangCap?: LoaiBangCap
}

export interface GiangVien {
  magv: number;
  hoten: string;
  ngaysinh: string;
  gioitinh: boolean;
  sdt: string;
  email: string;
  diachi: string;
  anhdaidien: string;
  bangCaps: BangCap[];
  mota?: string;
}

export interface TeacherFilter {
  keyword?: string;
}

export interface QualificationDTO {
  degreeId: number;
  degreeName: string;
  level: string;
}

export interface AccountInfo {
  userId: number;
  username: string; // email hoặc sdt
  password?: string; // chỉ trả về nếu là admin
  role: string;
  createdAt: string;
  isVerified: boolean;
}

export interface TeacherInfo {
  lecturerId: number;
  fullName: string;
  dateOfBirth: string;
  imagePath: string;
  phoneNumber: string;
  email: string;
  
  // Thống kê
  totalClasses?: number;
  totalStudents?: number;
  rating?: number;
  totalReviews?: number;
  
  // Thông tin tài khoản (chỉ Admin mới xem được)
  accountInfo?: AccountInfo;
  
  qualifications: QualificationDTO[];
}

export interface CertificateInfo {
  certificateId: number;
  certificateName: string;
  level: string;
}

export interface LecturerResponse {
  lecturerId: number;
  fullName: string;
  dateOfBirth: string;
  imagePath: string;
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  totalClasses: number;
  activeClasses: number;
  certificates: CertificateInfo[];
}

export interface LecturerListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  lecturers: LecturerResponse[];
}
