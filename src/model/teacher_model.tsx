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

export interface TeacherInfo {
  lecturerId: number;
  fullName: string;
  dateOfBirth: string;
  imagePath: string;
  phoneNumber: string;
  email: string;
  qualifications: QualificationDTO[];
}
