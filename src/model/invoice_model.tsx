/**
 * Invoice Models
 */

export interface InvoiceResponse {
  invoiceId: number;
  dateCreated: string;
  status: boolean;
  studentName: string;
  studentId: string;
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
  totalAmount: number;
  
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
  promotionType: string;
  discountPercent: number;
  discountAmount: number;
}

// Response từ API phân trang
export interface InvoiceListResponse {
  content: InvoiceResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
