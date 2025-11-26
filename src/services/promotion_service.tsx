import { KhuyenMai, LoaiKhuyenMai } from "../model/promotion_model";

// Mock Data for Promotion Types
const MOCK_TYPES: LoaiKhuyenMai[] = [
  { ma: 1, ten: "Combo Khóa học" },
  { ma: 2, ten: "Tri ân học viên cũ" },
  { ma: 3, ten: "Giảm giá khóa học" },
];

// Mock Data for Promotions
let MOCK_PROMOTIONS: KhuyenMai[] = [
  {
    maKhuyenMai: 1,
    tenKhuyenMai: "Combo Tiếng Anh Giao Tiếp + IELTS",
    maLoaiKhuyenMai: 1,
    moTa: "Giảm giá khi đăng ký combo 2 khóa học",
    ngayBatDau: "2023-11-01",
    ngayKetThuc: "2023-12-31",
    trangThai: true,
    phanTramGiam: 15,
    chiTietKhuyenMai: [
      { ma: 1, maKhoaHoc: 1, maKhuyenMai: 1 },
      { ma: 2, maKhoaHoc: 2, maKhuyenMai: 1 },
    ],
  },
  {
    maKhuyenMai: 2,
    tenKhuyenMai: "Tri ân học viên cũ",
    maLoaiKhuyenMai: 2,
    moTa: "Giảm giá cho học viên đã từng học tại trung tâm",
    ngayBatDau: "2023-01-01",
    ngayKetThuc: "2023-12-31",
    trangThai: true,
    phanTramGiam: 10,
  },
  {
    maKhuyenMai: 3,
    tenKhuyenMai: "Giảm giá khóa TOEIC 500+",
    maLoaiKhuyenMai: 3,
    moTa: "Ưu đãi đặc biệt tháng 11",
    ngayBatDau: "2023-11-15",
    ngayKetThuc: "2023-11-30",
    trangThai: false,
    phanTramGiam: 20,
    chiTietKhuyenMai: [{ ma: 3, maKhoaHoc: 3, maKhuyenMai: 3 }],
  },
];

export const getAllPromotionTypes = async (): Promise<LoaiKhuyenMai[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...MOCK_TYPES];
};

export const getAllPromotions = async (): Promise<KhuyenMai[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...MOCK_PROMOTIONS];
};

export const getPromotionById = async (id: number): Promise<KhuyenMai | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_PROMOTIONS.find((p) => p.maKhuyenMai === id);
};

export const createPromotion = async (promotion: Omit<KhuyenMai, "maKhuyenMai">): Promise<KhuyenMai> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newId = Math.max(...MOCK_PROMOTIONS.map((p) => p.maKhuyenMai), 0) + 1;
  const newPromotion = { ...promotion, maKhuyenMai: newId };
  MOCK_PROMOTIONS.push(newPromotion);
  return newPromotion;
};

export const updatePromotion = async (id: number, promotion: Partial<KhuyenMai>): Promise<KhuyenMai> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = MOCK_PROMOTIONS.findIndex((p) => p.maKhuyenMai === id);
  if (index === -1) throw new Error("Promotion not found");
  
  MOCK_PROMOTIONS[index] = { ...MOCK_PROMOTIONS[index], ...promotion };
  return MOCK_PROMOTIONS[index];
};

export const deletePromotion = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  MOCK_PROMOTIONS = MOCK_PROMOTIONS.filter((p) => p.maKhuyenMai !== id);
};
