import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CreateStudentAdminRequest } from "../../model/student_model";
import { createAdminStudent } from "../../services/student_service";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [formData, setFormData] = useState<CreateStudentAdminRequest>({
    name: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: true,
    address: "",
    job: "",
  });

  const handleChange = (field: keyof CreateStudentAdminRequest, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.phoneNumber) {
      setSnackbarMsg("Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại)");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await createAdminStudent(formData);
      if (response.code === 1000 && response.data) {
        setSnackbarMsg("Tạo học viên thành công! Mật khẩu mặc định đã được thiết lập.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
        // Redirect to student detail page after 1.5 seconds
        setTimeout(() => {
          navigate(`/students/${response.data.studentId}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo học viên:", error);
      setSnackbarMsg(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, width: "100%", py: 4, px: 2, backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/students");
            }}
          >
            Học viên
          </Link>
          <Typography color="text.primary">Thêm mới</Typography>
        </Breadcrumbs>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/students")}
              sx={{ color: "#667085" }}
            >
              Quay lại
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Thêm học viên mới
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: "#635bff",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0px 4px 12px rgba(99, 91, 255, 0.2)"
            }}
          >
            {loading ? "Đang tạo..." : "Tạo học viên"}
          </Button>
        </Stack>

        <Card sx={{ p: 4, borderRadius: "16px" }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Thông tin học viên
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo mật khẩu mặc định cho học viên. 
              Tài khoản sẽ được kích hoạt ngay lập tức và không gửi email xác thực.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Họ và tên"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                variant="outlined"
                placeholder="Nguyễn Văn A"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Số điện thoại"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="0912345678"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="student@example.com"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender ? "true" : "false"}
                  label="Giới tính"
                  onChange={(e) => handleChange("gender", e.target.value === "true")}
                  sx={{ borderRadius: "8px" }}
                >
                  <MenuItem value="true">Nam</MenuItem>
                  <MenuItem value="false">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nghề nghiệp"
                value={formData.job}
                onChange={(e) => handleChange("job", e.target.value)}
                placeholder="Sinh viên"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                multiline
                rows={3}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Grid>
          </Grid>
        </Card>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AddStudentPage;
