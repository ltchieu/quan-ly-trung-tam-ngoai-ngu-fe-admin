// src/pages/admin/course/CreateCoursePage.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
} from "@mui/material";

import Step1CourseInfo from "../component/add_course_infor";
import Step2Curriculum from "../component/add_module_objective";
import Step3Content from "../component/add_course_content";
import { useNavigate } from "react-router-dom";
import { createNewCourse, getImageUrl } from "../services/course_service";
import InputFileUpload from "../component/button_upload_file";

export interface DocumentData {
  tenfile: string;
  link: string;
  mota: string;
  hinh: string;
}

export interface NewCourseState {
  // Bảng khoahoc
  tenkhoahoc: string;
  sogiohoc: number;
  hocphi: number;
  courseCategoryId: number | string
  video: string;
  description: string;
  entryLevel: string;
  targetLevel: string;
  image: string;

  skillIds: number[];
  skillHours: { skillId: number; hours: number }[];

  // Bảng muctieukh
  muctieu: { tenmuctieu: string }[];

  // Bảng module và các bảng con
  modules: {
    tenmodule: string;
    skillId: number;
    duration: number;
    noidung: { tennoidung: string }[];
    tailieu: DocumentData[];
  }[];
}

const CreateCoursePage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<NewCourseState>({
    tenkhoahoc: "",
    sogiohoc: 0,
    courseCategoryId: "",
    hocphi: 0,
    skillHours: [], 
    video: "",
    description: "",
    entryLevel: "",
    targetLevel: "",
    skillIds: [],
    image: "",
    muctieu: [],
    modules: [],
  });

  const isStep1Valid = useMemo(() => {
    // Kiểm tra tất cả các trường string không rỗng và số > 0
    return (
      courseData.tenkhoahoc.trim() !== "" &&
      courseData.hocphi > 0 &&
      courseData.sogiohoc > 0 &&
      courseData.description.trim() !== "" &&
      courseData.entryLevel.trim() !== "" &&
      courseData.targetLevel.trim() !== "" &&
      courseData.video.trim() !== "" &&
      courseData.image.trim() !== "" &&
       courseData.courseCategoryId !== "" &&
      courseData.skillIds.length > 0
    );
  }, [courseData]);


  const isFormInvalid = !isStep1Valid || isSubmitting;

  const handleSubmit = async () => {
    if (isFormInvalid) {
      alert("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông báo lỗi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createNewCourse(courseData);
      alert("Tạo khóa học thành công!");
      navigate("/courses");
    } catch (error) {
      console.error("Lỗi khi tạo khóa học:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploadSuccess = (fileUrl: string) => {
    setCourseData((prev) => ({
      ...prev,
      image: fileUrl,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* === CỘT BÊN TRÁI (NỘI DUNG CHÍNH) === */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* --- 1. Thông tin cơ bản --- */}
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Thông tin cơ bản" />
              <Divider />
              <CardContent>
                <Step1CourseInfo data={courseData} setData={setCourseData} />
              </CardContent>
            </Card>

            {/* --- 2. Mục tiêu khóa học --- */}
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Mục tiêu và module khóa học" />
              <Divider />
              <CardContent>
                <Step2Curriculum data={courseData} setData={setCourseData} />
              </CardContent>
            </Card>

            {/* --- 3. Nội dung & Tài liệu Modules --- */}
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Chi tiết chương trình học" />
              <Divider />
              <CardContent>
                <Step3Content data={courseData} setData={setCourseData} />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* === CỘT BÊN PHẢI (HÀNH ĐỘNG & ẢNH) === */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            sx={{
              position: "sticky",
              top: "80px",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {/* --- 4. Ảnh bìa --- */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ảnh bìa & Trạng thái
              </Typography>

              {/* Ảnh bìa */}
              <Box sx={{ mb: 2 }}>
                <InputFileUpload onUploadSuccess={handleImageUploadSuccess} />
                {courseData.image && (
                  <Box
                    component="img"
                    src={getImageUrl(courseData.image)}
                    alt="Ảnh bìa xem trước"
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      mt: 2,
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </Box>
            </CardContent>
            <Divider />

            {/* --- 5. Validation & Nút Lưu --- */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoàn tất
              </Typography>

              {/* Hiển thị lỗi validation */}
              {!isStep1Valid && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Dữ liệu chưa hợp lệ:
                  </Typography>
                  <Typography variant="caption" display="block">
                    - Vui lòng điền đủ thông tin cơ bản (Step 1), bao gồm cả Danh mục và Kỹ năng.
                  </Typography>
                </Alert>
              )}

              {/* Nút Lưu */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={isFormInvalid}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Lưu khóa học"
                )}
              </Button>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateCoursePage;
