import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Typography,
} from "@mui/material";
import { CreateStudentAdminRequest } from "../model/student_model";

interface StudentFormProps {
  formData: CreateStudentAdminRequest;
  onChange: (field: keyof CreateStudentAdminRequest, value: any) => void;
  showInfoAlert?: boolean;
}

/**
 * Shared component for Student Form
 * Được sử dụng tại:
 * 1. AddStudentPage - Trang thêm học viên (full page)
 * 2. EnrollStudent - Modal thêm nhanh học viên khi xếp lớp
 */
const StudentForm: React.FC<StudentFormProps> = ({ 
  formData, 
  onChange,
  showInfoAlert = true 
}) => {
  return (
    <Box>
      {showInfoAlert && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo mật khẩu mặc định cho học viên. 
            Tài khoản sẽ được kích hoạt ngay lập tức và không gửi email xác thực.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Họ và tên"
            required
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
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
            onChange={(e) => onChange("phoneNumber", e.target.value)}
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
            onChange={(e) => onChange("email", e.target.value)}
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
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
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
              onChange={(e) => onChange("gender", e.target.value === "true")}
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
            onChange={(e) => onChange("job", e.target.value)}
            placeholder="Sinh viên"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            multiline
            rows={3}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentForm;
