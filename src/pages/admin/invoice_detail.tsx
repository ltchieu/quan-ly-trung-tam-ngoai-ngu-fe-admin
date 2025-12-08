import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Container,
  Grid,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faReceipt,
  faUser,
  faCalendar,
  faCreditCard,
  faCheckCircle,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { getInvoiceById } from "../../services/invoice_service";
import { InvoiceResponse } from "../../model/invoice_model";

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getInvoiceById(parseInt(id));
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetail();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || "Không tìm thấy hóa đơn"}</Alert>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate("/admin/invoices")}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate("/admin/invoices")}>
          Quản lý hóa đơn
        </Link>
        <Typography color="text.primary">Chi tiết hóa đơn #{invoice.invoiceId}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h3" fontWeight="bold">
          Chi tiết hóa đơn #{invoice.invoiceId}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate("/admin/invoices")}
        >
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin chung */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Thông tin chung
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "left" }}>
                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <FontAwesomeIcon icon={faUser} />
                    Học viên
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {invoice.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã học viên: {invoice.studentId}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "left" }}>
                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <FontAwesomeIcon icon={faCalendar} />
                    Ngày tạo
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatDateTime(invoice.dateCreated)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <FontAwesomeIcon icon={faCreditCard} />
                    Phương thức thanh toán
                  </Typography>
                  <Chip
                    label={invoice.paymentMethod}
                    color={invoice.paymentMethod === "Tiền mặt" ? "success" : "info"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    {invoice.status ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faHourglassHalf} />}
                    Trạng thái
                  </Typography>
                  <Chip
                    label={invoice.status ? "Đã thanh toán" : "Chưa thanh toán"}
                    color={invoice.status ? "success" : "warning"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Chi tiết các lớp học */}
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Chi tiết các lớp học
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold", backgroundColor: "#f9fafb" } }}>
                    <TableCell>Khóa học</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell align="right">Giá gốc</TableCell>
                    <TableCell align="right">Giảm giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.details.map((detail) => (
                    <React.Fragment key={detail.detailId}>
                      <TableRow hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {detail.courseName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{detail.className}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(detail.originalPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="error">
                            -{formatCurrency(detail.originalPrice - detail.finalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(detail.finalAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {detail.promotionsApplied && detail.promotionsApplied.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 1, backgroundColor: "#f9fafb" }}>
                            <Box sx={{ pl: 2 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Khuyến mãi áp dụng:
                              </Typography>
                              {detail.promotionsApplied.map((promo) => (
                                <Box key={promo.promotionId} sx={{ ml: 2, mt: 0.5 }}>
                                  <Typography variant="caption" color="success.main">
                                    {promo.promotionName} ({promo.promotionType}): -{promo.discountPercent}% = 
                                    {formatCurrency(promo.discountAmount)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Tổng hợp thanh toán */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, position: "sticky", top: 80 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Tổng hợp thanh toán
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tổng giá gốc
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(invoice.totalOriginalPrice || 0)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {invoice.courseDiscountAmount && invoice.courseDiscountAmount > 0 && (
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Giảm khóa học đơn ({invoice.courseDiscountPercent || 0}%)
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatCurrency(invoice.courseDiscountAmount)}
                  </Typography>
                </Box>
              )}

              {invoice.comboDiscountAmount && invoice.comboDiscountAmount > 0 && (
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Giảm combo ({invoice.comboDiscountPercent || 0}%)
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatCurrency(invoice.comboDiscountAmount)}
                  </Typography>
                </Box>
              )}

              {invoice.returningDiscountAmount && invoice.returningDiscountAmount > 0 && (
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Giảm học viên cũ ({invoice.returningDiscountPercent || 0}%)
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatCurrency(invoice.returningDiscountAmount)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  Tổng giảm giá ({invoice.totalDiscountPercent || 0}%)
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="error">
                  -{formatCurrency(invoice.totalDiscountAmount || 0)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">
                  Tổng thanh toán
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
            </Box>

            {!invoice.status && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Hóa đơn chưa được thanh toán. Vui lòng nhắc nhở học viên thanh toán trong vòng 15 phút.
              </Alert>
            )}

            {invoice.status && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Hóa đơn đã được thanh toán thành công!
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvoiceDetailPage;
