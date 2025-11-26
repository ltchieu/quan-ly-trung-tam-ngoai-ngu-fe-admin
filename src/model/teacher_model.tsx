export interface GiangVien {
  magv: number;
  hoten: string;
  ngaysinh: string;
  gioitinh: boolean; // true: Nam, false: Nữ
  sdt: string;
  email: string;
  diachi: string;
  anhdaidien: string;
  trinhdo: string;
  mota?: string;
}

export interface TeacherFilter {
  keyword?: string;
}
