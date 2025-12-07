import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  Grid,
  TextField,
  Breadcrumbs,
  Link,
  Stack,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  CardContent,
  Divider,
  Box
} from "@mui/material";
import { School, PhotoCamera, Save, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getTeacherInfoById, updateTeacher } from "../../services/teacher_service";
import { TeacherInfo } from "../../model/teacher_model";
import { getImageUrl, uploadImage } from "../../services/file_service";

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

  const formik = useFormik({
    initialValues: {
      hoten: "",
      ngaysinh: dayjs(),
      sdt: "",
      email: "",
      anhdaidien: "",
    },
    validationSchema: Yup.object({
      hoten: Yup.string().required("Vui lòng nhập họ tên"),
      ngaysinh: Yup.date().required("Vui lòng chọn ngày sinh"),
      sdt: Yup.string().required("Vui lòng nhập số điện thoại"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        await updateTeacher(Number(id), {
          hoten: values.hoten,
          ngaysinh: values.ngaysinh.format("YYYY-MM-DD"),
          sdt: values.sdt,
          email: values.email,
          anhdaidien: values.anhdaidien,
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
        const info = await getTeacherInfoById(id);
        if (info) {
          setTeacherInfo(info);
          formik.setValues({
            hoten: info.fullName,
            ngaysinh: dayjs(info.dateOfBirth),
            sdt: info.phoneNumber,
            email: info.email,
            anhdaidien: info.imagePath,
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const fileName = await uploadImage(file);
        formik.setFieldValue("anhdaidien", fileName);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("Upload ảnh thất bại");
      }
    }
  };

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

        {/* Header with Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Chi tiết Giảng viên
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/teachers")}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => formik.handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column: Avatar & Basic Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Avatar
                    src={formik.values.anhdaidien ? getImageUrl(formik.values.anhdaidien) : undefined}
                    sx={{ width: 120, height: 120, mb: 2, mx: "auto", border: "4px solid white", boxShadow: 2 }}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                    <PhotoCamera />
                  </IconButton>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {teacherInfo?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {teacherInfo?.email}
                </Typography>
                <Chip label="Giảng viên" color="primary" size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>

            {/* Account Info Card (Admin Only) */}
            {teacherInfo?.accountInfo && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Thông tin tài khoản
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tên đăng nhập:</Typography>
                      <Typography variant="body2" fontWeight="medium">{teacherInfo.accountInfo.username}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vai trò:</Typography>
                      <Chip label={teacherInfo.accountInfo.role} size="small" color="info" sx={{ ml: 1 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Ngày tạo:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dayjs(teacherInfo.accountInfo.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Trạng thái xác thực:</Typography>
                      <Chip 
                        label={teacherInfo.accountInfo.isVerified ? "Đã xác thực" : "Chưa xác thực"} 
                        size="small" 
                        color={teacherInfo.accountInfo.isVerified ? "success" : "warning"} 
                        sx={{ ml: 1 }} 
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Bằng cấp & Chứng chỉ
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {teacherInfo?.qualifications && teacherInfo.qualifications.length > 0 ? (
                    teacherInfo.qualifications.map((degree, index) => (
                      <Chip
                        key={index}
                        icon={<School />}
                        label={`${degree.degreeName} - ${degree.level}`}
                        variant="outlined"
                        color="secondary"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có thông tin bằng cấp
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Detailed Info Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thông tin chi tiết
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="hoten"
                      value={formik.values.hoten}
                      onChange={formik.handleChange}
                      error={formik.touched.hoten && Boolean(formik.errors.hoten)}
                      helperText={formik.touched.hoten && formik.errors.hoten}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="Ngày sinh"
                      value={formik.values.ngaysinh}
                      onChange={(val) => formik.setFieldValue("ngaysinh", val)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formik.touched.ngaysinh && Boolean(formik.errors.ngaysinh),
                          helperText: formik.touched.ngaysinh && (formik.errors.ngaysinh as string),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="sdt"
                      value={formik.values.sdt}
                      onChange={formik.handleChange}
                      error={formik.touched.sdt && Boolean(formik.errors.sdt)}
                      helperText={formik.touched.sdt && formik.errors.sdt}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default TeacherDetailPage;
