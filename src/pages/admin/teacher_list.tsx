import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Avatar,
  Breadcrumbs,
  Link,
  CircularProgress,
  TablePagination,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  TableSortLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { LecturerResponse } from "../../model/teacher_model";
import { getAllLecturersPaginated, deleteLecturer } from "../../services/teacher_service";

const TeacherListPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<LecturerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("lecturerId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllLecturersPaginated(page, rowsPerPage, sortBy, sortDirection);
      setTeachers(result.lecturers);
      setTotal(result.totalItems);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách giảng viên:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, sortBy, sortDirection]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này?")) {
      try {
        await deleteLecturer(id);
        setSnackbarMsg("Xóa giảng viên thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        fetchTeachers();
      } catch (error: any) {
        console.error("Lỗi khi xóa giảng viên:", error);
        setSnackbarMsg(error.message || "Xóa giảng viên thất bại!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleSort = (property: string) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
    setPage(0);
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            href="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Quản lý Giảng viên
          </Typography>
        </Breadcrumbs>

        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Danh sách Giảng viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/teachers/add")}
            sx={{ 
              minWidth: { xs: "100%", sm: "auto" },
              height: 40,
            }}
          >
            Thêm Giảng viên
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Data Table */}
        <Card
          sx={{
            boxShadow: "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#667085" }}>
                    <TableSortLabel
                      active={sortBy === "fullName"}
                      direction={sortBy === "fullName" ? sortDirection : "asc"}
                      onClick={() => handleSort("fullName")}
                    >
                      Giảng viên
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#667085" }}>
                    Liên hệ
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#667085" }} align="center">
                    Lớp học
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#667085" }} align="center">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Chưa có giảng viên nào.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow 
                      key={teacher.lecturerId} 
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(99, 91, 255, 0.04)",
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            src={teacher.imagePath} 
                            alt={teacher.fullName}
                            sx={{ 
                              width: 48, 
                              height: 48,
                              bgcolor: "primary.main",
                            }}
                          >
                            {teacher.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {teacher.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {teacher.dateOfBirth}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {teacher.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {teacher.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Chip
                            label={`${teacher.activeClasses || 0} đang dạy`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ 
                              borderRadius: 1.5,
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={`${teacher.totalClasses || 0} tổng`}
                            size="small"
                            color="default"
                            variant="outlined"
                            sx={{ 
                              borderRadius: 1.5,
                              fontWeight: 500,
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/teachers/${teacher.lecturerId}`)}
                            sx={{
                              backgroundColor: "rgba(99, 91, 255, 0.08)",
                              "&:hover": { 
                                backgroundColor: "rgba(99, 91, 255, 0.16)",
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa giảng viên">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(teacher.lecturerId)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
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
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              ".MuiTablePagination-select": {
                borderRadius: 1,
              },
            }}
          />
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert 
            severity={snackbarSeverity} 
            onClose={() => setOpenSnackbar(false)}
            sx={{ borderRadius: 2 }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default TeacherListPage;
