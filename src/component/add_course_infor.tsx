import React, { useEffect, useState } from "react";
import {
  TextField,
  Grid,
  Box,
  MenuItem,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Typography,
} from "@mui/material";
import { NewCourseState } from "../pages/add_course";
import { getAllSkills } from "../services/course_service";
import { CourseCategoryResponse } from "../model/course_category_model";
import { getAllCategories } from "../services/course_category_service";
import { SkillResponse } from "../model/course_model";

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

const Step1CourseInfo: React.FC<Props> = ({ data, setData }) => {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CourseCategoryResponse[]>([]);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const allSkillIds = skills.map((s) => s.id);
  const isAllSkillsSelected =
    allSkillIds.length > 0 && data.skillIds.length === allSkillIds.length;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSkills = async () => {
      try {
        const res = await getAllSkills();
        console.log("Skill response data:", res.data);
        if (res.data) {
          setSkills(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải kỹ năng:", error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchCategories();
    fetchSkills();
  }, []);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<any>
  ) => {
    const { name, value } = event.target;

    if (name === "video") {
      const embedLink = handleLinkYoutube(value as string);

      if (embedLink != null) {
        setData((prev) => ({
          ...prev,
          [name]: embedLink || value,
        }));
        setVideoError(null);
      } else {
        setData((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (name === "skillIds") {
      const selectedValues = value as (number | string)[];

      if (selectedValues.includes("select-all")) {
        if (isAllSkillsSelected) {
          setData((prev) => ({ ...prev, skillIds: [] }));
        } else {
          setData((prev) => ({ ...prev, skillIds: allSkillIds }));
        }
      } else {
        setData((prev) => ({
          ...prev,

          skillIds: selectedValues.map((v) => Number(v)),
        }));
      }
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSkillHourChange = (skillId: number, value: string) => {
    const hours = value === "" ? 0 : Number(value);

    setData((prev) => {
      const exists = prev.skillHours?.some((item) => item.skillId === skillId);
      
      let newSkillHours;
      
      if (exists) {
        newSkillHours = prev.skillHours.map((item) =>
          item.skillId === skillId ? { ...item, hours: hours } : item
        );
      } else {
        newSkillHours = [...(prev.skillHours || []), { skillId, hours }];
      }

      return {
        ...prev,
        skillHours: newSkillHours,
      };
    });
  };

  const handleLinkYoutube = (link: string) => {
    const regex = /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);
    if (match) {
      return "https://www.youtube.com/embed/" + match[1];
    } else {
      return null;
    }
  };

  const handleVideoBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const link = event.target.value;
    if (link && !handleLinkYoutube(link)) {
      setVideoError("Link YouTube không hợp lệ. Vui lòng kiểm tra lại.");
    } else {
      setVideoError(null);
    }
  };

  const getErrorProps = (fieldName: keyof NewCourseState) => {
    let value = data[fieldName];
    if (fieldName === "skillIds") {
      return {
        error: data.skillIds.length === 0,
        helperText:
          data.skillIds.length === 0 ? "Vui lòng chọn ít nhất 1 kỹ năng" : "",
      };
    }

    if (fieldName === "sogiohoc") {
      return {
        error: (data.sogiohoc * 60) % 30 != 0,
        helperText:
          (data.sogiohoc * 60) % 30 != 0
            ? "Tổng số giờ học phải chia hết cho 30 vì mỗi buổi học ít nhất là 30 phút"
            : "",
      };
    }

    if (typeof value === "string" && value.trim() === "") {
      return { error: true, helperText: "Không được để trống" };
    }

    if (typeof value === "number" && value <= 0) {
      return { error: true, helperText: "Phải là số dương" };
    }

    if (fieldName === "courseCategoryId" && value === "") {
      return { error: true, helperText: "Vui lòng chọn danh mục" };
    }

    return { error: false, helperText: " " };
  };

  const totalSkillHours =
    data.skillHours?.reduce((sum, x) => sum + (x.hours || 0), 0) || 0;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          name="sogiohoc"
          label="Tổng số giờ học"
          type="number"
          fullWidth
          value={data.sogiohoc || ""}
          onChange={handleChange}
          {...getErrorProps("sogiohoc")}
          helperText={
            getErrorProps("sogiohoc").error
              ? getErrorProps("sogiohoc").helperText
              : "Tổng số giờ học của toàn khóa"
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          select
          required
          name="courseCategoryId"
          label="Danh mục khóa học"
          value={data.courseCategoryId}
          fullWidth
          onChange={handleChange}
          disabled={loadingCategories}
          helperText={loadingCategories ? "Đang tải danh mục..." : null}
        >
          <MenuItem value="">
            <em>Chọn danh mục</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          required
          name="tenkhoahoc"
          label="Tên khóa học"
          fullWidth
          value={data.tenkhoahoc}
          onChange={handleChange}
          {...getErrorProps("tenkhoahoc")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          name="hocphi"
          label="Học phí (VNĐ)"
          type="number"
          fullWidth
          value={data.hocphi || ""}
          onChange={handleChange}
          {...getErrorProps("hocphi")}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth required {...getErrorProps("skillIds")}>
          <InputLabel id="skill-select-label">Kỹ năng</InputLabel>
          <Select
            labelId="skill-select-label"
            name="skillIds"
            multiple
            value={data.skillIds}
            onChange={handleChange}
            input={<OutlinedInput label="Kỹ năng" />}
            renderValue={(selectedIds) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selectedIds as number[]).map((id) => {
                  const skill = skills.find((s) => s.id === id);
                  return (
                    <Chip
                      key={id}
                      label={skill?.skillName || `ID ${id}`}
                      sx={{ fontSize: 13 }}
                    />
                  );
                })}
              </Box>
            )}
            disabled={loadingSkills}
          >
            {loadingSkills && <MenuItem>Đang tải kỹ năng...</MenuItem>}
            <MenuItem key="select-all" value="select-all">
              <Checkbox checked={isAllSkillsSelected} />
              <ListItemText primary="Chọn tất cả" />
            </MenuItem>

            {skills.map((skill) => (
              <MenuItem key={skill.id} value={skill.id}>
                <Checkbox checked={data.skillIds.indexOf(skill.id) > -1} />
                <ListItemText primary={skill.skillName} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {getErrorProps("skillIds").helperText}
          </FormHelperText>
        </FormControl>
      </Grid>

      {data.skillIds.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 2, border: "1px dashed #bbb", borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Thời lượng cho từng kỹ năng
            </Typography>

            <Grid container spacing={2}>
              {data.skillIds.map((skillId) => {
                const skill = skills.find((s) => s.id === skillId);
                const hourData = data.skillHours?.find(
                  (h) => h.skillId === skillId
                );
                const hours = hourData ? hourData.hours : 0;

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={skillId}>
                    <TextField
                      type="number"
                      label={`Giờ học - ${skill?.skillName}`}
                      fullWidth
                      value={hours === 0 ? "" : hours}
                      onChange={(e) => {
                        handleSkillHourChange(skillId, e.target.value)
                      }}
                      error={hours <= 0}
                      helperText={hours <= 0 ? "Số giờ phải > 0" : ""}
                    />
                  </Grid>
                );
              })}
            </Grid>

            {/* Tổng hợp lỗi */}
            {totalSkillHours !== data.sogiohoc && (
              <Typography color="error" sx={{ mt: 1, fontWeight: 600 }}>
                {totalSkillHours < data.sogiohoc && (
                  <>
                    Bạn đã nhập <b>{totalSkillHours} giờ</b>, còn thiếu{" "}
                    <b>{data.sogiohoc - totalSkillHours} giờ</b> để đủ{" "}
                    {data.sogiohoc} giờ.
                  </>
                )}

                {totalSkillHours > data.sogiohoc && (
                  <>
                    Bạn đã nhập <b>{totalSkillHours} giờ</b>, vượt quá{" "}
                    <b>{totalSkillHours - data.sogiohoc} giờ</b> so với tổng{" "}
                    {data.sogiohoc} giờ quy định.
                  </>
                )}
              </Typography>
            )}
          </Box>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <TextField
          required
          name="description"
          label="Mô tả khóa học"
          fullWidth
          multiline
          rows={3}
          value={data.description}
          onChange={handleChange}
          {...getErrorProps("description")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          name="entryLevel"
          label="Yêu cầu đầu vào"
          fullWidth
          value={data.entryLevel}
          onChange={handleChange}
          {...getErrorProps("entryLevel")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          name="targetLevel"
          label="Mục tiêu đầu ra"
          fullWidth
          value={data.targetLevel}
          onChange={handleChange}
          {...getErrorProps("targetLevel")}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          required
          name="video"
          label="Link Video giới thiệu"
          placeholder="Dán link youtube của bạn vào đây"
          fullWidth
          value={data.video}
          onChange={handleChange}
          onBlur={handleVideoBlur}
          error={!!videoError || getErrorProps("video").error}
          helperText={videoError || getErrorProps("video").helperText}
        />
      </Grid>
    </Grid>
  );
};

export default Step1CourseInfo;
