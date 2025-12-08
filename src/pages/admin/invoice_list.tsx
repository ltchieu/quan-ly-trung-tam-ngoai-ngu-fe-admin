import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Typography,
  CircularProgress,
  Chip,
  Container,
  Tooltip,
  Grid,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faEye,
  faReceipt,
  faCheckCircle,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { getAllInvoices } from "../../services/invoice_service";
import { InvoiceResponse } from "../../model/invoice_model";
import useDebounce from "../../hook/useDebounce";

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();

  // State cho dữ liệu
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number>(0); // 0: Tất cả, 1: Đã thanh toán, 2: Chưa thanh toán
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // State cho thống kê
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    totalRevenue: 0,
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      let status: boolean | null = null;
      if (statusFilter === 1) status = true;
      if (statusFilter === 2) status = false;

      const response = await getAllInvoices(
        page,
        rowsPerPage,
        status,
        debouncedSearchTerm || null
      );

      setInvoices(response.content);
      setTotalRows(response.totalElements);

      // Tính toán thống kê (chỉ khi không lọc)
      if (statusFilter === 0 && !debouncedSearchTerm) {
        const paid = response.content.filter((inv: InvoiceResponse) => inv.status).length;
        const unpaid = response.content.filter((inv: InvoiceResponse) => !inv.status).length;
        const revenue = response.content
          .filter((inv: InvoiceResponse) => inv.status)
          .reduce((sum: number, inv: InvoiceResponse) => sum + inv.totalAmount, 0);

        setStats({
          total: response.totalElements,
          paid: paid,
          unpaid: unpaid,
          totalRevenue: revenue,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setStatusFilter(newValue);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        <Typography color="text.primary">Quản lý hóa đơn</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Grid container sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            <FontAwesomeIcon icon={faReceipt} style={{ marginRight: 16 }} />
            Quản lý hóa đơn
          </Typography>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="h6">
                Tổng hóa đơn
              </Typography>
              <Typography variant="h4" color="white" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="h6">
                Đã thanh toán
              </Typography>
              <Typography variant="h4" color="white" fontWeight="bold">
                {stats.paid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="h6">
                Chưa thanh toán
              </Typography>
              <Typography variant="h4" color="white" fontWeight="bold">
                {stats.unpaid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="h6">
                Tổng doanh thu
              </Typography>
              <Typography variant="h5" color="white" fontWeight="bold">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, borderRadius: 4 }}>
        {/* Toolbar: Tìm kiếm và Tabs */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Tìm kiếm theo mã HĐ, tên học viên..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Tabs */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Tabs
                value={statusFilter}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab
                  icon={<FontAwesomeIcon icon={faReceipt} />}
                  iconPosition="start"
                  label="Tất cả"
                  value={0}
                />
                <Tab
                  icon={<FontAwesomeIcon icon={faCheckCircle} />}
                  iconPosition="start"
                  label="Đã thanh toán"
                  value={1}
                />
                <Tab
                  icon={<FontAwesomeIcon icon={faHourglassHalf} />}
                  iconPosition="start"
                  label="Chưa thanh toán"
                  value={2}
                />
              </Tabs>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": { fontWeight: "bold", backgroundColor: "#f9fafb" },
                }}
              >
                <TableCell>Mã HĐ</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Học viên</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell align="right">Giá gốc</TableCell>
                <TableCell align="right">Giảm giá</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress sx={{ my: 4 }} />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography>Không tìm thấy hóa đơn nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow hover key={invoice.invoiceId}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        #{invoice.invoiceId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(invoice.dateCreated)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {invoice.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mã: {invoice.studentId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.paymentMethod}
                        size="small"
                        variant="outlined"
                        color={invoice.paymentMethod === "Tiền mặt" ? "success" : "info"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(invoice.totalOriginalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error">
                        -{formatCurrency(invoice.totalDiscountAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({invoice.totalDiscountPercent}%)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={invoice.status ? "Đã thanh toán" : "Chưa thanh toán"}
                        color={invoice.status ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/admin/invoices/${invoice.invoiceId}`)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 30, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>
    </Container>
  );
};

export default InvoiceListPage;
