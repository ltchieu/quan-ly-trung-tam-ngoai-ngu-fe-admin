import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { StudentAdminResponse } from "../../model/student_model";
import { getAllStudents } from "../../services/student_service";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hook/useDebounce";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";

const Student: React.FC = () => {
  useAxiosPrivate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [students, setStudents] = useState<StudentAdminResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  const cardContainerStyle = {
    boxShadow:
      "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
    borderRadius: "16px",
    mb: 3,
  };

  const headerCellStyle = {
    color: "#667085",
    fontWeight: "bold",
    backgroundColor: "#f9fafb",
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await getAllStudents(
        page,
        rowsPerPage,
        debouncedSearchTerm
      );

      if (response.code === 1000 && response.data) {
        setStudents(response.data.content);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách học viên:", error);
      setErrorMsg(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, debouncedSearchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  if (loading && students.length === 0) {
    return <Box sx={{ p: 3 }}>Đang tải...</Box>;
  }

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, width: "100%", py: 4, px: 2, backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Học viên</Typography>
        </Breadcrumbs>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
              Quản lý học viên
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Danh sách và thông tin chi tiết học viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/students/add")}
            sx={{
              backgroundColor: "#635bff",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0px 4px 12px rgba(99, 91, 255, 0.2)",
              "&:hover": {
                backgroundColor: "#5348e8",
              }
            }}
          >
            Thêm học viên
          </Button>
        </Stack>

        {/* Filters */}
        <Card sx={{ ...cardContainerStyle, p: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              }
            }}
          />
        </Card>

        {/* Table */}
        <Card sx={{ ...cardContainerStyle, overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Học viên</TableCell>
                  <TableCell sx={headerCellStyle}>Liên hệ</TableCell>
                  <TableCell sx={headerCellStyle}>Địa chỉ</TableCell>
                  <TableCell sx={headerCellStyle}>Trình độ</TableCell>
                  <TableCell sx={headerCellStyle}>Số lớp</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow
                      key={student.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            src={student.avatarUrl || undefined} 
                            alt={student.fullName}
                          >
                            {student.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {student.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{student.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {student.address || "Chưa cập nhật"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {student.educationLevel ? (
                          <Chip
                            label={student.educationLevel}
                            color="info"
                            size="small"
                            sx={{ borderRadius: "6px" }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa cập nhật
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.totalClassesEnrolled}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/students/${student.id}`)}
                          sx={{
                            backgroundColor: "rgba(99, 91, 255, 0.08)",
                            "&:hover": { backgroundColor: "rgba(99, 91, 255, 0.16)" }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm ? "Không tìm thấy học viên phù hợp." : "Không có học viên nào."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        </Card>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Student;
