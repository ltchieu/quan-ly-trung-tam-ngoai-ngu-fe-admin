import React, { useState, useEffect } from "react";
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
  IconButton,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { createLecturer, getDegrees } from "../../services/teacher_service";
import { DegreeDTO } from "../../model/teacher_model";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";

const AddTeacherPage: React.FC = () => {
  useAxiosPrivate();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [degrees, setDegrees] = useState<DegreeDTO[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const data = await getDegrees();
        setDegrees(data);
      } catch (error) {
        console.error("Error fetching degrees:", error);
        setNotification({
          open: true,
          message: "Không thể tải danh sách bằng cấp",
          severity: "error",
        });
      }
    };
    fetchDegrees();
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      dateOfBirth: dayjs().subtract(20, "year") as Dayjs,
      phoneNumber: "",
      email: "",
      password: "",
      imagePath: "",
      certificates: [] as { degreeTypeId: number | ""; level: string }[],
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Vui lòng nhập họ tên"),
      dateOfBirth: Yup.date().required("Vui lòng chọn ngày sinh").max(dayjs(), "Ngày sinh phải là ngày trong quá khứ"),
      phoneNumber: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại phải là 10-11 chữ số")
        .required("Vui lòng nhập số điện thoại"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Filter and format certificates
        const validCertificates = values.certificates
          .filter((cert) => cert.degreeTypeId !== "")
          .map((cert) => ({
            degreeTypeId: cert.degreeTypeId as number,
            level: cert.level || undefined,
          }));

        await createLecturer({
          fullName: values.fullName,
          dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
          phoneNumber: values.phoneNumber,
          email: values.email,
          password: values.password,
          imagePath: values.imagePath || undefined,
          certificates: validCertificates.length > 0 ? validCertificates : undefined,
        });

        setNotification({
          open: true,
          message: "Thêm giảng viên thành công!",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/teachers");
        }, 1500);
      } catch (error: any) {
        console.error("Failed to create lecturer", error);
        setNotification({
          open: true,
          message: error.message || "Có lỗi xảy ra khi thêm giảng viên.",
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
          <Link underline="hover" color="inherit" href="/teachers">
            Quản lý Giảng viên
          </Link>
          <Typography color="text.primary">Thêm mới</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Thêm Giảng viên
        </Typography>

        <FormikProvider value={formik}>
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
                      label="Họ tên *"
                      name="fullName"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                      helperText={formik.touched.fullName && formik.errors.fullName}
                    />

                    <DatePicker
                      label="Ngày sinh *"
                      value={formik.values.dateOfBirth}
                      onChange={(val) => formik.setFieldValue("dateOfBirth", val)}
                      maxDate={dayjs()}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.dateOfBirth &&
                            Boolean(formik.errors.dateOfBirth),
                          helperText:
                            formik.touched.dateOfBirth &&
                            (formik.errors.dateOfBirth as string),
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                      placeholder="0123456789"
                    />

                    <TextField
                      fullWidth
                      label="Email *"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      placeholder="example@email.com"
                    />

                    <TextField
                      fullWidth
                      label="Mật khẩu *"
                      name="password"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      placeholder="Tối thiểu 6 ký tự"
                    />

                    <TextField
                      fullWidth
                      label="Link ảnh đại diện"
                      name="imagePath"
                      value={formik.values.imagePath}
                      onChange={formik.handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Bằng cấp
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        formik.setFieldValue("certificates", [
                          ...formik.values.certificates,
                          { degreeTypeId: "", level: "" },
                        ]);
                      }}
                    >
                      Thêm bằng cấp
                    </Button>
                  </Box>

                  <FieldArray name="certificates">
                    {() => (
                      <Stack spacing={2}>
                        {formik.values.certificates.map((cert, index) => (
                          <Card key={index} variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <FormControl fullWidth>
                                <InputLabel>Loại bằng cấp</InputLabel>
                                <Select
                                  value={cert.degreeTypeId}
                                  label="Loại bằng cấp"
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      `certificates[${index}].degreeTypeId`,
                                      e.target.value
                                    )
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Chọn loại bằng cấp</em>
                                  </MenuItem>
                                  {degrees.map((degree) => (
                                    <MenuItem key={degree.id} value={degree.id}>
                                      {degree.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <TextField
                                fullWidth
                                label="Trình độ"
                                placeholder="VD: Band 8.0, 950 điểm..."
                                value={cert.level}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `certificates[${index}].level`,
                                    e.target.value
                                  )
                                }
                              />

                              <IconButton
                                color="error"
                                onClick={() => {
                                  const newCerts = formik.values.certificates.filter(
                                    (_, i) => i !== index
                                  );
                                  formik.setFieldValue("certificates", newCerts);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </Card>
                        ))}

                        {formik.values.certificates.length === 0 && (
                          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                            <Typography variant="body2">
                              Chưa có bằng cấp nào. Nhấn "Thêm bằng cấp" để thêm mới.
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    )}
                  </FieldArray>
                </Card>
              </Grid>

              {/* Right Column: Actions */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 3, mb: 3 }}>
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
                      disabled={isSubmitting}
                    >
                      Hủy bỏ
                    </Button>
                  </Stack>
                </Card>

                <Card sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Lưu ý:
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                    • Các trường có dấu (*) là bắt buộc
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                    • Mật khẩu phải có ít nhất 6 ký tự
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                    • Số điện thoại phải là 10-11 chữ số
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    • Bằng cấp có thể thêm sau khi tạo giảng viên
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </form>
        </FormikProvider>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default AddTeacherPage;
