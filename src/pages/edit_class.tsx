import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
// Sử dụng Grid v2
import { Grid } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClock } from "@fortawesome/free-solid-svg-icons";

import {
  getClassDetail,
  updateClass,
  getLecturerFilterList,
  getRoomFilterList,
} from "../services/class_service";
import { checkAndSuggestSchedule } from "../services/schedule_service";
import {
  ScheduleCheckRequest,
  ScheduleSuggestionResponse,
  ResourceOption,
  ScheduleAlternative,
} from "../model/schedule_model";
import { ClassDetailResponse } from "../model/class_model";

// --- CÁC HÀM HELPER ---
const DAY_OPTIONS = [
  { label: "T2", value: "2" },
  { label: "T3", value: "3" },
  { label: "T4", value: "4" },
  { label: "T5", value: "5" },
  { label: "T6", value: "6" },
  { label: "T7", value: "7" },
  { label: "CN", value: "1" },
];

// Helper lấy thứ chính xác bằng dayjs
const getDayValueFromDate = (dateString: string): string | null => {
  if (!dateString) return null;
  const d = dayjs(dateString);
  if (!d.isValid()) return null;
  const dayIndex = d.day();
  return dayIndex === 0 ? "1" : String(dayIndex + 1);
};

const getDayLabelFromValue = (val: string) => {
  const option = DAY_OPTIONS.find((o) => o.value === val);
  return option ? option.label : val;
};

const calculateEndTime = (startTimeStr: string, durationMinutes: number) => {
  if (!startTimeStr || !durationMinutes) return "";
  return dayjs(`2000-01-01T${startTimeStr}`)
    .add(durationMinutes, "minute")
    .format("HH:mm");
};

const EditClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State dữ liệu
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(
    null
  );
  const [initialFormValues, setInitialFormValues] = useState<any>(null);

  // State logic gợi ý
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestionResult, setSuggestionResult] =
    useState<ScheduleSuggestionResponse | null>(null);

  // Danh sách Resource
  const [availableRooms, setAvailableRooms] = useState<ResourceOption[]>([]);
  const [availableLecturers, setAvailableLecturers] = useState<
    ResourceOption[]
  >([]);

  // --- FORMIK SETUP ---
  const formik = useFormik({
    initialValues: {
      courseId: "",
      courseName: "",
      className: "",
      startDate: "",
      startTime: "",
      durationMinutes: 0,
      schedulePattern: "",
      roomId: "",
      lecturerId: "",
    },
    validationSchema: Yup.object({
      startDate: Yup.string().required("Bắt buộc chọn ngày bắt đầu"),
      schedulePattern: Yup.string()
        .required("Bắt buộc chọn lịch học")
        .test(
          "match-start-date",
          "Ngày bắt đầu không khớp với lịch học",
          function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;

            const startDayVal = getDayValueFromDate(startDate);
            const selectedDays = value.split("-");

            if (startDayVal && !selectedDays.includes(startDayVal)) {
              const dayLabel = getDayLabelFromValue(startDayVal);
              return this.createError({
                message: `Ngày bắt đầu (${dayjs(startDate).format(
                  "DD/MM/YYYY"
                )}) là ${dayLabel}, vui lòng tích chọn ${dayLabel} trong lịch học.`,
              });
            }
            return true;
          }
        ),
      durationMinutes: Yup.number()
        .required("Nhập thời lượng")
        .min(30, "Tối thiểu 30 phút")
        .test(
          "div-30",
          "Phải chia hết cho 30",
          (val) => val !== undefined && val % 30 === 0
        ),
      roomId: Yup.string().required("Bắt buộc chọn phòng"),
      lecturerId: Yup.string().required("Bắt buộc chọn giảng viên"),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      setIsSaving(true);
      try {
        const requestData = {
          courseId: Number(values.courseId),
          className: values.className,
          lecturerId: Number(values.lecturerId),
          roomId: Number(values.roomId),
          schedule: values.schedulePattern,
          startTime: values.startTime,
          startDate: values.startDate,
          minutesPerSession: Number(values.durationMinutes),
        };

        await updateClass(id, requestData);
        alert("Cập nhật lớp học thành công!");
        navigate(-1);
      } catch (error: any) {
        console.error("Update error:", error);
        alert(
          "Lỗi khi cập nhật: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsSaving(false);
      }
    },
  });

  const calculatedEndTime = useMemo(() => {
    return calculateEndTime(
      formik.values.startTime,
      formik.values.durationMinutes
    );
  }, [formik.values.startTime, formik.values.durationMinutes]);

  const isFormChanged = useMemo(() => {
    if (!initialFormValues) return false;
    const {
      startDate,
      startTime,
      durationMinutes,
      schedulePattern,
      roomId,
      lecturerId,
    } = formik.values;
    return (
      startDate !== initialFormValues.startDate ||
      startTime !== initialFormValues.startTime ||
      durationMinutes !== initialFormValues.durationMinutes ||
      schedulePattern !== initialFormValues.schedulePattern ||
      String(roomId) !== String(initialFormValues.roomId) ||
      String(lecturerId) !== String(initialFormValues.lecturerId)
    );
  }, [formik.values, initialFormValues]);

  // --- 1. LOAD DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoadingData(true);
      try {
        const [data, allLecturers, allRooms] = await Promise.all([
          getClassDetail(id),
          getLecturerFilterList(),
          getRoomFilterList(),
        ]);

        setClassDetail(data);
        console.log(data);

        const currentRoomObj = allRooms.find(
          (r) => r.roomName === data.roomName
        );
        const currentLecturerObj = allLecturers.find(
          (l) => l.lecturerName === data.instructorName
        );
        const currentRoomId = currentRoomObj
          ? String(currentRoomObj.roomId)
          : "";
        const currentLecturerId = currentLecturerObj
          ? String(currentLecturerObj.lecturerId)
          : "";

        const initialValues = {
          courseId: "0",
          courseName: data.courseName,
          className: data.className,
          startDate: data.startDate,
          startTime: data.startTime.substring(0, 5),
          durationMinutes: data.minutePerSession || 0,
          schedulePattern: data.schedulePattern,
          roomId: currentRoomId,
          lecturerId: currentLecturerId,
        };

        formik.setValues(initialValues);
        setInitialFormValues(initialValues);

        setAvailableRooms(
          allRooms.map((r) => ({ id: r.roomId, name: r.roomName }))
        );
        setAvailableLecturers(
          allLecturers.map((l) => ({ id: l.lecturerId, name: l.lecturerName }))
        );
      } catch (error) {
        console.error("Load data error", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  // --- 2. HANDLERS ---

  const handleManualChange = (e: React.ChangeEvent<any>) => {
    formik.handleChange(e);
    // FIX: Không clear phòng/GV khi đổi lịch. Chỉ clear kết quả gợi ý cũ.
    if (["startDate", "startTime", "durationMinutes"].includes(e.target.name)) {
      setSuggestionResult(null);
      if (e.target.name === "startDate") {
        setTimeout(() => formik.validateField("schedulePattern"), 0);
      }
    }
  };

  const handleDayChange = (dayValue: string, isChecked: boolean) => {
    let currentDays = formik.values.schedulePattern
      ? formik.values.schedulePattern.split("-").filter(Boolean)
      : [];
    if (isChecked) {
      if (!currentDays.includes(dayValue)) currentDays.push(dayValue);
    } else {
      currentDays = currentDays.filter((d) => d !== dayValue);
    }

    const sortedPattern = DAY_OPTIONS.map((opt) => opt.value)
      .filter((val) => currentDays.includes(val))
      .join("-");
    formik.setFieldValue("schedulePattern", sortedPattern);

    setSuggestionResult(null);
    // FIX: Trigger validate ngay lập tức
    setTimeout(() => {
      formik.validateField("schedulePattern");
    }, 0);
  };

  // --- 3. CHECK SCHEDULE ---
  const handleCheckSchedule = async () => {
    const {
      courseId,
      startDate,
      startTime,
      durationMinutes,
      schedulePattern,
      roomId,
      lecturerId,
    } = formik.values;
    if (!startDate || !startTime || !schedulePattern) {
      alert("Vui lòng nhập đầy đủ thông tin thời gian.");
      return;
    }
    setIsChecking(true);
    setSuggestionResult(null);

    try {
      const request: ScheduleCheckRequest = {
        courseId: Number(courseId),
        startDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        schedulePattern,
        preferredRoomId: roomId ? Number(roomId) : null,
        preferredLecturerId: lecturerId ? Number(lecturerId) : null,
      };

      const result = await checkAndSuggestSchedule(request);
      setSuggestionResult(result);

      // Nếu Available -> Update list Available mới nhất từ API (chứa các phòng rảnh trong khung giờ mới)
      if (result.status === "AVAILABLE") {
        setAvailableRooms(result.availableRooms);
        setAvailableLecturers(result.availableLecturers);

        // Check xem phòng/gv đang chọn có còn valid không
        const isRoomOk = result.availableRooms.some(
          (r) => String(r.id) === String(roomId)
        );
        const isLecOk = result.availableLecturers.some(
          (l) => String(l.id) === String(lecturerId)
        );

        if (!isRoomOk) formik.setFieldValue("roomId", "");
        if (!isLecOk) formik.setFieldValue("lecturerId", "");
      } else {
        // Nếu Conflict -> Clear để ép chọn lại từ gợi ý
        setAvailableRooms([]);
        setAvailableLecturers([]);
        formik.setFieldValue("roomId", "");
        formik.setFieldValue("lecturerId", "");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi kiểm tra lịch.");
    } finally {
      setIsChecking(false);
    }
  };

  const applyAlternative = (alt: ScheduleAlternative) => {
    formik.setFieldValue("startDate", alt.startDate);
    formik.setFieldValue("startTime", alt.startTime);
    formik.setFieldValue("schedulePattern", alt.schedulePattern);
    setAvailableRooms(alt.availableRooms);
    setAvailableLecturers(alt.availableLecturers);
    formik.setFieldValue("roomId", "");
    formik.setFieldValue("lecturerId", "");
    setSuggestionResult(null);
  };

  const showSidePanel = suggestionResult !== null;

  if (loadingData)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          mt: 4,
          mb: 4,
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          px: 2,
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/classes">
            Lớp học
          </Link>
          <Typography color="text.primary">Chỉnh sửa</Typography>
        </Breadcrumbs>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            color="inherit"
          >
            Quay lại
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Chỉnh sửa Lớp học
          </Typography>
          <Button
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={() => formik.handleSubmit()}
            disabled={
              isSaving || !formik.values.roomId || !formik.values.lecturerId
            }
          >
            Lưu thay đổi
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid
            size={{ xs: 12, md: showSidePanel ? 8 : 12 }}
            sx={{ transition: "all 0.3s ease" }}
          >
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Thông tin lớp học
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Tên lớp"
                    value={formik.values.className}
                    disabled
                    variant="filled"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Khóa học"
                    value={formik.values.courseName}
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Thời lượng (phút)"
                    name="durationMinutes"
                    value={formik.values.durationMinutes}
                    onChange={handleManualChange}
                    error={Boolean(formik.errors.durationMinutes)}
                    helperText={formik.errors.durationMinutes}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }} container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TimePicker
                      label="Giờ bắt đầu"
                      value={
                        formik.values.startTime
                          ? dayjs(formik.values.startTime, "HH:mm")
                          : null
                      }
                      onChange={(val) => {
                        formik.setFieldValue(
                          "startTime",
                          val ? val.format("HH:mm") : ""
                        );
                        setSuggestionResult(null);
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Giờ kết thúc"
                      value={calculatedEndTime}
                      disabled
                      variant="filled"
                      helperText="Tự động tính toán"
                    />
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={
                      formik.values.startDate
                        ? dayjs(formik.values.startDate)
                        : null
                    }
                    onChange={(val) => {
                      formik.setFieldValue(
                        "startDate",
                        val ? val.format("YYYY-MM-DD") : ""
                      );
                      setSuggestionResult(null);
                      // Timeout để trigger validation sau khi state update
                      setTimeout(
                        () => formik.validateField("schedulePattern"),
                        0
                      );
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(formik.errors.startDate),
                        helperText: formik.errors.startDate,
                      },
                    }}
                  />
                </Grid>

                {/* Lịch học */}
                <Grid size={12}>
                  <FormControl
                    component="fieldset"
                    error={Boolean(formik.errors.schedulePattern)}
                  >
                    <FormLabel component="legend">
                      Lịch học trong tuần
                    </FormLabel>
                    <FormGroup row>
                      {DAY_OPTIONS.map((day) => {
                        const isChecked = formik.values.schedulePattern
                          .split("-")
                          .includes(day.value);
                        return (
                          <FormControlLabel
                            key={day.value}
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) =>
                                  handleDayChange(day.value, e.target.checked)
                                }
                              />
                            }
                            label={day.label}
                          />
                        );
                      })}
                    </FormGroup>
                    {formik.errors.schedulePattern && (
                      <Typography variant="caption" color="error">
                        {formik.errors.schedulePattern}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <Button
                    variant="outlined"
                    onClick={handleCheckSchedule}
                    disabled={isChecking || !isFormChanged}
                    fullWidth
                    color={isFormChanged ? "primary" : "inherit"}
                    sx={{
                      borderStyle: "dashed",
                      borderWidth: 2,
                      opacity: isFormChanged ? 1 : 0.7,
                    }}
                  >
                    {isChecking
                      ? "Đang kiểm tra..."
                      : isFormChanged
                      ? "Kiểm tra lịch & Tìm phòng trống"
                      : "Thông tin chưa thay đổi"}
                  </Button>
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
                        ? "Vui lòng kiểm tra lịch trước"
                        : ""
                    }
                    error={Boolean(formik.errors.roomId)}
                  >
                    {availableRooms.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
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
                        ? "Vui lòng kiểm tra lịch trước"
                        : ""
                    }
                    error={Boolean(formik.errors.lecturerId)}
                  >
                    {availableLecturers.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* PANEL CONFLICT / GỢI Ý */}
          {showSidePanel && (
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                animation: "fadeIn 0.5s ease-in-out",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              {suggestionResult?.status === "CONFLICT" ? (
                <Paper
                  sx={{ p: 2, bgcolor: "#fff3e0", border: "1px solid #ffcc80" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Typography
                      variant="h6"
                      color="warning.main"
                      fontWeight="bold"
                    >
                      Phát hiện xung đột
                    </Typography>
                  </Stack>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {suggestionResult.message}
                  </Alert>

                  {/* Lý do conflict */}
                  <Box mt={1}>
                    {suggestionResult.initialCheck.roomConflicts?.map(
                      (c, i) => (
                        <Typography
                          key={`rc-${i}`}
                          variant="caption"
                          display="block"
                          color="error"
                        >
                          • {c.description}
                        </Typography>
                      )
                    )}
                    {suggestionResult.initialCheck.lecturerConflicts?.map(
                      (c, i) => (
                        <Typography
                          key={`lc-${i}`}
                          variant="caption"
                          display="block"
                          color="error"
                        >
                          • {c.description}
                        </Typography>
                      )
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Gợi ý thay thế:
                  </Typography>

                  <Stack
                    spacing={1}
                    sx={{ maxHeight: 400, overflowY: "auto", pr: 0.5 }}
                  >
                    {suggestionResult.alternatives.map((alt, index) => (
                      <Card
                        key={index}
                        variant="outlined"
                        sx={{
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
                              <Grid size={{ xs: 12, sm: 9 }}>
                                <Stack direction="column" spacing={0.5}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Chip
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
                </Paper>
              ) : (
                <Paper
                  sx={{ p: 2, bgcolor: "#e8f5e9", border: "1px solid #a5d6a7" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Typography
                      variant="h6"
                      color="success.main"
                      fontWeight="bold"
                    >
                      Lịch hợp lệ
                    </Typography>
                  </Stack>
                  <Alert
                    severity="success"
                    variant="standard"
                    sx={{ bgcolor: "transparent", p: 0, mb: 2 }}
                  >
                    Lịch học khả dụng! Đã tìm thấy{" "}
                    <b>{availableRooms.length}</b> phòng và{" "}
                    <b>{availableLecturers.length}</b> giảng viên phù hợp.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => {
                      document
                        .querySelector('input[name="roomId"]')
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    Chọn ngay
                  </Button>
                </Paper>
              )}
            </Grid>
          )}

          {classDetail &&
            classDetail.sessions &&
            classDetail.sessions.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ mb: 2 }}
                  >
                    Danh sách buổi học ({classDetail.totalSessions} buổi)
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              fontWeight: "bold",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell align="center" width="80">
                            STT
                          </TableCell>
                          <TableCell>Ngày học</TableCell>
                          <TableCell>Ghi chú</TableCell>
                          <TableCell align="center">Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classDetail.sessions.map((session, index) => (
                          <TableRow key={session.sessionId} hover>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell>
                              {dayjs(session.date).format("DD/MM/YYYY")} (
                              {dayjs(session.date).format("dddd")})
                            </TableCell>
                            <TableCell>{session.note}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  session.status
                                    ? "Đã hoàn thành"
                                    : "Chưa diễn ra"
                                }
                                color={session.status ? "success" : "default"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default EditClass;
