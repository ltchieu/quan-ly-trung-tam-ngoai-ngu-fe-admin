import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TodayIcon from "@mui/icons-material/Today";
import {
  CourseFilterData,
  LecturerFilterData,
  RoomFilterData,
} from "../model/class_model";
import { Session, WeeklyScheduleResponse } from "../model/schedule_model";
import {
  getCourseFilterList,
  getLecturerFilterList,
  getRoomFilterList,
} from "../services/class_service";
import { getWeeklySchedule } from "../services/schedule_service";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PERIODS_ORDER = ["Sáng", "Chiều", "Tối"];

const mapDayToVN: Record<string, string> = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

const Timetable: React.FC = () => {
  // --- STATE DỮ LIỆU ---
  const [scheduleData, setScheduleData] =
    useState<WeeklyScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // --- STATE BỘ LỌC (UI) ---
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // --- STATE DANH SÁCH CHO COMBOBOX ---
  const [lecturers, setLecturers] = useState<LecturerFilterData[]>([]);
  const [rooms, setRooms] = useState<RoomFilterData[]>([]);
  const [courses, setCourses] = useState<CourseFilterData[]>([]);

  // --- 1. LOAD DANH SÁCH BỘ LỌC KHI VÀO TRANG ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [courseRes, lecturerRes, roomRes] = await Promise.all([
          getCourseFilterList(),
          getLecturerFilterList(),
          getRoomFilterList(),
        ]);
        setCourses(courseRes);
        setLecturers(lecturerRes);
        setRooms(roomRes);
      } catch (error) {
        console.error("Lỗi tải bộ lọc:", error);
      }
    };
    fetchFilters();
  }, []);

  // --- 2. GỌI API LẤY LỊCH ---
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const formattedDate = currentDate.format("YYYY-MM-DD");

      // Convert giá trị combobox: "" -> null, có giá trị -> number
      const lecturerId = selectedLecturer ? Number(selectedLecturer) : null;
      const roomId = selectedRoom ? Number(selectedRoom) : null;
      const courseId = selectedCourse ? Number(selectedCourse) : null;

      const data = await getWeeklySchedule(
        lecturerId,
        roomId,
        courseId,
        formattedDate
      );

      setScheduleData(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi thay đổi ngày hoặc thay đổi bộ lọc
  useEffect(() => {
    fetchSchedule();
  }, [currentDate, selectedLecturer, selectedRoom, selectedCourse]);

  // --- HANDLERS ---
  const handlePrevWeek = () => setCurrentDate(currentDate.subtract(1, "week"));
  const handleNextWeek = () => setCurrentDate(currentDate.add(1, "week"));
  const handleToday = () => setCurrentDate(dayjs());
  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) setCurrentDate(newValue);
  };

  // --- RENDER CARD ---
  const renderSessionCard = (session: Session) => (
    <Card
      key={session.sessionId}
      variant="outlined"
      sx={{
        mb: 1,
        backgroundColor: session.status ? "#e3f2fd" : "#e8f5e9",
        borderLeft: `4px solid ${session.status ? "#2196f3" : "#4caf50"}`,
        cursor: "pointer",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="primary.main"
          sx={{ fontSize: "0.85rem", lineHeight: 1.2, mb: 0.5 }}
        >
          {session.className}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ fontWeight: "bold", color: "#555" }}
        >
          {session.courseName}
        </Typography>
        <Typography variant="caption" display="block">
          Phòng: <b>{session.roomName}</b>
        </Typography>
        <Typography variant="caption" display="block">
          GV: {session.instructorName}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {/* HEADER */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Lịch học, lịch thi theo tuần
              </Typography>
              {scheduleData && (
                <Typography variant="caption" color="text.secondary">
                  Từ {dayjs(scheduleData.weekStart).format("DD/MM/YYYY")} đến{" "}
                  {dayjs(scheduleData.weekEnd).format("DD/MM/YYYY")}
                </Typography>
              )}
            </Grid>

            {/* Controls Ngày */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
            >
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={handleToday}
                size="small"
              >
                Hiện tại
              </Button>

              <Button
                variant="contained"
                onClick={handlePrevWeek}
                startIcon={<FontAwesomeIcon icon={faAngleLeft}/>}
                sx={{textTransform: "none", ml: 3, px: 1}}
              >
                Trở về
              </Button>

              <DatePicker
                value={currentDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: "small", sx: { width: 180 } } }}
              />
              <Button
                variant="contained"
                onClick={handleNextWeek}
                endIcon={<FontAwesomeIcon icon={faAngleRight}/>}
                sx={{textTransform: "none", px: 1}}
              >
                Tiếp
              </Button>
            </Grid>

            {/* Bộ lọc */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={selectedLecturer}
                  label="Giảng viên"
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  {lecturers.map((l) => (
                    <MenuItem key={l.lecturerId} value={l.lecturerId}>
                      {l.lecturerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Phòng học</InputLabel>
                <Select
                  value={selectedRoom}
                  label="Phòng học"
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  {rooms.map((r) => (
                    <MenuItem key={r.roomId} value={r.roomId}>
                      {r.roomName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Khóa học</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Khóa học"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* BẢNG LỊCH */}
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 800, borderCollapse: "separate" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#2c3e50" }}>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "80px",
                      textAlign: "center",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    Ca học
                  </TableCell>
                  {scheduleData?.days.map((day) => (
                    <TableCell
                      key={day.date}
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        borderRight: "1px solid #555",
                      }}
                    >
                      <Box>{mapDayToVN[day.dayName] || day.dayName}</Box>
                      <Box sx={{ fontSize: "0.8rem", opacity: 0.9 }}>
                        {dayjs(day.date).format("DD/MM/YYYY")}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  PERIODS_ORDER.map((periodName) => (
                    <TableRow key={periodName}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#fff8e1",
                          textAlign: "center",
                          borderRight: "1px solid #ddd",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {periodName}
                      </TableCell>

                      {scheduleData?.days.map((day) => {
                        const periodData = day.periods.find(
                          (p) => p.period === periodName
                        );
                        const sessions = periodData ? periodData.sessions : [];

                        return (
                          <TableCell
                            key={`${day.date}-${periodName}`}
                            sx={{
                              verticalAlign: "top",
                              backgroundColor: "#fafafa",
                              borderRight: "1px solid #eee",
                              borderBottom: "1px solid #eee",
                              height: "150px",
                              minWidth: "140px",
                              p: 1,
                            }}
                          >
                            {sessions.length > 0 ? (
                              <Stack spacing={1}>
                                {sessions.map((session) =>
                                  renderSessionCard(session)
                                )}
                              </Stack>
                            ) : null}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Chú thích */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              alignItems: "center",
              fontSize: "0.875rem",
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  borderLeftWidth: 4,
                }}
              />
              <span>Lịch học (Chưa diễn ra)</span>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#e3f2fd",
                  border: "1px solid #2196f3",
                  borderLeftWidth: 4,
                }}
              />
              <span>Đã hoàn thành</span>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default Timetable;
