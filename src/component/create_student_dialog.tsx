import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { CreateStudentAdminRequest } from "../model/student_model";
import { createAdminStudent } from "../services/student_service";
import StudentForm from "./student_form";

interface CreateStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (studentId: number, studentName: string) => void;
}

/**
 * Dialog để tạo học viên mới nhanh
 * Sử dụng tại trang EnrollStudent khi chưa có học viên trong hệ thống
 */
const CreateStudentDialog: React.FC<CreateStudentDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.phoneNumber) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại)");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await createAdminStudent(formData);
      if (response.code === 1000 && response.data) {
        // Reset form
        setFormData({
          name: "",
          phoneNumber: "",
          email: "",
          dateOfBirth: "",
          gender: true,
          address: "",
          job: "",
        });
        
        // Notify parent component
        onSuccess(response.data.studentId, response.data.name);
        onClose();
      }
    } catch (err: any) {
      console.error("Lỗi khi tạo học viên:", err);
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Tạo học viên mới
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            disabled={loading}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}
        
        <StudentForm
          formData={formData}
          onChange={handleChange}
          showInfoAlert={false}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          sx={{
            backgroundColor: "#635bff",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang tạo..." : "Tạo học viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStudentDialog;
