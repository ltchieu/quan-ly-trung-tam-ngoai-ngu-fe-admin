import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  Button,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CreateStudentAdminRequest } from "../../model/student_model";
import { createAdminStudent } from "../../services/student_service";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StudentForm from "../../component/student_form";

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
          
          <StudentForm 
            formData={formData}
            onChange={handleChange}
            showInfoAlert={true}
          />
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
