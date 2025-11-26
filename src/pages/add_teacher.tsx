import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createTeacher } from "../services/teacher_service";

const AddTeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      hoten: "",
      ngaysinh: dayjs(),
      gioitinh: "true", // "true" for Nam, "false" for Nữ
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
      setIsSubmitting(true);
      try {
        await createTeacher({
          hoten: values.hoten,
          ngaysinh: values.ngaysinh.format("YYYY-MM-DD"),
          gioitinh: values.gioitinh === "true",
          sdt: values.sdt,
          email: values.email,
          diachi: values.diachi,
          anhdaidien: values.anhdaidien || "https://via.placeholder.com/150",
          trinhdo: values.trinhdo,
          mota: values.mota,
        });
        alert("Thêm giảng viên thành công!");
        navigate("/teachers");
      } catch (error) {
        console.error("Failed to create teacher", error);
        alert("Có lỗi xảy ra khi thêm giảng viên.");
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
          <Link underline="hover" color="inherit" href="/teachers">
            Quản lý Giảng viên
          </Link>
          <Typography color="text.primary">Thêm mới</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Thêm Giảng viên
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
                    {isSubmitting ? <CircularProgress size={24} /> : "Lưu giảng viên"}
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

export default AddTeacherPage;
