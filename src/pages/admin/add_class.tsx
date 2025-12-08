import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Container,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CourseFilterData } from "../../model/class_model";
import { createClass, getCourseFilterList } from "../../services/class_service";
import { checkAndSuggestSchedule } from "../../services/schedule_service";
import {
  ScheduleSuggestionResponse,
  ScheduleAlternative,
  ResourceInfo,
  ScheduleCheckRequest,
} from "../../model/schedule_model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faExclamationTriangle,
  faBan,
  faChalkboardTeacher,
  faBook,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router-dom";

const DAY_OPTIONS = [
  { label: "T2", value: "2" },
  { label: "T3", value: "3" },
  { label: "T4", value: "4" },
  { label: "T5", value: "5" },
  { label: "T6", value: "6" },
  { label: "T7", value: "7" },
  { label: "CN", value: "1" },
];

const suggestDuration = (sessionsPerWeek: number) => {
  switch (sessionsPerWeek) {
    case 1:
      return 120;
    case 2:
    case 3:
      return 90;
    case 4:
      return 60;
    default:
      return 30; // 5-6 buổi
  }
};

const countSessionsPerWeek = (pattern: string) =>
  pattern ? pattern.split("-").filter(Boolean).length : 0;

// --- Lấy mã thứ từ ngày ---
const getDayValueFromDate = (dateString: string): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const day = date.getDay();
  return day === 0 ? "1" : String(day + 1);
};

// --- Lấy tên hiển thị của thứ ---
const getDayLabelFromValue = (val: string) => {
  const option = DAY_OPTIONS.find((o) => o.value === val);
  return option ? option.label : val;
};

const getSessionCode = (timeString: string): string => {
  if (!timeString) return "";
  const hour = parseInt(timeString.split(":")[0], 10);

  if (hour < 12) return "S";
  if (hour < 18) return "C";
  return "T";
};

const formatMonthYear = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${year}`;
  } catch (e) {
    return "";
  }
};

const AddClassPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseFilterData[]>([]);

  // State cho tính năng gợi ý
  const [isChecking, setIsChecking] = useState(false);
  const [suggestionResult, setSuggestionResult] =
    useState<ScheduleSuggestionResponse | null>(null);

  // Danh sách phòng/GV khả dụng
  const [availableRooms, setAvailableRooms] = useState<ResourceInfo[]>([]);
  const [availableLecturers, setAvailableLecturers] = useState<
    ResourceInfo[]
  >([]);

  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [durationSuggestion, setDurationSuggestion] = useState<number | null>(
    null
  );

  useEffect(() => {
    const loadCourses = async () => {
      const res = await getCourseFilterList();
      setCourses(res);
    };
    loadCourses();
  }, []);

  const formik = useFormik({
    initialValues: {
      courseId: "",
      className: "",
      startDate: "",
      startTime: "07:00",
      durationMinutes: 90,
      schedulePattern: "2-4-6",
      roomId: "",
      lecturerId: "",
    },
    validationSchema: Yup.object({
      courseId: Yup.string().required("Bắt buộc chọn khóa học"),
      className: Yup.string().required("Bắt buộc nhập tên lớp"),
      startDate: Yup.string().required("Bắt buộc chọn ngày bắt đầu"),
      schedulePattern: Yup.string()
        .required("Bắt buộc chọn lịch học")
        .test(
          "match-start-date",
          "Ngày bắt đầu không khớp với lịch học đã chọn",
          function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;

            const startDayVal = getDayValueFromDate(startDate);
            const selectedDays = value.split("-");

            if (startDayVal && !selectedDays.includes(startDayVal)) {
              const dayLabel = getDayLabelFromValue(startDayVal);
              return this.createError({
                message: `Ngày bắt đầu (${startDate}) là ${dayLabel}, nhưng lịch học chưa chọn ${dayLabel}.`,
              });
            }
            return true;
          }
        ),
      durationMinutes: Yup.number()
        .typeError("Số phút phải là số")
        .required("Vui lòng nhập số phút mỗi buổi")
        .integer("Số phút phải là số nguyên")
        .min(30, "Mỗi buổi phải ít nhất 30 phút")
        .test(
          "divisible-by-30",
          "Số phút phải chia hết cho 30",
          (value) => value !== undefined && value % 30 === 0
        ),
      roomId: Yup.string().required("Bắt buộc chọn phòng"),
      lecturerId: Yup.string().required("Bắt buộc chọn giảng viên"),
    }),
    onSubmit: async (values) => {
      setIsCreating(true);
      try {
        const requestData = {
          courseId: values.courseId,
          className: values.className,
          lecturerId: values.lecturerId,
          roomId: values.roomId,
          schedule: values.schedulePattern,
          startTime: values.startTime,
          minutesPerSession: values.durationMinutes,
          startDate: values.startDate,
        };

        await createClass(requestData);
        setSuccessMessage(
          "Tạo lớp học thành công! Đang chuyển hướng..."
        );
        setTimeout(() => {
          navigate("/class");
        }, 1500);
      } catch (error: any) {
        console.error("Lỗi khi tạo lớp:", error);
        alert(error.message || "Có lỗi xảy ra khi tạo lớp học.");
        setIsCreating(false);
      }
    },
  });

  const {
    values,
    setFieldValue,
    errors,
    touched,
    setFieldTouched,
    validateField,
  } = formik;

  useEffect(() => {
    const { courseId, startDate, startTime, schedulePattern } = values;

    if (courseId && startDate && startTime) {
      // 1. Lấy tên khóa học
      const selectedCourse = courses.find(
        (c) => c.courseId === Number(courseId)
      );

      if (selectedCourse) {
        const cleanCourseName = selectedCourse.courseName.replace(
          /^Khóa\s+/i,
          ""
        );

        const timeStr = formatMonthYear(startDate);

        const sessionCode = getSessionCode(startTime);

        const newClassName = `Lớp ${cleanCourseName} - ${timeStr} - ${sessionCode}`;

        setFieldValue("className", newClassName);
      }
    }

    if (startDate) {
      const dayVal = getDayValueFromDate(startDate);
      if (dayVal) {
        const currentDays = schedulePattern
          ? schedulePattern.split("-").filter(Boolean)
          : [];
        if (!currentDays.includes(dayVal)) {
          const newDays = [...currentDays, dayVal];
          // Sắp xếp lại để pattern chuẩn (VD: 2-4-6)
          const sortedPattern = DAY_OPTIONS.map((opt) => opt.value)
            .filter((val) => newDays.includes(val))
            .join("-");

          setFieldValue("schedulePattern", sortedPattern, true);
          setFieldTouched("schedulePattern", true, false);

          // Reset trạng thái check vì pattern thay đổi
          setAvailableRooms([]);
          setAvailableLecturers([]);
          setSuggestionResult(null);
        } else {
          // Nếu ngày bắt đầu thay đổi nhưng pattern đã khớp, vẫn cần validate lại để đảm bảo không còn lỗi cũ
          validateField("schedulePattern");
        }
      }
    }
  }, [
    values.courseId,
    values.startDate,
    values.startTime,
    courses,
    setFieldValue,
    validateField,
  ]);

  // Khi user đổi ngày/giờ bằng tay -> Reset danh sách gợi ý cũ để tránh sai lệch
  const handleManualChange = (e: React.ChangeEvent<any>) => {
    formik.handleChange(e);

    if (e.target.name === "startDate") {
      setTimeout(() => {
        formik.validateField("schedulePattern");
        formik.setFieldTouched("schedulePattern", true, true);
      }, 0);
    }

    // Nếu thay đổi các trường ảnh hưởng lịch, clear danh sách available cũ
    if (
      ["startDate", "startTime", "schedulePattern", "durationMinutes"].includes(
        e.target.name
      )
    ) {
      setAvailableRooms([]);
      setAvailableLecturers([]);
      setSuggestionResult(null);
      //clear phòng/GV đã chọn
      formik.setFieldValue("roomId", "");
      formik.setFieldValue("lecturerId", "");
    }
  };

  const handleDayChange = (dayValue: string, isChecked: boolean) => {
    // Lấy mảng các ngày hiện tại từ chuỗi pattern
    let currentDays = formik.values.schedulePattern
      ? formik.values.schedulePattern.split("-").filter(Boolean)
      : [];

    // Cập nhật mảng dựa trên thao tác check/uncheck
    if (isChecked) {
      if (!currentDays.includes(dayValue)) currentDays.push(dayValue);
    } else {
      currentDays = currentDays.filter((d) => d !== dayValue);
    }

    // Sắp xếp lại theo đúng thứ tự trong DAY_OPTIONS (T2 -> CN)
    const sortedPattern = DAY_OPTIONS.map((opt) => opt.value)
      .filter((val) => currentDays.includes(val))
      .join("-");

    // Cập nhật Formik
    formik.setFieldValue("schedulePattern", sortedPattern, true);
    formik.setFieldTouched("schedulePattern", true, true);

    setTimeout(() => {
      formik.validateField("schedulePattern");
    }, 0);

    // Reset trạng thái gợi ý/phòng/gv
    setAvailableRooms([]);
    setAvailableLecturers([]);
    setSuggestionResult(null);
    formik.setFieldValue("roomId", "");
    formik.setFieldValue("lecturerId", "");
  };

  // Gợi ý tự động khi schedulePattern thay đổi
  useEffect(() => {
    const sessions = countSessionsPerWeek(formik.values.schedulePattern);

    if (sessions > 0) {
      const suggested = suggestDuration(sessions);
      setDurationSuggestion(suggested);
    } else {
      setDurationSuggestion(null);
    }
  }, [formik.values.schedulePattern]);

  //Apply gợi ý
  const applyDurationSuggestion = () => {
    if (durationSuggestion) {
      formik.setFieldValue("durationMinutes", durationSuggestion, true);
      formik.setFieldTouched("durationMinutes", true, true);
    }
  };

  // --- LOGIC CHÍNH: KIỂM TRA VÀ GỢI Ý ---
  const handleCheckSchedule = async () => {
    const {
      courseId,
      startDate,
      startTime,
      durationMinutes,
      schedulePattern,
      roomId,
      lecturerId, // Lấy thêm roomId và lecturerId hiện tại
    } = formik.values;

    if (!courseId || !startDate || !startTime) {
      alert(
        "Vui lòng nhập đầy đủ thông tin khóa học và thời gian trước khi kiểm tra."
      );
      return;
    }

    if (errors.schedulePattern) {
      return;
    }

    setIsChecking(true);
    setSuggestionResult(null);

    try {
      //Tạo request object
      const request: ScheduleCheckRequest = {
        courseId: Number(courseId),
        startDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        schedulePattern,
        preferredRoomId: roomId ? Number(roomId) : null,
        preferredLecturerId: lecturerId ? Number(lecturerId) : null,
      };

      //Gọi API
      const result = await checkAndSuggestSchedule(request);
      setSuggestionResult(result);
      
      if (result.status === "AVAILABLE") {
        // Nếu Available: Cập nhật danh sách chọn
        setAvailableRooms(result.availableRooms || []);
        setAvailableLecturers(result.availableLecturers || []);
      } else {
        // Nếu Conflict: Xóa danh sách chọn để user phải xem gợi ý hoặc chọn lại
        setAvailableRooms([]);
        setAvailableLecturers([]);

        //clear lựa chọn hiện tại vì nó gây conflict
        formik.setFieldValue("roomId", "");
        formik.setFieldValue("lecturerId", "");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra lịch:", error);
      alert("Lỗi kết nối đến server kiểm tra lịch.");
    } finally {
      setIsChecking(false);
    }
  };

  // --- LOGIC CHÍNH: ÁP DỤNG GỢI Ý ---
  const applyAlternative = (alt: ScheduleAlternative) => {
    //Cập nhật form với thông tin thời gian mới
    formik.setFieldValue("startDate", alt.startDate);
    formik.setFieldValue("startTime", alt.startTime);
    formik.setFieldValue("schedulePattern", alt.schedulePattern);

    // Cập nhật ngay danh sách Resource từ Alternative
    setAvailableRooms(alt.availableRooms || []);
    setAvailableLecturers(alt.availableLecturers || []);

    //Reset lựa chọn phòng/GV cũ (vì đã đổi giờ, phòng cũ chưa chắc rảnh)
    formik.setFieldValue("roomId", "");
    formik.setFieldValue("lecturerId", "");

    setSuggestionResult(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="/class">
          Lớp học
        </Link>
        <Typography color="text.primary">Tạo lớp mới</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate('/class')}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tạo Lớp Học Mới
        </Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* --- 1. THÔNG TIN CƠ BẢN --- */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Khóa học"
                  name="courseId"
                  value={formik.values.courseId}
                  onChange={handleManualChange}
                  error={
                    formik.touched.courseId && Boolean(formik.errors.courseId)
                  }
                  helperText={formik.touched.courseId && formik.errors.courseId}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={
                    formik.values.startDate
                      ? dayjs(formik.values.startDate)
                      : null
                  }
                  minDate={dayjs().add(1, "day")}
                  onChange={(newValue) => {
                    formik.setFieldValue(
                      "startDate",
                      newValue ? newValue.format("YYYY-MM-DD") : ""
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: "startDate",
                      error:
                        formik.touched.startDate &&
                        Boolean(formik.errors.startDate),
                      helperText:
                        formik.touched.startDate && formik.errors.startDate,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TimePicker
                  label="Giờ học"
                  value={
                    formik.values.startTime
                      ? dayjs(formik.values.startTime, "HH:mm")
                      : null
                  }
                  onChange={(newValue) => {
                    const timeString = newValue ? newValue.format("HH:mm") : "";
                    formik.setFieldValue("startTime", timeString);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: "startTime",
                      error:
                        formik.touched.startTime &&
                        Boolean(formik.errors.startTime),
                      helperText:
                        formik.touched.startTime && formik.errors.startTime,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Số phút học mỗi buổi"
                  InputLabelProps={{ shrink: true }}
                  name="durationMinutes"
                  value={formik.values.durationMinutes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.durationMinutes &&
                    Boolean(formik.errors.durationMinutes)
                  }
                  helperText={
                    formik.touched.durationMinutes &&
                    formik.errors.durationMinutes
                  }
                />

                {durationSuggestion && (
                  <Box
                    onClick={applyDurationSuggestion}
                    sx={{
                      mt: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      display: "inline-block",
                      cursor: "pointer",
                      bgcolor: "yellow.100",
                      color: "grey.800",
                      fontSize: "0.85rem",
                      transition: "0.2s",
                      "&:hover": {
                        bgcolor: "yellow.200",
                        boxShadow: 1,
                      },
                      "&:active": {
                        bgcolor: "yellow.300",
                      },
                    }}
                  >
                    Gợi ý: <b>{durationSuggestion} phút</b> mỗi buổi (dựa trên{" "}
                    {countSessionsPerWeek(formik.values.schedulePattern)}{" "}
                    buổi/tuần)
                    <Box
                      component="span"
                      sx={{ ml: 1, fontWeight: 600, color: "blue" }}
                    >
                      Nhấn để áp dụng
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  disabled
                  label="Tên lớp (Tự động tạo)"
                  name="className"
                  value={values.className}
                  error={
                    formik.touched.className && Boolean(formik.errors.className)
                  }
                  helperText={
                    formik.touched.className && formik.errors.className
                  }
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                      color: "rgba(0, 0, 0, 0.87)",
                      fontWeight: 500,
                    },
                    "& .MuiInputLabel-root.Mui-disabled": {
                      color: "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiOutlinedInput-root.Mui-disabled": {
                      backgroundColor: "#f5f5f5",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23) !important",
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl
                  component="fieldset"
                  variant="standard"
                  error={
                    touched.schedulePattern && Boolean(errors.schedulePattern)
                  }
                >
                  <FormLabel component="legend">Lịch học trong tuần</FormLabel>
                  <FormGroup row>
                    {DAY_OPTIONS.map((day) => {
                      const isChecked = formik.values.schedulePattern
                        ? formik.values.schedulePattern
                            .split("-")
                            .includes(day.value)
                        : false;

                      return (
                        <FormControlLabel
                          key={day.value}
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) =>
                                handleDayChange(day.value, e.target.checked)
                              }
                              name={day.value}
                            />
                          }
                          label={day.label}
                        />
                      );
                    })}
                  </FormGroup>
                  {/* Hiển thị lỗi nếu chưa chọn ngày nào */}
                  {touched.schedulePattern && errors.schedulePattern && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ ml: 1.5, mt: 0.5, fontWeight: "medium" }}
                    >
                      <FontAwesomeIcon
                        icon={faCalendar}
                        style={{ marginRight: 4 }}
                      />
                      {errors.schedulePattern}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* --- BUTTON CHECK --- */}
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={handleCheckSchedule}
                    disabled={isChecking}
                    startIcon={isChecking && <CircularProgress size={20} />}
                  >
                    {/* Đổi text nút dựa trên trạng thái */}
                    {suggestionResult?.status === "AVAILABLE"
                      ? "Kiểm tra lại"
                      : "Kiểm tra lịch & Tìm phòng"}
                  </Button>

                  {/* Hiển thị trạng thái nhanh */}
                  {suggestionResult?.status === "AVAILABLE" && (
                    <Chip
                      label="Lịch khả dụng"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Grid>

              {/* --- HIỂN THỊ KẾT QUẢ GỢI Ý (NẾU CONFLICT) --- */}
              {suggestionResult && suggestionResult.status === "CONFLICT" && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Phát hiện xung đột lịch học
                    </AlertTitle>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {suggestionResult.message}
                    </Typography>

                    {/* Tóm tắt tình trạng */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mb: 2, 
                      p: 1.5, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      borderRadius: 1 
                    }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phòng khả dụng:</Typography>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {suggestionResult.initialCheck.availableRoomCount}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Giảng viên khả dụng:</Typography>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {suggestionResult.initialCheck.availableLecturerCount}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Chi tiết xung đột phòng */}
                    {suggestionResult.initialCheck.roomConflicts && 
                     suggestionResult.initialCheck.roomConflicts.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="error.dark" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FontAwesomeIcon icon={faBan} /> Xung đột phòng học:
                        </Typography>
                        <Stack spacing={1}>
                          {suggestionResult.initialCheck.roomConflicts.map((conflict, idx) => (
                            <Paper 
                              key={`room-${idx}`} 
                              elevation={0}
                              sx={{ 
                                p: 1.5, 
                                bgcolor: 'error.lighter',
                                border: '1px solid',
                                borderColor: 'error.light',
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                {conflict.description}
                              </Typography>
                              {conflict.conflictingClassName && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FontAwesomeIcon icon={faBook} /> Lớp: <strong>{conflict.conflictingClassName}</strong>
                                  {conflict.conflictingCourseName && ` - ${conflict.conflictingCourseName}`}
                                </Typography>
                              )}
                              {conflict.conflictDate && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FontAwesomeIcon icon={faCalendar} /> {dayjs(conflict.conflictDate).format('DD/MM/YYYY')}
                                  {conflict.conflictStartTime && conflict.conflictEndTime && (
                                    <>
                                      <FontAwesomeIcon icon={faClock} style={{ marginLeft: '8px' }} />
                                      {` ${conflict.conflictStartTime} - ${conflict.conflictEndTime}`}
                                    </>
                                  )}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Chi tiết xung đột giảng viên */}
                    {suggestionResult.initialCheck.lecturerConflicts && 
                     suggestionResult.initialCheck.lecturerConflicts.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="warning.dark" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FontAwesomeIcon icon={faChalkboardTeacher} /> Xung đột giảng viên:
                        </Typography>
                        <Stack spacing={1}>
                          {suggestionResult.initialCheck.lecturerConflicts.map((conflict, idx) => (
                            <Paper 
                              key={`lecturer-${idx}`} 
                              elevation={0}
                              sx={{ 
                                p: 1.5, 
                                bgcolor: 'warning.lighter',
                                border: '1px solid',
                                borderColor: 'warning.light',
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                {conflict.description}
                              </Typography>
                              {conflict.conflictingClassName && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FontAwesomeIcon icon={faBook} /> Lớp: <strong>{conflict.conflictingClassName}</strong>
                                  {conflict.conflictingCourseName && ` - ${conflict.conflictingCourseName}`}
                                </Typography>
                              )}
                              {conflict.conflictDate && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FontAwesomeIcon icon={faCalendar} /> {dayjs(conflict.conflictDate).format('DD/MM/YYYY')}
                                  {conflict.conflictStartTime && conflict.conflictEndTime && (
                                    <>
                                      <FontAwesomeIcon icon={faClock} style={{ marginLeft: '8px' }} />
                                      {` ${conflict.conflictStartTime} - ${conflict.conflictEndTime}`}
                                    </>
                                  )}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Alert>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Gợi ý thay thế (Nhấn để áp dụng):
                  </Typography>
                  <Stack spacing={1} maxHeight={200} overflow="auto">
                    {suggestionResult.alternatives?.map((alt, index) => (
                      <Card
                        key={index}
                        variant="outlined"
                        sx={{
                          // Thêm minHeight để tránh bị bẹp khi không có text
                          minHeight: "80px",
                          borderColor:
                            alt.priority > 100 ? "success.main" : "grey.300",
                          bgcolor:
                            alt.priority > 100 ? "#f0fdf4" : "background.paper",
                          borderWidth: alt.priority > 100 ? 2 : 1,
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => applyAlternative(alt)}
                          sx={{ height: "100%" }}
                        >
                          <CardContent
                            sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                          >
                            <Grid container spacing={1} alignItems="center">
                              {/* Cột 1: Loại thay thế & Lý do */}
                              <Grid size={{ xs: 12, sm: 9 }}>
                                <Stack direction="column" spacing={0.5}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Chip
                                      // Xử lý hiển thị text an toàn hơn
                                      label={
                                        alt.type
                                          ? alt.type.replace("ALTERNATIVE_", "")
                                          : "GỢI Ý"
                                      }
                                      size="small"
                                      color={
                                        alt.priority > 100
                                          ? "success"
                                          : "primary"
                                      }
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.7rem",
                                        height: 20,
                                      }}
                                    />
                                    {alt.priority > 100 && (
                                      <Chip
                                        label="Ưu tiên"
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: "0.65rem" }}
                                      />
                                    )}
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{ lineHeight: 1.3 }}
                                  >
                                    {alt.reason ||
                                      "Phương án thay thế khả dụng"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <span>
                                      <FontAwesomeIcon icon={faCalendar} />{" "}
                                      {alt.startDate}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      <FontAwesomeIcon icon={faClock} />{" "}
                                      {alt.startTime} - {alt.endTime}
                                    </span>
                                  </Typography>
                                </Stack>
                              </Grid>

                              {/* Cột 2: Nút hành động / Pattern */}
                              <Grid
                                size={{ xs: 12, sm: 3 }}
                                sx={{ textAlign: "right" }}
                              >
                                <Typography
                                  variant="caption"
                                  display="block"
                                  fontWeight="bold"
                                  color="primary.main"
                                  sx={{ mb: 0.5 }}
                                >
                                  {alt.schedulePattern}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  sx={{
                                    fontSize: "0.7rem",
                                    py: 0.5,
                                    minWidth: "60px",
                                  }}
                                >
                                  Chọn
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Stack>
                </Grid>
              )}

              {/* --- 2. CHỌN PHÒNG & GIẢNG VIÊN (Chỉ hiện khi có list) --- */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Phân công</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Phòng học"
                  name="roomId"
                  value={formik.values.roomId}
                  onChange={formik.handleChange}
                  disabled={availableRooms.length === 0}
                  helperText={
                    availableRooms.length === 0
                      ? "Vui lòng kiểm tra lịch hợp lệ để chọn phòng"
                      : ""
                  }
                  error={formik.touched.roomId && Boolean(formik.errors.roomId)}
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Giảng viên"
                  name="lecturerId"
                  value={formik.values.lecturerId}
                  onChange={formik.handleChange}
                  disabled={availableLecturers.length === 0}
                  helperText={
                    availableLecturers.length === 0
                      ? "Vui lòng kiểm tra lịch hợp lệ để chọn GV"
                      : ""
                  }
                  error={
                    formik.touched.lecturerId &&
                    Boolean(formik.errors.lecturerId)
                  }
                >
                  {availableLecturers.map((lec) => (
                    <MenuItem key={lec.id} value={lec.id}>
                      {lec.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={() => navigate('/class')}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() => formik.handleSubmit()}
                  variant="contained"
                  size="large"
                  // Disable nếu form lỗi HOẶC chưa chọn phòng/GV (tức là chưa check xong)
                  disabled={
                    !formik.isValid ||
                    availableRooms.length === 0 ||
                    !formik.values.roomId ||
                    !formik.values.lecturerId ||
                    isCreating
                  }
                  startIcon={
                    isCreating && <CircularProgress size={20} color="inherit" />
                  }
                >
                  {isCreating ? "Đang tạo..." : "Tạo Lớp Học"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </LocalizationProvider>
    </Container>
  );
};

export default AddClassPage;
