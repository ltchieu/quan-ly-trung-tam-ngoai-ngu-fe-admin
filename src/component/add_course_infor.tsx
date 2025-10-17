// src/pages/admin/course/Step1_CourseInfo.tsx
import React from "react";
import { TextField, Grid, MenuItem, Typography } from "@mui/material";
import { NewCourseState } from "../pages/add_course";

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

const Step1CourseInfo: React.FC<Props> = ({ data, setData }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Thông tin chung
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            name="tenkhoahoc"
            label="Tên khóa học"
            fullWidth
            value={data.tenkhoahoc}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 , sm: 6}}>
          <TextField
            required
            name="hocphi"
            label="Học phí (VNĐ)"
            type="number"
            fullWidth
            value={data.hocphi}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 , sm: 6}}>
          <TextField
            required
            name="sobuoihoc"
            label="Số buổi học"
            type="number"
            fullWidth
            value={data.sobuoihoc}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 , sm: 6}}>
          <TextField
            name="sogiohoc"
            label="Số giờ học"
            type="number"
            fullWidth
            value={data.sogiohoc}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 , sm: 6}}>
          <TextField
            select
            name="trangthai"
            label="Trạng thái"
            fullWidth
            value={data.trangthai}
            onChange={handleChange}
          >
            <MenuItem value="Bản nháp">Bản nháp</MenuItem>
            <MenuItem value="Công khai">Công khai</MenuItem>
            <MenuItem value="Sắp ra mắt">Sắp ra mắt</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            name="video"
            label="Link Video giới thiệu"
            fullWidth
            value={data.video}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Step1CourseInfo;
