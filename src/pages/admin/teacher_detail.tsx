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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from "@mui/material";
import { School, PhotoCamera, Save, ArrowBack, Add, Delete, Close } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getLecturerDetail, updateLecturer, getDegrees } from "../../services/teacher_service";
import { LecturerResponse, DegreeDTO } from "../../model/teacher_model";
import { getImageUrl, uploadImage } from "../../services/file_service";

interface CertificateFormData {
  degreeId?: number;
  degreeTypeId?: number;
  degreeTypeName?: string;
  level: string;
  isNew?: boolean;
}

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<LecturerResponse | null>(null);
  const [degrees, setDegrees] = useState<DegreeDTO[]>([]);
  const [certificates, setCertificates] = useState<CertificateFormData[]>([]);
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [newCertificate, setNewCertificate] = useState<CertificateFormData>({
    degreeId: 0,
    level: "",
  });
  
  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const formik = useFormik({
    initialValues: {
      hoten: "",
      ngaysinh: dayjs(),
      sdt: "",
      email: "",
      anhdaidien: "",
      password: "",
    },
    validationSchema: Yup.object({
      hoten: Yup.string().required("Vui lòng nhập họ tên"),
      ngaysinh: Yup.date().required("Vui lòng chọn ngày sinh"),
      sdt: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại phải là 10-11 chữ số")
        .required("Vui lòng nhập số điện thoại"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        // Lọc ra certificates mới (có degreeId)
        const newCertificates = certificates
          .filter(c => c.degreeId && c.level)
          .map(c => ({
            degreeTypeId: c.degreeId!,  // Backend expects degreeTypeId
            level: c.level,
          }));

        const updateRequest = {
          fullName: values.hoten,
          dateOfBirth: values.ngaysinh.format("YYYY-MM-DD"),
          phoneNumber: values.sdt,
          email: values.email,
          imagePath: values.anhdaidien,
          password: values.password || undefined,
          // Chỉ gửi certificates nếu có certificate mới, nếu không thì undefined (backend sẽ không cập nhật)
          certificates: newCertificates.length > 0 ? newCertificates : undefined,
        };

        const response = await updateLecturer(Number(id), updateRequest);
        
        if (response.code === 1000) {
          setSnackbarMsg("Cập nhật giảng viên thành công!");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        console.error("Lỗi khi cập nhật giảng viên:", error);
        setSnackbarMsg(error.message || "Có lỗi xảy ra khi cập nhật giảng viên");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setSnackbarMsg("ID giảng viên không hợp lệ");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        setTimeout(() => navigate("/teachers"), 2000);
        return;
      }

      setLoading(true);
      try {
        // Load degrees from API
        const degreesList = await getDegrees();
        setDegrees(degreesList);

        // Load teacher info
        const response = await getLecturerDetail(Number(id));
        if (response.code === 1000 && response.data) {
          setTeacherInfo(response.data);
          formik.setValues({
            hoten: response.data.fullName,
            ngaysinh: dayjs(response.data.dateOfBirth),
            sdt: response.data.phoneNumber,
            email: response.data.email,
            anhdaidien: response.data.imagePath || "",
            password: "",
          });
          
          // Load existing certificates
          if (response.data.certificates && response.data.certificates.length > 0) {
            setCertificates(
              response.data.certificates.map(cert => ({
                degreeTypeId: cert.degreeTypeId,
                degreeTypeName: cert.degreeTypeName,
                level: cert.level,
                isNew: false,
              }))
            );
          }
        } else {
          setSnackbarMsg("Không tìm thấy giảng viên");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setTimeout(() => navigate("/teachers"), 2000);
        }
      } catch (error: any) {
        console.error("Lỗi khi tải thông tin:", error);
        setSnackbarMsg(error.message || "Có lỗi xảy ra khi tải thông tin");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        setTimeout(() => navigate("/teachers"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const fileName = await uploadImage(file);
        formik.setFieldValue("anhdaidien", fileName);
        setSnackbarMsg("Upload ảnh thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch (error: any) {
        console.error("Error uploading avatar:", error);
        setSnackbarMsg(error.message || "Upload ảnh thất bại");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleOpenDialog = () => {
    setNewCertificate({ degreeId: 0, level: "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCertificate({ degreeId: 0, level: "" });
  };

  const handleAddCertificate = () => {
    if (!newCertificate.degreeId || !newCertificate.level.trim()) {
      setSnackbarMsg("Vui lòng chọn loại chứng chỉ và nhập trình độ");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    // Thêm chứng chỉ mới với flag isNew
    setCertificates([...certificates, { ...newCertificate, isNew: true }]);
    setSnackbarMsg("Đã thêm chứng chỉ. Nhớ nhấn 'Lưu thay đổi' để cập nhật!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
    handleCloseDialog();
  };

  const handleRemoveCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const getCertificateName = (cert: CertificateFormData): string => {
    // Nếu có degreeTypeName (từ API) thì dùng luôn
    if (cert.degreeTypeName) {
      return cert.degreeTypeName;
    }
    // Nếu là certificate mới (có degreeId) thì tìm tên từ degrees list
    if (cert.degreeId) {
      const degree = degrees.find(d => d.id === cert.degreeId);
      return degree ? degree.name : "Không rõ";
    }
    return "Không rõ";
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Đang tải thông tin...
          </Typography>
        </Box>
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
                <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                  <Avatar
                    src={formik.values.anhdaidien ? getImageUrl(formik.values.anhdaidien) : undefined}
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      mx: "auto", 
                      border: "4px solid white", 
                      boxShadow: 3,
                      bgcolor: "primary.main",
                      fontSize: "3rem",
                    }}
                  >
                    {!formik.values.anhdaidien && teacherInfo?.fullName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "primary.dark" },
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {teacherInfo?.phoneNumber}
                </Typography>
                <Chip label="Giảng viên" color="primary" size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thống kê
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số lớp:
                    </Typography>
                    <Chip 
                      label={teacherInfo?.totalClasses || 0} 
                      size="small" 
                      color="default"
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Lớp đang dạy:
                    </Typography>
                    <Chip 
                      label={teacherInfo?.activeClasses || 0} 
                      size="small" 
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            
          </Grid>

          {/* Right Column: Detailed Info Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Personal Information Card */}
            <Card sx={{ boxShadow: "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thông tin cá nhân
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
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Mật khẩu mới (để trống nếu không đổi)"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Certificates Card */}
            <Card sx={{ mt: 3, boxShadow: "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px", borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Chứng chỉ
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleOpenDialog}
                  >
                    Thêm chứng chỉ
                  </Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                
                {/* Existing Certificates */}
                <Stack spacing={1.5}>
                  {certificates.length === 0 ? (
                    <Box textAlign="center" sx={{ py: 4 }}>
                      <School sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Chưa có chứng chỉ nào
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nhấn "Thêm chứng chỉ" để bắt đầu
                      </Typography>
                    </Box>
                  ) : (
                    certificates.map((cert, index) => (
                      <Box 
                        key={index}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: cert.isNew ? "warning.main" : "divider",
                          borderRadius: 2,
                          backgroundColor: cert.isNew 
                            ? "rgba(255, 152, 0, 0.08)" 
                            : "rgba(99, 91, 255, 0.04)",
                          position: "relative",
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center" textAlign="left">
                          <School 
                            color={cert.isNew ? "warning" : "primary"} 
                            fontSize="small" 
                          />
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={600}>
                                {getCertificateName(cert)}
                              </Typography>
                              {cert.isNew && (
                                <Chip 
                                  label="Chưa lưu" 
                                  size="small" 
                                  color="warning"
                                  sx={{ 
                                    height: 20,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Trình độ: {cert.level}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveCertificate(index)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>

                {/* Warning for unsaved certificates */}
                {certificates.some(c => c.isNew) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Có chứng chỉ chưa được lưu! Nhấn nút "Lưu thay đổi" ở trên để cập nhật.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Certificate Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Thêm Chứng chỉ mới
              </Typography>
              <IconButton size="small" onClick={handleCloseDialog}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Loại chứng chỉ *</InputLabel>
                <Select
                  value={newCertificate.degreeId || ""}
                  label="Loại chứng chỉ *"
                  onChange={(e) =>
                    setNewCertificate({ ...newCertificate, degreeId: Number(e.target.value) })
                  }
                >
                  <MenuItem value="">
                    <em>Chọn loại chứng chỉ</em>
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
                label="Trình độ/Level *"
                placeholder="VD: 8.0, C1, Advanced, Giỏi..."
                value={newCertificate.level}
                onChange={(e) =>
                  setNewCertificate({ ...newCertificate, level: e.target.value })
                }
                helperText="Nhập trình độ hoặc điểm số của chứng chỉ"
              />

              <Alert severity="info">
                Chứng chỉ sẽ được thêm vào danh sách preview. Nhớ nhấn "Lưu thay đổi" để cập nhật vào hệ thống.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Hủy
            </Button>
            <Button 
              onClick={handleAddCertificate} 
              variant="contained"
              startIcon={<Add />}
            >
              Thêm chứng chỉ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert 
            severity={snackbarSeverity} 
            onClose={() => setOpenSnackbar(false)}
            sx={{ borderRadius: 2 }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default TeacherDetailPage;
