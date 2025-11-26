export interface LoaiKhuyenMai {
  ma: number;
  ten: string;
}

export interface ChiTietKhuyenMai {
  ma: number;
  maKhoaHoc: number;
  maKhuyenMai: number;
}

export interface KhuyenMai {
  maKhuyenMai: number;
  tenKhuyenMai: string;
  moTa?: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  phanTramGiam: number;
  trangThai: boolean;
  maLoaiKhuyenMai: number;
  
  // Optional: Joined data for frontend convenience
  chiTietKhuyenMai?: ChiTietKhuyenMai[];
}

export interface PromotionFilter {
  maLoaiKhuyenMai?: number | "ALL";
  trangThai?: boolean;
}
