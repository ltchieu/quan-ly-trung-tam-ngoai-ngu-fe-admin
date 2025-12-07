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
  Autocomplete,
  Chip
} from "@mui/material";
import { updateCourse, getAllSkills } from "../services/course_service";
import { getImageUrl } from "../services/file_service";
import InputFileUpload from "./button_upload_file";
import { CourseDetailResponse, CourseUpdateRequest, SkillResponse } from "../model/course_model";

interface Props {
  courseId: number;
  initialData: CourseDetailResponse;
  onSaveSuccess?: () => void;
  hasOpenClasses?: boolean;
  totalModuleDuration?: number;
}

// --- Các hàm tiện ích ---
const formatNumberWithDots = (
  value: number | string | undefined | null
): string => {
  const numValue = Number(String(value).replace(/[^0-9]/g, ""));
  if (isNaN(numValue) || !numValue) return "";
  return numValue.toLocaleString("de-DE");
};

const parseFormattedNumber = (value: string | undefined | null): number => {
  if (!value) return 0;
  const numString = String(value).replace(/[^0-9]/g, "");
  return Number(numString) || 0;
};

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
  hasOpenClasses = false,
  totalModuleDuration = 0
}) => {

  const [formData, setFormData] = useState<CourseDetailResponse>(initialData);
  const [displayHocPhi, setDisplayHocPhi] = useState<string>(() =>
    formatNumberWithDots(initialData.tuitionFee)
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string | null>(() =>
    initialData.image ? getImageUrl(initialData.image) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Skill state
  const [allSkills, setAllSkills] = useState<SkillResponse[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillResponse[]>([]);

  useEffect(() => {
    setFormData(initialData);
    setDisplayHocPhi(formatNumberWithDots(initialData.tuitionFee));
    setImgUrl(initialData.image ? getImageUrl(initialData.image) : null);

    // Fetch skills if not loaded
    const fetchSkills = async () => {
      try {
        const res = await getAllSkills();
        if (res.data) {
          setAllSkills(res.data);
          // Set selected skills based on initialData.skillModules
          const initialSkillIds = initialData.skillModules?.map(g => g.skillId) || [];
          if (initialSkillIds.length > 0) {
            const selected = res.data.filter(s => initialSkillIds.includes(s.id));
            setSelectedSkills(selected);
          } else {
            setSelectedSkills([]);
          }
        }
      } catch (error) {
        console.error("Failed to load skills", error);
      }
    };
    fetchSkills();

  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSaveSuccess(false);

    if (name === "tuitionFee") {
      const numericValue = parseFormattedNumber(value);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      setDisplayHocPhi(formatNumberWithDots(numericValue));
    } else if (name === "studyHours") {
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
    setIsSuccess(true)
    setSaveSuccess(false);
  };

  const handleFocusSelect = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleSaveChanges = async () => {
    if (
      !formData.courseName ||
      formData.tuitionFee < 0 || // allow 0? Previous check was <= 0
      formData.studyHours <= 0 ||
      !formData.image
    ) {
      setSaveError(
        "Vui lòng điền đầy đủ các trường bắt buộc (*), bao gồm cả ảnh bìa. Học phí phải không âm."
      );
      return;
    }
    if (videoError) {
      setSaveError("Link video không hợp lệ.");
      return;
    }

    if (!hasOpenClasses) {
      if (formData.studyHours !== totalModuleDuration) {
        setSaveError(`Tổng thời lượng các module (${totalModuleDuration}h) không khớp với số giờ học (${formData.studyHours}h). Vui lòng điều chỉnh.`);
        return;
      }
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Calculate skill diffs
      const currentSkillIds = selectedSkills.map(s => s.id);
      const initialSkillIds = initialData.skillModules?.map(g => g.skillId) || [];

      const skillIdsToAdd = currentSkillIds.filter(id => !initialSkillIds.includes(id));
      const skillIdsToRemove = initialSkillIds.filter(id => !currentSkillIds.includes(id));

      const updateRequest: CourseUpdateRequest = {
        courseName: formData.courseName,
        tuitionFee: formData.tuitionFee,
        video: formData.video,
        description: formData.description,
        entryLevel: formData.entryLevel,
        targetLevel: formData.targetLevel,
        image: formData.image,
        categoryId: Number(formData.courseCategoryId),
        studyHours: formData.studyHours,
        skillIdsToAdd: skillIdsToAdd,
        skillIdsToRemove: skillIdsToRemove,
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
      {hasOpenClasses && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Khóa học đang có lớp mở. Bạn chỉ có thể chỉnh sửa mô tả, học phí, video và ảnh bìa.
        </Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            name="category"
            label="Tên danh mục (*)"
            fullWidth
            value={formData.category || ""}
            onChange={handleChange}
            disabled={true}
          />
        </Grid>

        {/* Tên khóa học */}
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            name="courseName"
            label="Tên khóa học (*)"
            fullWidth
            value={formData.courseName || ""}
            onChange={handleChange}
            disabled={hasOpenClasses}
          />
        </Grid>

        {/* Học phí */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            name="tuitionFee"
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

        {/* Số giờ học */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            name="studyHours"
            label="Số giờ học (*)"
            type="number"
            fullWidth
            value={formData.studyHours === 0 ? "" : formData.studyHours}
            onChange={handleChange}
            onFocus={handleFocusSelect}
            InputProps={{ inputProps: { min: 20 } }}
            helperText={!hasOpenClasses ? `Tổng thời lượng modules: ${totalModuleDuration}h` : ""}
            disabled={hasOpenClasses}
          />
        </Grid>

        {/* Trạng thái - Hiển thị trạng thái hiện tại, không cho sửa ở đây */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Trạng thái hiện tại: {initialData.status ? "Đang mở" : "Đóng"}
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
            disabled={hasOpenClasses}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="targetLevel"
            label="Mục tiêu đầu ra"
            fullWidth
            value={formData.targetLevel || ""}
            onChange={handleChange}
            disabled={hasOpenClasses}
          />
        </Grid>

        {/* Skills Selection */}
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            multiple
            id="skills-tags"
            options={allSkills}
            getOptionLabel={(option) => option.skillName}
            value={selectedSkills}
            onChange={(event, newValue) => {
              setSelectedSkills(newValue);
            }}
            disabled={hasOpenClasses}
            renderTags={(value: readonly SkillResponse[], getTagProps) =>
              value.map((option: SkillResponse, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip variant="outlined" label={option.skillName} key={key} {...tagProps} />
                )
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Kỹ năng"
                placeholder="Chọn kỹ năng..."
              />
            )}
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
