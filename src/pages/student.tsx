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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Avatar,
  Breadcrumbs,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { StudentModel } from "../model/student_model";
import { getAllStudents } from "../services/student_service";
import { useNavigate } from "react-router-dom";

const Student: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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
      // In a real app, pass filters to the API
      const res = await getAllStudents(page, rowsPerPage);
      let data = res.data.data.students;

      // Client-side filtering for mock data
      if (genderFilter !== "all") {
        const isMale = genderFilter === "male";
        data = data.filter((s) => s.gioitinh === isMale);
      }

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        data = data.filter(
          (s) =>
            s.hoten.toLowerCase().includes(lowerTerm) ||
            s.email.toLowerCase().includes(lowerTerm) ||
            s.sdt.includes(lowerTerm)
        );
      }

      setStudents(data);
      setTotalItems(res.data.data.totalItems);
    } catch (error) {
      console.error("Lỗi khi tải danh sách học viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, genderFilter, searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGenderFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  if (loading) {
    return <div>Loading...</div>;
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
        </Stack>

        {/* Filters */}
        <Card sx={{ ...cardContainerStyle, p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Giới tính</InputLabel>
              <Select
                value={genderFilter}
                label="Giới tính"
                onChange={handleGenderChange}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {/* Table */}
        <Card sx={{ ...cardContainerStyle, overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Học viên</TableCell>
                  <TableCell sx={headerCellStyle}>Giới tính</TableCell>
                  <TableCell sx={headerCellStyle}>Liên hệ</TableCell>
                  <TableCell sx={headerCellStyle}>Trình độ</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow
                      key={student.mahocvien}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={student.hinhanh} alt={student.hoten} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {student.hoten}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={student.gioitinh ? "Nam" : "Nữ"} 
                          size="small"
                          color={student.gioitinh ? "primary" : "secondary"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{student.sdt}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.trinhdo}
                          color="info"
                          size="small"
                          sx={{ borderRadius: "6px" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/student/${student.mahocvien}`)}
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
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không tìm thấy học viên nào.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </Card>
      </Container>
    </Box>
  );
};

export default Student;
