/**
 * Invoice Models
 */

// Model for list view (simplified)
export interface InvoiceListItem {
  invoiceId: number;
  dateCreated: string;
  status: boolean;
  studentName: string;
  studentId: string;
  paymentMethod: string;
  totalAmount: number;
  totalDiscountPercent: number | null;
}

// Model for detail view (full)
export interface InvoiceResponse {
  invoiceId: number;
  dateCreated: string;
  status: boolean;
  studentName: string;
  studentId: string;
  paymentMethod: string;
  
  totalOriginalPrice: number | null;
  
  courseDiscountPercent: number | null;
  courseDiscountAmount: number | null;
  
  comboDiscountPercent: number | null;
  comboDiscountAmount: number | null;
  
  returningDiscountPercent: number | null;
  returningDiscountAmount: number | null;
  
  totalDiscountPercent: number | null;
  totalDiscountAmount: number | null;
  totalAmount: number;
  
  details: InvoiceDetailResponse[];
}

export interface InvoiceDetailResponse {
  detailId: number;
  courseName: string;
  className: string;
  originalPrice: number;
  finalAmount: number;
  promotionsApplied: PromotionAppliedResponse[] | null;
}

export interface PromotionAppliedResponse {
  promotionId: number;
  promotionName: string;
  promotionType: string;
  discountPercent: number;
  discountAmount: number;
}

// Response từ API phân trang (InvoicePageResponse)
export interface InvoicePageResponse {
  invoices: InvoiceListItem[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
