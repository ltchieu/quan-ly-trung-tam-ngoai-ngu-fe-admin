import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  Grid,
  TextField,
  FormControl,
  Breadcrumbs,
  Link,
  Stack,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getTeacherById, updateTeacher } from "../services/teacher_service";

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      hoten: "",
      ngaysinh: dayjs(),
      gioitinh: "true",
      sdt: "",
      email: "",
      diachi: "",
      anhdaidien: "",
      trinhdo: "",
      mota: "",
    },
    validationSchema: Yup.object({
      hoten: Yup.string().required("Vui lòng nhập họ tên"),
      ngaysinh: Yup.date().required("Vui lòng chọn ngày sinh"),
      sdt: Yup.string().required("Vui lòng nhập số điện thoại"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      diachi: Yup.string().required("Vui lòng nhập địa chỉ"),
      trinhdo: Yup.string().required("Vui lòng nhập trình độ"),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        await updateTeacher(Number(id), {
          hoten: values.hoten,
          ngaysinh: values.ngaysinh.format("YYYY-MM-DD"),
          gioitinh: values.gioitinh === "true",
          sdt: values.sdt,
          email: values.email,
          diachi: values.diachi,
          anhdaidien: values.anhdaidien,
          trinhdo: values.trinhdo,
          mota: values.mota,
        });
        alert("Cập nhật giảng viên thành công!");
        navigate("/teachers");
      } catch (error) {
        console.error("Failed to update teacher", error);
        alert("Có lỗi xảy ra khi cập nhật giảng viên.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const teacher = await getTeacherById(Number(id));
        if (teacher) {
          formik.setValues({
            hoten: teacher.hoten,
            ngaysinh: dayjs(teacher.ngaysinh),
            gioitinh: String(teacher.gioitinh),
            sdt: teacher.sdt,
            email: teacher.email,
            diachi: teacher.diachi,
            anhdaidien: teacher.anhdaidien,
            trinhdo: teacher.trinhdo,
            mota: teacher.mota || "",
          });
        } else {
          alert("Không tìm thấy giảng viên");
          navigate("/teachers");
        }
      } catch (error) {
        console.error("Failed to fetch teacher", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
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
          <Link underline="hover" color="inherit" href="/teachers">
            Quản lý Giảng viên
          </Link>
          <Typography color="text.primary">Chi tiết</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Chi tiết Giảng viên
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: Personal Info */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Thông tin cá nhân
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="hoten"
                    value={formik.values.hoten}
                    onChange={formik.handleChange}
                    error={formik.touched.hoten && Boolean(formik.errors.hoten)}
                    helperText={formik.touched.hoten && formik.errors.hoten}
                  />

                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Ngày sinh"
                      value={formik.values.ngaysinh}
                      onChange={(val) => formik.setFieldValue("ngaysinh", val)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.ngaysinh &&
                            Boolean(formik.errors.ngaysinh),
                          helperText:
                            formik.touched.ngaysinh &&
                            (formik.errors.ngaysinh as string),
                        },
                      }}
                    />
                    <FormControl>
                      <FormLabel>Giới tính</FormLabel>
                      <RadioGroup
                        row
                        name="gioitinh"
                        value={formik.values.gioitinh}
                        onChange={formik.handleChange}
                      >
                        <FormControlLabel
                          value="true"
                          control={<Radio />}
                          label="Nam"
                        />
                        <FormControlLabel
                          value="false"
                          control={<Radio />}
                          label="Nữ"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="sdt"
                    value={formik.values.sdt}
                    onChange={formik.handleChange}
                    error={formik.touched.sdt && Boolean(formik.errors.sdt)}
                    helperText={formik.touched.sdt && formik.errors.sdt}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />

                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="diachi"
                    value={formik.values.diachi}
                    onChange={formik.handleChange}
                    error={formik.touched.diachi && Boolean(formik.errors.diachi)}
                    helperText={formik.touched.diachi && formik.errors.diachi}
                  />
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Thông tin chuyên môn
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Trình độ"
                    name="trinhdo"
                    value={formik.values.trinhdo}
                    onChange={formik.handleChange}
                    error={formik.touched.trinhdo && Boolean(formik.errors.trinhdo)}
                    helperText={formik.touched.trinhdo && formik.errors.trinhdo}
                  />

                  <TextField
                    fullWidth
                    label="Link ảnh đại diện"
                    name="anhdaidien"
                    value={formik.values.anhdaidien}
                    onChange={formik.handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả"
                    name="mota"
                    value={formik.values.mota}
                    onChange={formik.handleChange}
                  />
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
                    {isSubmitting ? <CircularProgress size={24} /> : "Cập nhật"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/teachers")}
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

export default TeacherDetailPage;
