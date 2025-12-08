import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HomeIcon from "@mui/icons-material/Home";
import { axiosClient } from "../../api/axios_client";
import { ApiResponse } from "../../model/api_respone";

interface PaymentResultData {
  success: boolean;
  message: string;
  invoiceId?: number;
  amount?: number;
  transactionId?: string;
  paymentTime?: string;
}

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Lấy tất cả query params từ VNPay callback
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      console.log("Payment callback params:", params);

      // Gọi API để verify payment
      const response = await axiosClient.get<ApiResponse<PaymentResultData>>(
        "/orders/payment/callback",
        { params }
      );

      if (response.data && response.data.code === 1000 && response.data.data) {
        setResult(response.data.data);
      } else {
        setError(response.data?.message || "Xác thực thanh toán thất bại");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.response?.data?.message || err.message || "Lỗi xác thực thanh toán");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6">Đang xác thực thanh toán...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vui lòng chờ trong giây lát
        </Typography>
      </Box>
    );
  }

  if (error || !result) {
    return (
      <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <ErrorIcon sx={{ fontSize: 100, color: "error.main", mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom color="error">
              Không thể xác thực thanh toán
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {error || "Đã xảy ra lỗi trong quá trình xác thực thanh toán"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                size="large"
              >
                Về trang chủ
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          {result.success ? (
            <>
              <CheckCircleIcon
                sx={{ fontSize: 100, color: "success.main", mb: 2 }}
              />
              <Typography variant="h4" fontWeight="bold" gutterBottom color="success.main">
                Thanh toán thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {result.message || "Cảm ơn bạn đã thanh toán. Hóa đơn của bạn đã được xác nhận."}
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                Hóa đơn đã được gửi đến email của học viên. Bạn có thể xem chi tiết trong danh sách hóa đơn.
              </Alert>

              <Divider sx={{ my: 3 }} />

              <List sx={{ textAlign: "left", maxWidth: 500, mx: "auto" }}>
                {result.invoiceId && (
                  <ListItem>
                    <ListItemText
                      primary="Mã hóa đơn"
                      secondary={
                        <Typography variant="h6" color="primary">
                          #{result.invoiceId}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                {result.transactionId && (
                  <ListItem>
                    <ListItemText
                      primary="Mã giao dịch VNPay"
                      secondary={result.transactionId}
                    />
                  </ListItem>
                )}
                {result.amount && (
                  <ListItem>
                    <ListItemText
                      primary="Số tiền thanh toán"
                      secondary={
                        <Typography variant="h6" color="success.main">
                          {result.amount.toLocaleString("vi-VN")} VND
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                {result.paymentTime && (
                  <ListItem>
                    <ListItemText
                      primary="Thời gian thanh toán"
                      secondary={new Date(result.paymentTime).toLocaleString("vi-VN")}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemText
                    primary="Trạng thái"
                    secondary={
                      <Typography color="success.main" fontWeight="bold">
                        ✓ Đã thanh toán
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                Hóa đơn điện tử đã được gửi đến email của bạn. Vui lòng kiểm tra
                hộp thư để xem chi tiết.
              </Alert>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  onClick={() => navigate(`/admin/invoices`)}
                  size="large"
                >
                  Xem hóa đơn
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate("/admin")}
                  size="large"
                >
                  Về trang chủ
                </Button>
              </Box>
            </>
          ) : (
            <>
              <ErrorIcon sx={{ fontSize: 100, color: "error.main", mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom color="error">
                Thanh toán thất bại
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {result.message || "Có lỗi xảy ra trong quá trình thanh toán"}
              </Typography>

              <Alert severity="error" sx={{ mb: 3 }}>
                Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ nếu bạn đã bị trừ tiền.
              </Alert>

              <Divider sx={{ my: 3 }} />

              <List sx={{ textAlign: "left", maxWidth: 500, mx: "auto" }}>
                {result.invoiceId && (
                  <ListItem>
                    <ListItemText
                      primary="Mã hóa đơn"
                      secondary={`#${result.invoiceId}`}
                    />
                  </ListItem>
                )}
                {result.transactionId && (
                  <ListItem>
                    <ListItemText
                      primary="Mã giao dịch"
                      secondary={result.transactionId}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemText
                    primary="Trạng thái"
                    secondary={
                      <Typography color="error.main" fontWeight="bold">
                        ✗ Chưa thanh toán
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate("/")}
                  size="large"
                >
                  Về trang chủ
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  onClick={() => navigate("/invoices")}
                  size="large"
                >
                  Xem danh sách hóa đơn
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentResult;
