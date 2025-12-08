/**
 * Models for Enrollment/Order functionality
 * Used for admin adding students to classes
 */

export interface CourseRegistrationRequest {
  studentId: number;
  classIds: number[];
  paymentMethodId: number;
}

export interface InvoiceResponse {
  invoiceId: number;
  dateCreated: string; // ISO 8601 format
  status: boolean; // false: chưa thanh toán, true: đã thanh toán
  studentName: string;
  studentId: string; // Mã học viên
  paymentMethod: string;
  totalOriginalPrice: number;
  courseDiscountPercent: number;
  courseDiscountAmount: number;
  comboDiscountPercent: number;
  comboDiscountAmount: number;
  returningDiscountPercent: number;
  returningDiscountAmount: number;
  totalDiscountPercent: number;
  totalDiscountAmount: number;
  totalAmount: number; // Tổng số tiền phải thanh toán (sau giảm giá)
  details: InvoiceDetailResponse[];
}

export interface InvoiceDetailResponse {
  detailId: number;
  courseName: string;
  className: string;
  originalPrice: number;
  finalAmount: number;
  promotionsApplied: PromotionAppliedResponse[];
}

export interface PromotionAppliedResponse {
  promotionId: number;
  promotionName: string;
  promotionType: string; // "Khóa học đơn", "Combo", "Học viên cũ"
  discountPercent: number;
  discountAmount: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
}

// For displaying student search results
export interface StudentSearchResult {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
}
