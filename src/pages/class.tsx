import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  SelectChangeEvent,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface KhoaHoc {
  makhoahoc: number;
  tenkhoahoc: string;
}

interface LopHocView {
  malop: number;
  tenPhong: string;
  lichHoc: string;
  tenGiangVien: string;
  trangThai: string;
  makhoahoc: number;
}

const mockKhoaHocList: KhoaHoc[] = [
  { makhoahoc: 1, tenkhoahoc: "Khóa IELTS 7.0+" },
  { makhoahoc: 2, tenkhoahoc: "Khóa Giao tiếp Cơ bản" },
  { makhoahoc: 3, tenkhoahoc: "Khóa Luyện thi TOEIC" },
];

const mockLopHocList: LopHocView[] = [
  {
    malop: 101,
    tenPhong: "P.A101",
    lichHoc: "T2-T4-T6 (18:00 - 20:00)",
    tenGiangVien: "Nguyễn Văn A",
    trangThai: "Đang mở",
    makhoahoc: 1,
  },
  {
    malop: 102,
    tenPhong: "P.B203",
    lichHoc: "T3-T5-T7 (19:00 - 21:00)",
    tenGiangVien: "Trần Thị B",
    trangThai: "Sắp mở",
    makhoahoc: 1,
  },
  {
    malop: 103,
    tenPhong: "P.A102",
    lichHoc: "T2-T4 (08:00 - 10:00)",
    tenGiangVien: "Lê Văn C",
    trangThai: "Đã kết thúc",
    makhoahoc: 2,
  },
  {
    malop: 104,
    tenPhong: "P.C301",
    lichHoc: "CN (09:00 - 12:00)",
    tenGiangVien: "Phạm Thị D",
    trangThai: "Đang mở",
    makhoahoc: 3,
  },
];

const ClassListPage: React.FC = () => {
  const [allLopHoc, setAllLopHoc] = useState<LopHocView[]>([]);
  const [khoaHocList, setKhoaHocList] = useState<KhoaHoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    // === BẠN SẼ GỌI API THẬT Ở ĐÂY ===
    // Ví dụ:
    // const fetchAllData = async () => {
    //     try {
    //         const [lopRes, khoaHocRes] = await Promise.all([
    //             api.getLopHocView(),
    //             api.getKhoaHocList()
    //         ]);
    //         setAllLopHoc(lopRes.data);
    //         setKhoaHocList(khoaHocRes.data);
    //     } catch (err) {
    //         // Xử lý lỗi
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    // fetchAllData();

    // Giả lập API call
    setTimeout(() => {
      setAllLopHoc(mockLopHocList);
      setKhoaHocList(mockKhoaHocList);
      setLoading(false);
    }, 1000); // Giả lập 1 giây loading
  }, []);

  const filteredLopHoc = useMemo(() => {
    return allLopHoc
      .filter((lop) => {
        if (selectedCourse === "all") return true;
        return lop.makhoahoc === Number(selectedCourse);
      })
      .filter((lop) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          lop.tenGiangVien.toLowerCase().includes(lowerSearch) ||
          lop.tenPhong.toLowerCase().includes(lowerSearch) ||
          lop.lichHoc.toLowerCase().includes(lowerSearch)
        );
      });
  }, [allLopHoc, searchTerm, selectedCourse]);

  // --- Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCourseFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedCourse(event.target.value);
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

  // Hàm lấy màu cho Chip trạng thái (Tùy chọn)
  const getStatusChipColor = (
    status: string
  ): "success" | "warning" | "default" => {
    if (status === "Đang mở") return "success";
    if (status === "Sắp mở") return "warning";
    return "default";
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Danh sách Lớp học
        </Typography>

        {/* Toolbar: Tìm kiếm và Lọc */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm Giảng viên, Lịch, Phòng..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: "100%", maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 250 }} variant="outlined">
            <InputLabel>Lọc theo khóa học</InputLabel>
            <Select
              value={selectedCourse}
              onChange={handleCourseFilterChange}
              label="Lọc theo khóa học"
            >
              <MenuItem value="all">
                <em>Tất cả khóa học</em>
              </MenuItem>
              {khoaHocList.map((khoaHoc) => (
                <MenuItem key={khoaHoc.makhoahoc} value={khoaHoc.makhoahoc}>
                  {khoaHoc.tenkhoahoc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Bảng dữ liệu */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": { fontWeight: "bold", backgroundColor: "#f9fafb" },
                }}
              >
                <TableCell>Phòng học</TableCell>
                <TableCell>Lịch học</TableCell>
                <TableCell>Giảng viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress sx={{ my: 4 }} />
                  </TableCell>
                </TableRow>
              ) : filteredLopHoc.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Không tìm thấy lớp học nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLopHoc
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((lop) => (
                    <TableRow hover key={lop.malop}>
                      <TableCell>{lop.tenPhong}</TableCell>
                      <TableCell>{lop.lichHoc}</TableCell>
                      <TableCell>{lop.tenGiangVien}</TableCell>
                      <TableCell>
                        <Chip
                          label={lop.trangThai}
                          color={getStatusChipColor(lop.trangThai)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          // onClick={() => handleEdit(lop.malop)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          // onClick={() => handleDelete(lop.malop)}
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

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLopHoc.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ClassListPage;
