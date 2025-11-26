import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { LoaiKhuyenMai } from "../model/promotion_model";
import {
  getPromotionById,
  updatePromotion,
  getAllPromotionTypes,
} from "../services/promotion_service";
import { getCourseFilterList } from "../services/class_service";
import { CourseFilterData } from "../model/class_model";

const PromotionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseFilterData[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<LoaiKhuyenMai[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      tenKhuyenMai: "",
      maLoaiKhuyenMai: "" as unknown as number,
      moTa: "",
      ngayBatDau: dayjs(),
      ngayKetThuc: dayjs().add(1, "month"),
      phanTramGiam: 0,
      courseIds: [] as number[],
      selectedCourseId: "",
      trangThai: true,
    },
    validationSchema: Yup.object({
      tenKhuyenMai: Yup.string().required("Vui lòng nhập tên chương trình"),
      maLoaiKhuyenMai: Yup.number().required("Vui lòng chọn loại khuyến mãi"),
      ngayBatDau: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
      ngayKetThuc: Yup.date()
        .required("Vui lòng chọn ngày kết thúc")
        .min(Yup.ref("ngayBatDau"), "Ngày kết thúc phải sau ngày bắt đầu"),
      phanTramGiam: Yup.number()
        .min(0, "Không được nhỏ hơn 0")
        .max(100, "Không được lớn hơn 100")
        .required("Vui lòng nhập mức giảm giá"),
      courseIds: Yup.array().when("maLoaiKhuyenMai", {
        is: 1, // Combo
        then: (schema) => schema.min(2, "Vui lòng chọn ít nhất 2 khóa học"),
        otherwise: (schema) => schema.notRequired(),
      }),
      selectedCourseId: Yup.string().when("maLoaiKhuyenMai", {
        is: 3, // Course Discount
        then: (schema) => schema.required("Vui lòng chọn khóa học"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        const payload: any = {
          tenKhuyenMai: values.tenKhuyenMai,
          maLoaiKhuyenMai: Number(values.maLoaiKhuyenMai),
          moTa: values.moTa,
          ngayBatDau: values.ngayBatDau.format("YYYY-MM-DD"),
          ngayKetThuc: values.ngayKetThuc.format("YYYY-MM-DD"),
          trangThai: values.trangThai,
          phanTramGiam: Number(values.phanTramGiam),
          chiTietKhuyenMai: [],
        };

        if (values.maLoaiKhuyenMai === 1) {
          payload.chiTietKhuyenMai = values.courseIds.map(id => ({ maKhoaHoc: id }));
        } else if (values.maLoaiKhuyenMai === 3) {
          payload.chiTietKhuyenMai = [{ maKhoaHoc: Number(values.selectedCourseId) }];
        }

        await updatePromotion(Number(id), payload);
        alert("Cập nhật khuyến mãi thành công!");
        navigate("/promotions");
      } catch (error) {
        console.error("Failed to update promotion", error);
        alert("Có lỗi xảy ra khi cập nhật khuyến mãi.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseData, typeData, promotionData] = await Promise.all([
          getCourseFilterList(),
          getAllPromotionTypes(),
          getPromotionById(Number(id)),
        ]);
        setCourses(courseData);
        setPromotionTypes(typeData);

        if (promotionData) {
          const courseIds = promotionData.chiTietKhuyenMai?.map(ct => ct.maKhoaHoc) || [];
          
          formik.setValues({
            tenKhuyenMai: promotionData.tenKhuyenMai,
            maLoaiKhuyenMai: promotionData.maLoaiKhuyenMai,
            moTa: promotionData.moTa || "",
            ngayBatDau: dayjs(promotionData.ngayBatDau),
            ngayKetThuc: dayjs(promotionData.ngayKetThuc),
            phanTramGiam: promotionData.phanTramGiam || 0,
            courseIds: courseIds,
            selectedCourseId:
              promotionData.maLoaiKhuyenMai === 3 && courseIds.length
                ? String(courseIds[0])
                : "",
            trangThai: promotionData.trangThai,
          });
        } else {
          alert("Không tìm thấy khuyến mãi");
          navigate("/promotions");
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <Typography color="text.primary">Chi tiết</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Chi tiết Chương trình Khuyến mãi
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: General Info */}
            <Grid size={{xs: 12, md: 8}}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Thông tin chung
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Tên chương trình"
                    name="tenKhuyenMai"
                    value={formik.values.tenKhuyenMai}
                    onChange={formik.handleChange}
                    error={formik.touched.tenKhuyenMai && Boolean(formik.errors.tenKhuyenMai)}
                    helperText={formik.touched.tenKhuyenMai && formik.errors.tenKhuyenMai}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Loại khuyến mãi</InputLabel>
                    <Select
                      name="maLoaiKhuyenMai"
                      value={formik.values.maLoaiKhuyenMai}
                      label="Loại khuyến mãi"
                      onChange={formik.handleChange}
                      disabled // Disable type change in edit mode
                    >
                      {promotionTypes.map((type) => (
                        <MenuItem key={type.ma} value={type.ma}>
                          {type.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả"
                    name="moTa"
                    value={formik.values.moTa}
                    onChange={formik.handleChange}
                  />

                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Ngày bắt đầu"
                      value={formik.values.ngayBatDau}
                      onChange={(val) => formik.setFieldValue("ngayBatDau", val)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.ngayBatDau &&
                            Boolean(formik.errors.ngayBatDau),
                          helperText:
                            formik.touched.ngayBatDau &&
                            (formik.errors.ngayBatDau as string),
                        },
                      }}
                    />
                    <DatePicker
                      label="Ngày kết thúc"
                      value={formik.values.ngayKetThuc}
                      onChange={(val) => formik.setFieldValue("ngayKetThuc", val)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.ngayKetThuc &&
                            Boolean(formik.errors.ngayKetThuc),
                          helperText:
                            formik.touched.ngayKetThuc &&
                            (formik.errors.ngayKetThuc as string),
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
                    name="phanTramGiam"
                    value={formik.values.phanTramGiam}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.phanTramGiam &&
                      Boolean(formik.errors.phanTramGiam)
                    }
                    helperText={
                      formik.touched.phanTramGiam &&
                      formik.errors.phanTramGiam
                    }
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />

                  {/* COMBO: Multi-select Courses */}
                  {formik.values.maLoaiKhuyenMai === 1 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chọn các khóa học áp dụng trong Combo này.
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
                    </Box>
                  )}

                  {/* COURSE_DISCOUNT: Single Select Course */}
                  {formik.values.maLoaiKhuyenMai === 3 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chọn khóa học được giảm giá.
                      </Alert>
                      <FormControl fullWidth>
                        <InputLabel>Khóa học áp dụng</InputLabel>
                        <Select
                          name="selectedCourseId"
                          value={formik.values.selectedCourseId}
                          label="Khóa học áp dụng"
                          onChange={formik.handleChange}
                          error={
                            formik.touched.selectedCourseId &&
                            Boolean(formik.errors.selectedCourseId)
                          }
                        >
                          {courses.map((course) => (
                            <MenuItem
                              key={course.courseId}
                              value={course.courseId}
                            >
                              {course.courseName}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.selectedCourseId &&
                          formik.errors.selectedCourseId && (
                            <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                              {formik.errors.selectedCourseId}
                            </Typography>
                          )}
                      </FormControl>
                    </Box>
                  )}

                  {/* STUDENT_LOYALTY: Info only */}
                  {formik.values.maLoaiKhuyenMai === 2 && (
                    <Alert severity="info">
                      Áp dụng tự động cho tất cả học viên đã từng đăng ký khóa học
                      tại trung tâm.
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Right Column: Actions */}
            <Grid size={{xs: 12, md: 4}}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Hành động
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.trangThai}
                        onChange={(e) =>
                          formik.setFieldValue("trangThai", e.target.checked)
                        }
                        color="success"
                      />
                    }
                    label={formik.values.trangThai ? "Đang hoạt động" : "Tạm dừng"}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Cập nhật"}
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
      </Container>
    </LocalizationProvider>
  );
};

export default PromotionDetailPage;
