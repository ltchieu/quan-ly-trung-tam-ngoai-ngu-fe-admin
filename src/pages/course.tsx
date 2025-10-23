import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { CourseModel } from "../model/course_model";
import { changeCourseStatus, getAllCourse } from "../services/course_service";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faLock, faLockOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditCourse from "./edit_course";

const Course: React.FC = () => {
  // State để quản lý các hàng được chọn, phân trang
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [courses, setCourses] = useState<CourseModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
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
    // Style khi checkbox được chọn
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
      alert("Đổi trạng thái thành công!");
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
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-start" }}>
            <TextField
              placeholder="Search customer"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 500, borderRadius: "16px" }}
            />
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
                        <IconButton onClick={() => {handleToggleStatus(course.courseId)}}>
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
      </Container>
    </Box>
  );
};

export default Course;
