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
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faEye,
  faReceipt,
  faCheckCircle,
  faHourglassHalf,
  faFilter,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { getAllInvoices } from "../../services/invoice_service";
import { InvoiceListItem } from "../../model/invoice_model";
import useDebounce from "../../hook/useDebounce";

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();

  // State cho dữ liệu
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

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
        debouncedSearchTerm || null,
        fromDate || null,
        toDate || null
      );

      setInvoices(response.invoices);
      setTotalRows(response.totalItems);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, debouncedSearchTerm, fromDate, toDate]);

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

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(0);
    setFromDate("");
    setToDate("");
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
      <Typography variant="h3" fontWeight="bold" textAlign="left" sx={{ mb: 3 }}>
        Quản lý hóa đơn
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        {/* Toolbar: Tìm kiếm và Bộ lọc */}
        <Box sx={{ mb: 3 }}>
          {/* Search and Status Tabs */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            {/* Search Bar */}
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Tìm kiếm theo SDT, tên học viên..."
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
            <Grid size={{ xs: 12, md: 7 }}>
              <Tabs
                value={statusFilter}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
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

          {/* Date Filters */}
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: '#f9fafb', 
              borderRadius: 2,
              border: '1px solid #e5e7eb'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FontAwesomeIcon icon={faFilter} style={{ color: '#6b7280' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Lọc theo ngày:
                </Typography>
              </Box>
              
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  minWidth: 180,
                  backgroundColor: 'white',
                  borderRadius: 1
                }}
              />
              
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  minWidth: 180,
                  backgroundColor: 'white',
                  borderRadius: 1
                }}
              />
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<FontAwesomeIcon icon={faRotateRight} />}
                onClick={handleResetFilters}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </Stack>
          </Box>
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
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell align="center">Giảm giá</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress sx={{ my: 4 }} />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {invoice.totalDiscountPercent && invoice.totalDiscountPercent > 0 ? (
                        <Chip
                          label={`-${invoice.totalDiscountPercent}%`}
                          size="small"
                          color="error"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Không
                        </Typography>
                      )}
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
