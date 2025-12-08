import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { InvoiceResponse, InvoicePageResponse } from "../model/invoice_model";

/**
 * Lấy danh sách hóa đơn với phân trang, lọc và tìm kiếm
 */
export const getAllInvoices = async (
  page: number,
  size: number,
  status?: boolean | null,
  keyword?: string | null,
  fromDate?: string | null,
  toDate?: string | null
) => {
  try {
    const params: any = { page, size };
    
    if (status !== null && status !== undefined) {
      params.status = status;
    }
    
    if (keyword && keyword.trim()) {
      params.keyword = keyword.trim();
    }
    
    if (fromDate) {
      params.fromDate = fromDate;
    }
    
    if (toDate) {
      params.toDate = toDate;
    }
    console.log("Fetching invoices with params:", params);
    const response = await axiosClient.get<ApiResponse<InvoicePageResponse>>(
      "/orders",
      { params }
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy danh sách hóa đơn thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy danh sách hóa đơn API error:", message);
    throw new Error(message);
  }
};

/**
 * Lấy chi tiết hóa đơn theo ID
 */
export const getInvoiceById = async (id: number) => {
  try {
    const response = await axiosClient.get<ApiResponse<InvoiceResponse>>(
      `/orders/${id}`
    );
    console.log("Invoice detail response data:", response.data);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy chi tiết hóa đơn thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy chi tiết hóa đơn API error:", message);
    throw new Error(message);
  }
};

/**
 * Tạo URL thanh toán VNPay
 * POST /orders/payment/create
 */
export interface VNPayPaymentRequest {
  invoiceId: number;
  amount: string;
  orderInfo: string;
}

export interface VNPayPaymentResponse {
  txnRef: string;
  amount: number;
  payUrl: string;
}

export const createVNPayPayment = async (request: VNPayPaymentRequest) => {
  try {
    const response = await axiosClient.post<ApiResponse<VNPayPaymentResponse>>(
      "/orders/payment/create",
      request
    );
    
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Tạo thanh toán VNPay thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Tạo thanh toán VNPay API error:", message);
    throw new Error(message);
  }
};
