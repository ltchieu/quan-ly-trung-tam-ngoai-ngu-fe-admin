// src/pages/admin/course/CreateCoursePage.tsx
import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button, Typography, Container, Paper } from '@mui/material';

import Step1CourseInfo from '../component/add_course_infor';
import Step2Curriculum from '../component/add_module_objective';
import Step3Content from '../component/add_course_content';


// Định nghĩa cấu trúc dữ liệu cho toàn bộ khóa học
export interface NewCourseState {
  // Bảng khoahoc
  tenkhoahoc: string;
  sogiohoc: number;
  hocphi: number;
  sobuoihoc: number;
  video: string;
  trangthai: string;

  // Bảng muctieukh
  muctieu: { tenmuctieu: string }[];

  // Bảng module và các bảng con
  modules: {
    tenmodule: string;
    thoiluong: number;
    noidung: { tennoidung: string }[];
    tailieu: { tenfile: string; link: string; mota: string; hinh: File | null }[];
  }[];
}

const steps = ['Thông tin cơ bản', 'Mục tiêu & Chương trình', 'Nội dung chi tiết'];

const CreateCoursePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  // Khởi tạo state với các giá trị mặc định
  const [courseData, setCourseData] = useState<NewCourseState>({
    tenkhoahoc: '',
    sogiohoc: 0,
    hocphi: 0,
    sobuoihoc: 0,
    video: '',
    trangthai: 'Bản nháp',
    muctieu: [],
    modules: [],
  });

  const handleNext = () => {
    // Trong thực tế, bạn sẽ có logic validate ở đây trước khi next
    if (activeStep === steps.length - 1) {
      // Logic gửi dữ liệu đi khi nhấn "Hoàn tất"
      console.log('Dữ liệu khóa học hoàn chỉnh:', courseData);
      alert('Đã tạo khóa học thành công!');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1CourseInfo data={courseData} setData={setCourseData} />;
      case 1:
        return <Step2Curriculum data={courseData} setData={setCourseData} />;
      case 2:
        return <Step3Content data={courseData} setData={setCourseData} />;
      default:
        return <Typography>Đã hoàn thành!</Typography>;
    }
  };

  return (
    <Container component={Paper} sx={{ p: 4, mt: 4, borderRadius: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Khóa Học Mới
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>{renderStepContent(activeStep)}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Quay lại
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateCoursePage;