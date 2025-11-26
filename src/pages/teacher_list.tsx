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
  TextField,
  InputAdornment,
  Avatar,
  Breadcrumbs,
  Link,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { GiangVien } from "../model/teacher_model";
import { getAllTeachers, deleteTeacher } from "../services/teacher_service";

const TeacherListPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<GiangVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllTeachers(page, rowsPerPage, searchTerm);
      setTeachers(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

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
        await deleteTeacher(id);
        fetchTeachers();
      } catch (error) {
        console.error("Failed to delete teacher", error);
      }
    }
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        <Typography color="text.primary">Quản lý Giảng viên</Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          Danh sách Giảng viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teachers/add")}
        >
          Thêm Giảng viên
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm giảng viên..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Giảng viên</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Liên hệ</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Trình độ</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy giảng viên nào.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.magv} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={teacher.anhdaidien} alt={teacher.hoten} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {teacher.hoten}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {teacher.gioitinh ? "Nam" : "Nữ"} - {teacher.ngaysinh}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{teacher.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.sdt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{teacher.trinhdo}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/teachers/${teacher.magv}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(teacher.magv)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default TeacherListPage;
