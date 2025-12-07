export interface LoaiKhuyenMai {
  ma: number;
  ten: string;
}

export interface CourseSimpleResponse {
  courseId: number;
  courseName: string;
}

export interface PromotionResponse {
  id: number;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  active: boolean;
  promotionTypeId: number;
  promotionTypeName: string;
  courses: CourseSimpleResponse[];
}

export interface PromotionRequest {
  name: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  promotionTypeId: number;
  courseIds?: number[];
}

export interface PromotionFilter {
  maLoaiKhuyenMai?: number | "ALL";
  trangThai?: boolean;
}

// Legacy interface for backward compatibility (will be removed)
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
  chiTietKhuyenMai?: ChiTietKhuyenMai[];
}
