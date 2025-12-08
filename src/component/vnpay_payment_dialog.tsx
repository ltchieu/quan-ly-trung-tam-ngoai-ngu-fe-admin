import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import { createVNPayPayment, VNPayPaymentRequest } from "../services/invoice_service";


interface VNPayPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: number;
  amount: number;
  expiryTime: string; // ISO string format
}

const VNPayPaymentDialog: React.FC<VNPayPaymentDialogProps> = ({
  open,
  onClose,
  invoiceId,
  amount,
  expiryTime,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  // Calculate time left
  useEffect(() => {
    if (!open) return;

    const calculateTimeLeft = () => {
      const expiry = new Date(expiryTime);
      const now = new Date();
      const seconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      
      if (seconds <= 0) {
        setExpired(true);
        setTimeLeft(0);
      } else {
        setExpired(false);
        setTimeLeft(seconds);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [open, expiryTime]);

  // Create payment URL when dialog opens
  useEffect(() => {
    if (open && !paymentUrl && !expired) {
      createPaymentUrl();
    }
  }, [open, expired]);

  const createPaymentUrl = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: VNPayPaymentRequest = {
        invoiceId,
        amount: amount.toString(),
        orderInfo: `Thanh toan hoa don ${invoiceId}`,
      };

      const response = await createVNPayPayment(request);
      setPaymentUrl(response.payUrl);
    } catch (err: any) {
      setError(err.message || "Không thể tạo URL thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  const handleClose = () => {
    setPaymentUrl(null);
    setError(null);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressValue = (timeLeft / (15 * 60)) * 100; // Assuming 15 minutes max

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <PaymentIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          Thanh toán VNPay
        </Typography>
      </DialogTitle>

      <DialogContent>
        {expired ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Hóa đơn đã hết hạn thanh toán (quá 15 phút). Vui lòng tạo hóa đơn mới.
          </Alert>
        ) : (
          <>
            {/* Countdown Timer */}
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                <AccessTimeIcon color="warning" />
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                color={timeLeft < 300 ? "error" : "warning"}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Thời gian còn lại để thanh toán
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Invoice Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mã hóa đơn: <strong>#{invoiceId}</strong>
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {amount.toLocaleString("vi-VN")} VND
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : paymentUrl ? (
              <>
                {/* QR Code */}
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quét mã QR để thanh toán nhanh
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      boxShadow: 3,
                      mt: 2,
                    }}
                  >
                    <QRCodeSVG value={paymentUrl} size={200} level="H" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                    Sử dụng ứng dụng ngân hàng của bạn để quét mã QR
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    HOẶC
                  </Typography>
                </Divider>

                {/* Instructions */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Hướng dẫn thanh toán:</strong>
                  </Typography>
                  <Typography variant="body2" component="div">
                    1. Quét mã QR hoặc nhấn nút "Thanh toán ngay"
                    <br />
                    2. Chọn phương thức thanh toán trên VNPay
                    <br />
                    3. Hoàn tất giao dịch theo hướng dẫn
                    <br />
                    4. Hệ thống sẽ tự động cập nhật trạng thái
                  </Typography>
                </Alert>
              </>
            ) : null}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Đóng
        </Button>
        {!expired && paymentUrl && (
          <Button
            variant="contained"
            onClick={handleProceedToPayment}
            disabled={loading || expired}
            size="large"
            fullWidth
          >
            Thanh toán ngay
          </Button>
        )}
        {expired && (
          <Button
            variant="contained"
            onClick={handleClose}
            size="large"
            fullWidth
          >
            Tạo hóa đơn mới
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VNPayPaymentDialog;
