import React, { useEffect, useState } from "react";
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
  Avatar,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { StudentModel } from "../model/student_model";
import { getStudentById, updateStudent } from "../services/student_service";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    try {
      const res = await getStudentById(studentId);
      if (res.data.data) {
        setStudent(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin học viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student || !id) return;
    try {
      await updateStudent(parseInt(id), student);
      setSnackbarMsg("Cập nhật thông tin thành công!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setSnackbarMsg("Có lỗi xảy ra, vui lòng thử lại.");
      setOpenSnackbar(true);
    }
  };

  const handleChange = (field: keyof StudentModel, value: any) => {
    if (student) {
      setStudent({ ...student, [field]: value });
    }
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
              navigate("/student");
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
              onClick={() => navigate("/student")}
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
                src={student.hinhanh}
                alt={student.hoten}
                sx={{ width: 120, height: 120, mx: "auto", mb: 2, border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{student.hoten}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Học viên
              </Typography>
              
              <Stack spacing={2} sx={{ textAlign: "left" }}>
                 <Box>
                    <Typography variant="caption" color="text.secondary">Mã học viên</Typography>
                    <Typography variant="body1" fontWeight={500}>{student.mahocvien}</Typography>
                 </Box>
                 <Box>
                    <Typography variant="caption" color="text.secondary">Ngày tham gia</Typography>
                    <Typography variant="body1" fontWeight={500}>01/01/2023</Typography>
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
                    value={student.hoten}
                    onChange={(e) => handleChange("hoten", e.target.value)}
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={student.gioitinh ? "true" : "false"}
                      label="Giới tính"
                      onChange={(e) => handleChange("gioitinh", e.target.value === "true")}
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
                    label="Ngày sinh"
                    type="date"
                    value={dayjs(student.ngaysinh).format("YYYY-MM-DD")}
                    onChange={(e) => handleChange("ngaysinh", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={student.sdt}
                    onChange={(e) => handleChange("sdt", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Trình độ"
                    value={student.trinhdo}
                    onChange={(e) => handleChange("trinhdo", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={student.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={student.diachi}
                    onChange={(e) => handleChange("diachi", e.target.value)}
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
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default StudentDetail;
