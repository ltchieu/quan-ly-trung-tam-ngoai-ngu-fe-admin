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
  Stack,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import TodayIcon from "@mui/icons-material/Today";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  CourseFilterData,
  LecturerFilterData,
  RoomFilterData,
} from "../../model/class_model";
import { Session, WeeklyScheduleResponse } from "../../model/schedule_model";
import {
  getCourseFilterList,
  getLecturerFilterList,
  getRoomFilterList,
} from "../../services/class_service";
import { getWeeklySchedule, cancelSession, addMakeupSession, getSuggestedMakeupDates } from "../../services/schedule_service";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";
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

// Helper function to calculate end time
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
};

const Timetable: React.FC = () => {
  useAxiosPrivate();
  // Set Vietnamese locale globally
  dayjs.locale('vi');
  
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

  // --- STATE DIALOG & NOTIFICATION ---
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [makeupDialogOpen, setMakeupDialogOpen] = useState(false);
  const [makeupDate, setMakeupDate] = useState<Dayjs | null>(null);
  const [makeupNote, setMakeupNote] = useState("");
  const [suggestedDates, setSuggestedDates] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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

  // --- HANDLERS FOR MENU ---
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, session: Session) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // --- HANDLERS FOR CANCEL/MAKEUP SESSION ---
  const handleOpenCancelDialog = () => {
    handleCloseMenu();
    
    // Check if session is already canceled
    if (selectedSession?.status === 'Canceled') {
      setNotification({
        open: true,
        message: "Buổi học này đã bị hủy. Vui lòng thêm buổi học bù để thay thế.",
        severity: "warning",
      });
      return;
    }
    
    // Check if session can be canceled (only NotCompleted status)
    if (selectedSession?.status !== 'NotCompleted') {
      setNotification({
        open: true,
        message: "Chỉ có thể hủy các buổi học chưa diễn ra.",
        severity: "warning",
      });
      return;
    }
    
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedSession(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSession) return;

    try {
      await cancelSession(selectedSession.sessionId);
      handleCloseCancelDialog();
      await fetchSchedule(); // Reload schedule and wait for it to complete
      setNotification({
        open: true,
        message: "Hủy buổi học thành công!",
        severity: "success",
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: error?.response?.data?.message || "Không thể hủy buổi học",
        severity: "error",
      });
      handleCloseCancelDialog();
    }
  };

  const handleOpenMakeupDialog = async () => {
    handleCloseMenu();
    
    // Only allow makeup for canceled sessions
    if (selectedSession?.status !== 'Canceled') {
      setNotification({
        open: true,
        message: "Chỉ có thể thêm buổi học bù cho buổi học đã bị hủy.",
        severity: "warning",
      });
      return;
    }
    
    if (!selectedSession) return;
    
    setMakeupDate(null);
    setMakeupNote("");
    setMakeupDialogOpen(true);
    
    // Load suggested dates after opening dialog
    setLoadingSuggestions(true);
    try {
      const dates = await getSuggestedMakeupDates(selectedSession.classId, 14);
      setSuggestedDates(dates || []);
      if (!dates || dates.length === 0) {
        setNotification({
          open: true,
          message: "Không tìm thấy ngày phù hợp. Vui lòng chọn ngày thủ công.",
          severity: "info",
        });
      }
    } catch (error: any) {
      console.error("Error fetching suggested dates:", error);
      setSuggestedDates([]);
      setNotification({
        open: true,
        message: "Không thể lấy gợi ý ngày học bù",
        severity: "warning",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCloseMakeupDialog = () => {
    setMakeupDialogOpen(false);
    setSelectedSession(null);
    setMakeupDate(null);
    setMakeupNote("");
    setSuggestedDates([]);
  };

  const handleConfirmMakeup = async () => {
    if (!selectedSession || !makeupDate) {
      setNotification({
        open: true,
        message: "Vui lòng chọn ngày học bù",
        severity: "warning",
      });
      return;
    }

    try {
      const formattedDate = makeupDate.format("YYYY-MM-DD");
      console.log("Thêm buổi học bù:", {
        classId: selectedSession.classId,
        sessionDate: formattedDate,
        note: makeupNote
      });
      
      await addMakeupSession(
        selectedSession.classId,
        formattedDate,
        makeupNote || undefined
      );
      handleCloseMakeupDialog();
      await fetchSchedule(); // Reload schedule and wait for it to complete
      setNotification({
        open: true,
        message: "Thêm buổi học bù thành công!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi thêm buổi học bù:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          "Không thể thêm buổi học bù. Vui lòng kiểm tra lại điều kiện.";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // --- HELPER TO GET SESSION COLORS ---
  const getSessionColors = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#e3f2fd', border: '#2196f3' };
      case 'Canceled':
        return { bg: '#ffebee', border: '#f44336' };
      case 'NotCompleted':
      default:
        return { bg: '#e8f5e9', border: '#4caf50' }; 
    }
  };

  // --- RENDER CARD ---
  const renderSessionCard = (session: Session) => {
    const colors = getSessionColors(session.status);
    const isCanceled = session.status === 'Canceled';
    
    return (
      <Card
        key={session.sessionId}
        variant="outlined"
        sx={{
          mb: 1,
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          "&:hover": { boxShadow: 2 },
          opacity: isCanceled ? 0.7 : 1,
        }}
      >
        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary.main"
                sx={{ 
                  fontSize: "0.85rem", 
                  lineHeight: 1.2,
                  textDecoration: isCanceled ? 'line-through' : 'none'
                }}
              >
                {session.className}
              </Typography>
              
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, session)}
              sx={{ 
                p: 0.3,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            variant="caption"
            display="block"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 0.5 }}
          >
            {session.startTime} - {calculateEndTime(session.startTime, session.durationMinutes)}
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
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Lịch học</Typography>
        </Breadcrumbs>

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
                startIcon={<FontAwesomeIcon icon={faAngleLeft} />}
                sx={{ textTransform: "none", ml: 3, px: 1 }}
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
                endIcon={<FontAwesomeIcon icon={faAngleRight} />}
                sx={{ textTransform: "none", px: 1 }}
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
              <span>Chưa diễn ra</span>
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#ffebee",
                  border: "1px solid #f44336",
                  borderLeftWidth: 4,
                }}
              />
              <span>Đã hủy</span>
            </Box>
          </Box>
        </Paper>

        {/* Session Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {selectedSession?.status === 'Canceled' ? (
            <MenuItem onClick={handleOpenMakeupDialog}>
              <ListItemIcon>
                <AddCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Thêm buổi học bù</ListItemText>
            </MenuItem>
          ) : selectedSession?.status === 'NotCompleted' ? (
            <MenuItem onClick={handleOpenCancelDialog}>
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Hủy buổi học</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem disabled>
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" color="disabled" />
              </ListItemIcon>
              <ListItemText>Không thể hủy buổi học này</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Cancel Session Dialog */}
        <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Xác nhận hủy buổi học</Typography>
              <IconButton onClick={handleCloseCancelDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedSession && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Bạn có chắc chắn muốn hủy buổi học này?
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {selectedSession.className}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ngày: {dayjs(selectedSession.sessionDate).format("DD/MM/YYYY")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giờ: {selectedSession.startTime} - {calculateEndTime(selectedSession.startTime, selectedSession.durationMinutes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phòng: {selectedSession.roomName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="error" sx={{ mt: 2, display: "block" }}>
                  * Sau khi hủy, bạn có thể thêm buổi học bù để thay thế.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelDialog} color="inherit">
              Đóng
            </Button>
            <Button onClick={handleConfirmCancel} variant="contained" color="error" startIcon={<CancelIcon />}>
              Xác nhận hủy
            </Button>
          </DialogActions>
        </Dialog>

        {/* Makeup Session Dialog */}
        <Dialog open={makeupDialogOpen} onClose={handleCloseMakeupDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Thêm buổi học bù</Typography>
              <IconButton onClick={handleCloseMakeupDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedSession && (
              <Box>
                {selectedSession.status === 'Canceled' && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: "warning.lighter", borderRadius: 1, border: '2px solid', borderColor: 'warning.main' }}>
                    <Typography variant="subtitle2" color="warning.dark" fontWeight="bold" gutterBottom>
                      ⚠️ Buổi học bị hủy cần bù
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Buổi học ngày {dayjs(selectedSession.sessionDate).format("DD/MM/YYYY")} đã bị hủy. Vui lòng chọn ngày bù phù hợp.
                    </Typography>
                  </Box>
                )}
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Thông tin lớp học:
                </Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Lớp:</strong> {selectedSession.className}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Khóa học:</strong> {selectedSession.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Giờ học:</strong> {selectedSession.startTime} - {calculateEndTime(selectedSession.startTime, selectedSession.durationMinutes)}
                  </Typography>
                  {selectedSession.status === 'Canceled' && (
                    <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                      <strong>Buổi bị hủy:</strong> {dayjs(selectedSession.sessionDate).format("DD/MM/YYYY")}
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Chọn ngày học bù:
                </Typography>
                <DatePicker
                  label="Ngày học bù"
                  value={makeupDate}
                  onChange={(newValue) => setMakeupDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      sx: { mb: 2 }
                    } 
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                    <span>✨ Ngày gợi ý (không trùng lịch):</span>
                    {loadingSuggestions && <CircularProgress size={12} />}
                  </Typography>
                  {loadingSuggestions ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Đang tìm ngày phù hợp...
                      </Typography>
                    </Box>
                  ) : suggestedDates.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {suggestedDates.map((date) => {
                        const isSelected = makeupDate?.format("YYYY-MM-DD") === date;
                        return (
                          <Chip
                            key={date}
                            label={dayjs(date).format("DD/MM/YYYY (dddd)")}
                            onClick={() => setMakeupDate(dayjs(date))}
                            color={isSelected ? "primary" : "success"}
                            variant={isSelected ? "filled" : "outlined"}
                            icon={isSelected ? <EventAvailableIcon /> : undefined}
                            sx={{
                              fontWeight: isSelected ? 'bold' : 'normal',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s'
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Không có ngày gợi ý. Vui lòng chọn ngày thủ công bên dưới.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Ghi chú (không bắt buộc)"
                  value={makeupNote}
                  onChange={(e) => setMakeupNote(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Ví dụ: Buổi học bù cho ngày 10/01..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMakeupDialog} color="inherit">
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmMakeup} 
              variant="contained" 
              color="success" 
              startIcon={<AddCircleIcon />}
              disabled={!makeupDate}
            >
              Thêm buổi học bù
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={2000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default Timetable;
