import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
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
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { CourseModel, DanhMuc } from "../model/course_model";
import { changeCourseStatus, getAllCourse } from "../services/course_service";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faLock, faLockOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditCourse from "./edit_course";

const Course: React.FC = () => {
  const mockDanhMucList: DanhMuc[] = [
    { madanhmuc: 1, tendm: "IELTS Foundation" },
    { madanhmuc: 2, tendm: "IELTS Advanced" },
  ];
  // State để quản lý các hàng được chọn, phân trang
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [courses, setCourses] = useState<CourseModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
  };

  const checkboxStyle = {
    "&.Mui-checked": {
      color: "#635bff",
    },
  };

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await getAllCourse(page, rowsPerPage);
      setCourses(res.data.data.courses);
      setTotalItems(res.data.data.totalItems);
    } catch (error) {
      console.error("Lỗi khi tải khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    setTimeout(() => {
      setDanhMucList(mockDanhMucList);
    }, 1000);
  }, [page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = courses.map((course) => course.courseId.toString());
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Hàm xử lý chọn/bỏ chọn một hàng
  const handleSelectOne = (customerId: string) => {
    const selectedIndex = selected.indexOf(customerId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, customerId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  //   const filteredCourses = useMemo(() => {
  //   return courses
  //     .filter((course) => {
  //       if (selectedDanhMuc === "all") return true;
  //       return course. === Number(selectedDanhMuc);
  //     })
  //     .filter((course) => {
  //       // Nếu có ô tìm kiếm
  //       const lowerSearch = searchTerm.toLowerCase();
  //       return (
  //         course.courseName.toLowerCase().includes(lowerSearch) ||
  //         course.description.toLowerCase().includes(lowerSearch)
  //       );
  //     });
  // }, [allCourses, selectedDanhMuc, searchTerm]);

  const handleCourseFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedDanhMuc(event.target.value);
    setPage(0);
  };

  // Hàm xử lý thay đổi trang
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Hàm xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await changeCourseStatus(id);
      console.log(res.data.data);
      setSuccessMsg("Đổi trạng thái thành công!");
      setOpenSnackbar(true)
      fetchCourse();
    } catch (err) {
      console.error("Lỗi khi đổi trạng thái:", err);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const formatStateOfCourse = (state: boolean) => {
    if (state === true) {
      return "Đang mở";
    } else {
      return "Đóng";
    }
  };

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, width: "90%", py: 6, margin: "auto" }}
    >
      <Container maxWidth={false}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Khóa học</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={4}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", textTransform: "uppercase" }}
          >
            Khóa học
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              navigate("/addCourse");
            }}
            sx={{ backgroundColor: "#635bff", borderRadius: 3 }}
          >
            Add
          </Button>
        </Stack>

        {/* Toolbar*/}
        <Card
          sx={{
            ...cardContainerStyle,
          }}
        >
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            <TextField
              placeholder="Tìm kiếm theo tên khóa học"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 500, borderRadius: "16px" }}
            />
            <FormControl sx={{ minWidth: 250 }} variant="outlined">
              <InputLabel>Lọc theo danh mục</InputLabel>
              <Select
                value={selectedDanhMuc}
                onChange={handleCourseFilterChange}
                label="Lọc theo danh mục"
              >
                <MenuItem value="all">
                  <em>Tất cả danh mục</em>
                </MenuItem>
                {danhMucList.map((dm) => (
                  <MenuItem key={dm.madanhmuc} value={dm.madanhmuc}>
                    {dm.tendm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        <Card sx={{ ...cardContainerStyle }}>
          {/* Table */}
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#eceff1ff" }}>
                  <TableCell padding="checkbox" sx={{ pl: 3 }}>
                    <Checkbox
                      sx={checkboxStyle}
                      indeterminate={
                        selected.length > 0 && selected.length < courses.length
                      }
                      checked={
                        courses.length > 0 && selected.length === courses.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={headerCellStyle}>Tên khóa học</TableCell>
                  <TableCell sx={headerCellStyle}>Học phí</TableCell>
                  <TableCell sx={headerCellStyle}>Ngày tạo</TableCell>
                  <TableCell sx={headerCellStyle}>Trạng thái</TableCell>
                  <TableCell sx={headerCellStyle}>Tools</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => {
                  const isSelected = selected.includes(
                    course.courseId.toString()
                  );
                  return (
                    <TableRow
                      hover
                      key={course.courseId.toString()}
                      selected={isSelected}
                      role="checkbox"
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "rgba(99, 91, 255, 0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(99, 91, 255, 0.12)",
                          },
                        },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 3 }}>
                        <Checkbox
                          onClick={() =>
                            handleSelectOne(course.courseId.toString())
                          }
                          checked={isSelected}
                          sx={checkboxStyle}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {course.courseName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN").format(
                          course.tuitionFee
                        )}
                      </TableCell>
                      <TableCell>
                        {dayjs(course.createdDate).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell>
                        {formatStateOfCourse(course.isActive)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            navigate(`/editCourse/${course.courseId}`);
                          }}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} color="green" />
                        </IconButton>
                        <IconButton>
                          <FontAwesomeIcon icon={faTrash} color="red" />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            handleToggleStatus(course.courseId);
                          }}
                        >
                          {course.isActive ? (
                            <FontAwesomeIcon icon={faLock} color="black" />
                          ) : (
                            <FontAwesomeIcon icon={faLockOpen} color="black" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalItems}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[7, 14, 21]}
          />
        </Card>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
            {successMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Course;
