import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  Chip,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { StudentAdminResponse } from "../../model/student_model";
import { getStudentById, updateStudent } from "../../services/student_service";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import dayjs from "dayjs";
import InputFileUpload from "../../component/button_upload_file";
import { getImageUrl } from "../../services/file_service";

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    setLoading(true);
    try {
      const response = await getStudentById(studentId);
      if (response.code === 1000 && response.data) {
        setStudent(response.data);
      } else {
        setSnackbarMsg("Không tìm thấy học viên");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải thông tin học viên:", error);
      setSnackbarMsg(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student || !id) return;
    try {
      const updateData: Partial<StudentAdminResponse> = {
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        occupation: student.occupation,
        educationLevel: student.educationLevel,
        avatarUrl: student.avatarUrl,
      };

      const response = await updateStudent(parseInt(id), updateData);

      if (response.code === 1000) {
        // Refresh student data from server to ensure sync
        if (response.data) {
          setStudent(response.data);
        }
        setSnackbarMsg("Cập nhật thông tin thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error);
      setSnackbarMsg(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleChange = (field: keyof StudentAdminResponse, value: any) => {
    if (student) {
      setStudent({ ...student, [field]: value });
    }
  };

  const handleUploadSuccess = (fileUrl: string) => {
    console.log("Avatar uploaded successfully:", fileUrl);
    handleChange("avatarUrl", fileUrl);
    setSnackbarMsg("Upload ảnh thành công! Nhớ nhấn 'Lưu thay đổi' để cập nhật.");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Đang tải...</Box>;
  }

  if (!student) {
    return <Box sx={{ p: 3 }}>Không tìm thấy học viên.</Box>;
  }

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
          <Typography color="text.primary">Chi tiết</Typography>
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
              Thông tin học viên
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              backgroundColor: "#635bff",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0px 4px 12px rgba(99, 91, 255, 0.2)"
            }}
          >
            Lưu thay đổi
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column: Avatar & Basic Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, borderRadius: "16px", textAlign: "center", height: "100%" }}>
              <Avatar
                src={getImageUrl(student.avatarUrl || "")}
                alt={student.fullName}
                sx={{ width: 120, height: 120, mx: "auto", mb: 2, border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
              </Avatar>
              <InputFileUpload onUploadSuccess={handleUploadSuccess} />
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>{student.fullName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Học viên
              </Typography>

              <Stack spacing={2} sx={{ textAlign: "left" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Mã học viên</Typography>
                  <Typography variant="body1" fontWeight={500}>{student.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ngày tham gia</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {dayjs(student.enrollmentDate).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Số lớp đã đăng ký</Typography>
                  <Chip
                    label={student.totalClassesEnrolled}
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Right Column: Edit Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 4, borderRadius: "16px" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Thông tin cá nhân
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={student.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={student.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={student.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    type="date"
                    value={student.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nghề nghiệp"
                    value={student.occupation || ""}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Trình độ học vấn"
                    value={student.educationLevel || ""}
                    onChange={(e) => handleChange("educationLevel", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={student.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

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

export default StudentDetail;
