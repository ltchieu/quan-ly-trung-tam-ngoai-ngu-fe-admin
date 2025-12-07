import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Stack,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { createPromotion } from "../../services/promotion_service";
import { PromotionRequest } from "../../model/promotion_model";
import { getCourseFilterList } from "../../services/class_service";
import { CourseFilterData } from "../../model/class_model";

// Hardcoded promotion types matching backend
const PROMOTION_TYPES = [
  { id: 1, name: "Khuyến mãi học lẻ" },
  { id: 2, name: "Khuyến mãi combo" },
  { id: 3, name: "Khuyến mãi học viên cũ" },
];

const AddPromotionPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseFilterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const courseData = await getCourseFilterList();
        setCourses(courseData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      promotionTypeId: "" as unknown as number,
      description: "",
      startDate: dayjs(),
      endDate: dayjs().add(1, "month"),
      discountPercent: 0,
      courseIds: [] as number[],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Vui lòng nhập tên chương trình"),
      promotionTypeId: Yup.number().required("Vui lòng chọn loại khuyến mãi"),
      startDate: Yup.date()
        .required("Vui lòng chọn ngày bắt đầu")
        .min(dayjs().startOf('day').toDate(), "Ngày bắt đầu phải từ hôm nay trở đi"),
      endDate: Yup.date()
        .required("Vui lòng chọn ngày kết thúc")
        .min(Yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
      discountPercent: Yup.number()
        .min(0, "Không được nhỏ hơn 0")
        .max(100, "Không được lớn hơn 100")
        .required("Vui lòng nhập mức giảm giá"),
      courseIds: Yup.array().when("promotionTypeId", {
        is: 1, // Course Discount - single or multiple courses
        then: (schema) => schema.min(1, "Vui lòng chọn ít nhất 1 khóa học"),
      }).when("promotionTypeId", {
        is: 2, // Combo - requires at least 2 courses
        then: (schema) => schema.min(2, "Vui lòng chọn ít nhất 2 khóa học"),
      }),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let courseIds: number[] | undefined = undefined;

        if (values.promotionTypeId === 1 || values.promotionTypeId === 2) {
          // Type 1 (Course Discount) and Type 2 (Combo) use courseIds
          courseIds = values.courseIds;
        }
        // For promotionTypeId === 3 (Student Loyalty), courseIds remains undefined

        const request: PromotionRequest = {
          name: values.name,
          promotionTypeId: Number(values.promotionTypeId),
          description: values.description || undefined,
          startDate: values.startDate.format("YYYY-MM-DD"),
          endDate: values.endDate.format("YYYY-MM-DD"),
          discountPercent: Number(values.discountPercent),
          courseIds: courseIds,
        };

        await createPromotion(request);
        setSnackbar({
          open: true,
          message: "Tạo khuyến mãi thành công!",
          severity: "success",
        });
        setTimeout(() => navigate("/promotions"), 2000);
      } catch (error: any) {
        console.error("Failed to create promotion", error);
        setSnackbar({
          open: true,
          message: error.message || "Có lỗi xảy ra khi tạo khuyến mãi.",
          severity: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/promotions">
            Quản lý Khuyến mãi
          </Link>
          <Typography color="text.primary">Thêm mới</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Thêm Chương trình Khuyến mãi
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: General Info */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Thông tin chung
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Tên chương trình"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Loại khuyến mãi</InputLabel>
                    <Select
                      name="promotionTypeId"
                      value={formik.values.promotionTypeId}
                      label="Loại khuyến mãi"
                      onChange={formik.handleChange}
                    >
                      {PROMOTION_TYPES.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />

                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Ngày bắt đầu"
                      value={formik.values.startDate}
                      onChange={(val) => formik.setFieldValue("startDate", val)}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.startDate &&
                            Boolean(formik.errors.startDate),
                          helperText:
                            formik.touched.startDate &&
                            (formik.errors.startDate as string),
                        },
                      }}
                    />
                    <DatePicker
                      label="Ngày kết thúc"
                      value={formik.values.endDate}
                      onChange={(val) => formik.setFieldValue("endDate", val)}
                      minDate={formik.values.startDate.add(1, 'day')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.endDate &&
                            Boolean(formik.errors.endDate),
                          helperText:
                            formik.touched.endDate &&
                            (formik.errors.endDate as string),
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Card>

              {/* Dynamic Fields based on Type */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Chi tiết ưu đãi
                </Typography>
                <Stack spacing={3}>
                  {/* Common Field: Discount Percentage */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Mức giảm giá (%)"
                    name="discountPercent"
                    value={formik.values.discountPercent}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.discountPercent &&
                      Boolean(formik.errors.discountPercent)
                    }
                    helperText={
                      formik.touched.discountPercent &&
                      formik.errors.discountPercent
                    }
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />

                  {/* COURSE_DISCOUNT: Multi-select Courses for individual discount */}
                  {formik.values.promotionTypeId === 1 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chọn các khóa học áp dụng khuyến mãi học lẻ.
                      </Alert>
                      <Autocomplete
                        multiple
                        options={courses}
                        getOptionLabel={(option) => option.courseName}
                        value={courses.filter((c) =>
                          formik.values.courseIds.includes(c.courseId)
                        )}
                        onChange={(_, newValue) => {
                          formik.setFieldValue(
                            "courseIds",
                            newValue.map((c) => c.courseId)
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn khóa học khuyến mãi học lẻ"
                            placeholder="Thêm khóa học"
                            error={
                              formik.touched.courseIds &&
                              Boolean(formik.errors.courseIds)
                            }
                            helperText={
                              formik.touched.courseIds &&
                              formik.errors.courseIds
                            }
                          />
                        )}
                      />

                      {/* Display selected courses as a list for Type 1 */}
                      {formik.values.courseIds.length > 0 && (
                        <Card variant="outlined" sx={{ mt: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Khóa học đã chọn ({formik.values.courseIds.length})
                            </Typography>
                            <List dense>
                              {formik.values.courseIds.map((courseId) => {
                                const course = courses.find(
                                  (c) => c.courseId === courseId
                                );
                                return (
                                  <ListItem
                                    key={courseId}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <ListItemText
                                      primary={course?.courseName || "Unknown"}
                                      secondary={`ID: ${courseId}`}
                                    />
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => {
                                          formik.setFieldValue(
                                            "courseIds",
                                            formik.values.courseIds.filter(
                                              (id) => id !== courseId
                                            )
                                          );
                                        }}
                                        color="error"
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  )}

                  {/* COMBO: Multiple Select Courses */}
                  {formik.values.promotionTypeId === 2 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chọn các khóa học trong Combo (tối thiểu 2 khóa học).
                      </Alert>
                      <Autocomplete
                        multiple
                        options={courses}
                        getOptionLabel={(option) => option.courseName}
                        value={courses.filter((c) =>
                          formik.values.courseIds.includes(c.courseId)
                        )}
                        onChange={(_, newValue) => {
                          formik.setFieldValue(
                            "courseIds",
                            newValue.map((c) => c.courseId)
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn khóa học trong Combo"
                            placeholder="Thêm khóa học"
                            error={
                              formik.touched.courseIds &&
                              Boolean(formik.errors.courseIds)
                            }
                            helperText={
                              formik.touched.courseIds &&
                              formik.errors.courseIds
                            }
                          />
                        )}
                      />

                      {/* Display selected courses as a list */}
                      {formik.values.courseIds.length > 0 && (
                        <Card variant="outlined" sx={{ mt: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Các khóa học trong Combo ({formik.values.courseIds.length})
                            </Typography>
                            <List dense>
                              {formik.values.courseIds.map((courseId) => {
                                const course = courses.find(
                                  (c) => c.courseId === courseId
                                );
                                return (
                                  <ListItem
                                    key={courseId}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <ListItemText
                                      primary={course?.courseName || "Unknown"}
                                      secondary={`ID: ${courseId}`}
                                    />
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => {
                                          formik.setFieldValue(
                                            "courseIds",
                                            formik.values.courseIds.filter(
                                              (id) => id !== courseId
                                            )
                                          );
                                        }}
                                        color="error"
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  )}

                  {/* STUDENT_LOYALTY: Info only */}
                  {formik.values.promotionTypeId === 3 && (
                    <Alert severity="info">
                      Áp dụng tự động cho tất cả học viên đã từng đăng ký khóa học
                      tại trung tâm.
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Right Column: Actions */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Hành động
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Lưu khuyến mãi"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/promotions")}
                  >
                    Hủy bỏ
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default AddPromotionPage;
