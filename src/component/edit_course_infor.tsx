import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { updateCourse, getImageUrl } from "../services/course_service";
import InputFileUpload from "./button_upload_file";
import { CourseDetails, CourseUpdateRequest } from "../model/course_model";

interface Props {
  courseId: number;
  initialData: CourseDetails;
  onSaveSuccess?: () => void;
}

// --- Các hàm tiện ích ---
/**
 * Định dạng số thành chuỗi tiền tệ Việt Nam (ví dụ: 1.000.000).
 * Trả về chuỗi rỗng nếu giá trị là 0 hoặc không hợp lệ.
 */
const formatNumberWithDots = (
  value: number | string | undefined | null
): string => {
  const numValue = Number(String(value).replace(/[^0-9]/g, ""));
  if (isNaN(numValue) || !numValue) return "";
  return numValue.toLocaleString("de-DE"); // Dùng locale 'de-DE' để có dấu chấm
};

/**
 * Chuyển đổi chuỗi số đã định dạng (có dấu chấm) thành số.
 */
const parseFormattedNumber = (value: string | undefined | null): number => {
  if (!value) return 0;
  const numString = String(value).replace(/[^0-9]/g, "");
  return Number(numString) || 0;
};

/**
 * Lấy ID video YouTube và trả về link embed.
 */
const handleLinkYoutube = (link: string): string | null => {
  const regex = /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  return match ? "https://www.youtube.com/embed/" + match[1] : null;
};
// ------------------------

const EditCourseInfo: React.FC<Props> = ({
  courseId,
  initialData,
  onSaveSuccess,
}) => {

  const [formData, setFormData] = useState<CourseDetails>(initialData);
  const [displayHocPhi, setDisplayHocPhi] = useState<string>(() =>
    formatNumberWithDots(initialData.hocphi)
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string | null>(() =>
    initialData.image ? getImageUrl(initialData.image) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
    setDisplayHocPhi(formatNumberWithDots(initialData.hocphi));
    setImgUrl(initialData.image ? getImageUrl(initialData.image) : null);
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSaveSuccess(false);

    if (name === "hocphi") {
      const numericValue = parseFormattedNumber(value);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      setDisplayHocPhi(formatNumberWithDots(numericValue));
    } else if (name === "sobuoihoc" || name === "sogiohoc") {
      const numericValue = parseFormattedNumber(value);

      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "video") {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (videoError) setVideoError(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVideoBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const link = event.target.value;
    const embedLink = handleLinkYoutube(link);
    if (link && !embedLink) {
      setVideoError("Link YouTube không hợp lệ.");
    } else if (embedLink && link !== embedLink) {
      setFormData((prev) => ({ ...prev, video: embedLink }));
      setVideoError(null);
    } else {
      setVideoError(null);
    }
  };

  const handleImageUploadSuccess = (fileName: string) => {
    setFormData((prev) => ({ ...prev, image: fileName }));
    setImgUrl(getImageUrl(fileName));
    setSaveSuccess(false); // Reset thông báo thành công
  };

  const handleFocusSelect = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleSaveChanges = async () => {
    if (
      !formData.tenkhoahoc ||
      formData.hocphi <= 0 ||
      formData.sobuoihoc <= 0 ||
      formData.sogiohoc <= 0 ||
      !formData.image
    ) {
      setSaveError(
        "Vui lòng điền đầy đủ các trường bắt buộc (*), bao gồm cả ảnh bìa."
      );
      return;
    }
    if (videoError) {
      setSaveError("Link video không hợp lệ.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updateRequest: CourseUpdateRequest = {
        courseName: formData.tenkhoahoc,
        tuitionFee: formData.hocphi,
        video: formData.video,
        description: formData.description,
        entryLevel: formData.entryLevel,
        targetLevel: formData.targetLevel,
        image: formData.image,
      };

      await updateCourse(courseId, updateRequest);
      setSaveSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thông tin khóa học:", err);
      setSaveError(
        err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thông tin chung
      </Typography>
      <Grid container spacing={3} alignItems="flex-start">
        {/* Tên khóa học */}
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            name="tenkhoahoc"
            label="Tên khóa học (*)"
            fullWidth
            value={formData.tenkhoahoc || ""}
            onChange={handleChange}
          />
        </Grid>

        {/* Học phí */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            name="hocphi"
            label="Học phí (*)"
            fullWidth
            value={displayHocPhi}
            onChange={handleChange}
            onFocus={handleFocusSelect}
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
              inputProps: { inputMode: "numeric" },
            }}
          />
        </Grid>

        {/* Số buổi học */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            name="sobuoihoc"
            label="Số buổi học (*)"
            type="number"
            fullWidth
            // Hiển thị giá trị số, rỗng nếu là 0
            value={formData.sobuoihoc === 0 ? "" : formData.sobuoihoc}
            onChange={handleChange}
            onFocus={handleFocusSelect}
            InputProps={{ inputProps: { min: 1 } }} // Ít nhất 1 buổi
          />
        </Grid>

        {/* Số giờ học */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            name="sogiohoc"
            label="Số giờ học (*)"
            type="number"
            fullWidth
            // Hiển thị giá trị số, rỗng nếu là 0
            value={formData.sogiohoc === 0 ? "" : formData.sogiohoc}
            onChange={handleChange}
            onFocus={handleFocusSelect}
            InputProps={{ inputProps: { min: 1 } }} // Ít nhất 1 giờ
            helperText="Tổng thời lượng modules phải khớp số này"
          />
        </Grid>

        {/* Trạng thái - Hiển thị trạng thái hiện tại, không cho sửa ở đây */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Trạng thái hiện tại: {initialData.trangthai || "N/A"}
          </Typography>
        </Grid>

        {/* Description, Entry Level, Target Level */}
        <Grid size={{ xs: 12 }}>
          <TextField
            name="description"
            label="Mô tả khóa học"
            multiline
            rows={3}
            fullWidth
            value={formData.description || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="entryLevel"
            label="Yêu cầu đầu vào"
            fullWidth
            value={formData.entryLevel || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="targetLevel"
            label="Mục tiêu đầu ra"
            fullWidth
            value={formData.targetLevel || ""}
            onChange={handleChange}
          />
        </Grid>

        {/* Video */}
        <Grid size={{ xs: 12 }}>
          <TextField
            name="video"
            label="Link Video giới thiệu"
            placeholder="Dán link youtube"
            fullWidth
            value={formData.video || ""}
            onChange={handleChange}
            onBlur={handleVideoBlur}
            error={!!videoError}
            helperText={videoError}
          />
        </Grid>

        {/* Image Upload and Preview */}
        <Grid size={{ xs: 12 }} container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              name="image"
              label="Ảnh bìa (Tên file)"
              fullWidth
              value={formData.image || ""}
              InputProps={{ readOnly: true }}
              helperText="Tải ảnh mới bên cạnh"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <InputFileUpload onUploadSuccess={handleImageUploadSuccess} />
          </Grid>
          {/* Xem trước ảnh */}
          {imgUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">Xem trước:</Typography>
              <Box
                component="img"
                src={imgUrl}
                sx={{
                  display: "block",
                  maxWidth: 200,
                  maxHeight: 150,
                  mt: 1,
                  border: "1px solid #eee",
                }}
              />
            </Grid>
          )}

          {isSuccess && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="green">
                Upload ảnh mới thành công!
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Nút Lưu và Thông báo */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : "Lưu thông tin"}
            </Button>
            {saveError && (
              <Alert severity="error" sx={{ flexGrow: 1 }}>
                {saveError}
              </Alert>
            )}
            {saveSuccess && (
              <Alert severity="success" sx={{ flexGrow: 1 }}>
                Lưu thông tin thành công!
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditCourseInfo;
