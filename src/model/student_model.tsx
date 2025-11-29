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

export interface StudentCreationRequest {
  hoten: string;
  gioitinh: boolean;
  ngaysinh: string;
  sdt: string;
  email: string;
  diachi: string;
}
