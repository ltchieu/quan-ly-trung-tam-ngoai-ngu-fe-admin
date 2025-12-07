import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Breadcrumbs,
    Link,
    TextField,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Chip,
    Divider,
} from "@mui/material";
import {
    ArrowBack,
    Save,
    CheckCircle,
    Cancel,
    Person,
    EventNote,
    CheckCircleOutline,
    RadioButtonUnchecked,
} from "@mui/icons-material";
import {
    getClassDetail,
    getAttendanceBySessionId,
    saveAttendance,
} from "../../services/class_service";
import { ClassDetailResponse, SessionInfoDetail, AttendanceSessionRequest, AttendanceStatsResponse } from "../../model/class_model";
import dayjs from "dayjs";

const TeacherAttendance: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [sessions, setSessions] = useState<SessionInfoDetail[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | number>("");

    // Store local state with status: "PRESENT" | "ABSENT" | "LATE"
    const [attendanceData, setAttendanceData] = useState<{
        studentId: number;
        fullName: string;
        status: "PRESENT" | "ABSENT" | "LATE";
        note: string;
    }[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [attendanceStatus, setAttendanceStatus] = useState<"Taken" | "Not Taken">("Not Taken");

    // Stats state
    const [stats, setStats] = useState<AttendanceStatsResponse | null>(null);

    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Derived state for editability
    const [isEditable, setIsEditable] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            if (classId) {
                try {
                    setLoading(true);
                    const detail = await getClassDetail(classId);
                    setClassDetail(detail);
                    const sessionList = detail.sessions || [];
                    setSessions(sessionList);

                    if (sessionList.length > 0) {
                        // Find first session that is not completed
                        const pendingSession = sessionList.find((s) => s.status !== "Completed");
                        setSelectedSessionId(pendingSession ? pendingSession.sessionId : sessionList[0].sessionId);
                    }
                } catch (error) {
                    console.error("Error fetching class data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [classId]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (selectedSessionId) {
                setStats(null);
                try {
                    const data = await getAttendanceBySessionId(Number(selectedSessionId));
                    if (data && data.entries && data.entries.length > 0) {
                        const mappedData = data.entries.map((entry) => ({
                            studentId: entry.studentId,
                            fullName: entry.studentName,
                            status: entry.status,
                            note: entry.note
                        }));
                        setAttendanceData(mappedData);
                        setAttendanceStatus("Taken");
                    } else {
                        // No attendance data yet - initialize with student list
                        if (classDetail && classDetail.students) {
                            const defaultData = classDetail.students.map((student) => ({
                                studentId: student.studentId,
                                fullName: student.fullName,
                                status: "PRESENT" as const,
                                note: ""
                            }));
                            setAttendanceData(defaultData);
                            setAttendanceStatus("Not Taken");
                        } else {
                            setAttendanceData([]);
                            setAttendanceStatus("Not Taken");
                        }
                    }
                } catch (error: any) {
                    console.error("Error fetching attendance:", error);
                    setAttendanceData([]);
                    setAttendanceStatus("Not Taken");
                    setNotification({
                        open: true,
                        message: error.message || "Lỗi khi tải danh sách điểm danh",
                        severity: "error",
                    });
                }

                // Check editability based on session status only
                const session = sessions.find(s => s.sessionId === selectedSessionId);
                if (session) {
                    setIsEditable(session.status == "Completed");
                }
            }
        };

        fetchAttendance();
    }, [selectedSessionId, sessions, classDetail]);

    const handleAttendanceChange = (studentId: number, status: "PRESENT" | "ABSENT" | "LATE") => {
        if (!isEditable) return;
        setAttendanceData((prev) =>
            prev.map((item) =>
                item.studentId === studentId ? { ...item, status: status } : item
            )
        );
    };

    const handleNoteChange = (studentId: number, note: string) => {
        if (!isEditable) return;
        setAttendanceData((prev) =>
            prev.map((item) =>
                item.studentId === studentId ? { ...item, note: note } : item
            )
        );
    };

    const handleSave = async () => {
        if (!isEditable) return;
        try {
            setSaving(true);
            const request: AttendanceSessionRequest = {
                sessionId: Number(selectedSessionId),
                entries: attendanceData.map(item => ({
                    studentId: item.studentId,
                    status: item.status,
                    note: item.note || ""
                }))
            };
            console.log("attendance request", request);
            const responseStats = await saveAttendance(selectedSessionId, request);

            setStats(responseStats);

            setSessions(prev => prev.map(s => s.sessionId === selectedSessionId ? { ...s, status: 'Completed' } : s));
            setAttendanceStatus("Taken");

            setIsEditable(false);

            setNotification({
                open: true,
                message: "Lưu điểm danh thành công!",
                severity: "success",
            });
        } catch (error) {
            console.error("Error saving attendance:", error);
            setNotification({
                open: true,
                message: "Lưu điểm danh thất bại. Vui lòng thử lại.",
                severity: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading || !classDetail) {
        return <Box sx={{ p: 3 }}>Đang tải...</Box>;
    }

    const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/teacher/classes");
                    }}
                >
                    Lớp học phụ trách
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/teacher/classes/${classId}`);
                    }}
                >
                    {classDetail.className}
                </Link>
                <Typography color="text.primary">Điểm danh</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Điểm danh lớp học
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {classDetail.className} - {classDetail.courseName}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/teacher/classes/${classId}`)}>
                        Quay lại
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving || !isEditable}
                        color={isEditable ? "primary" : "inherit"}
                    >
                        {saving ? "Đang lưu..." : "Lưu điểm danh"}
                    </Button>
                </Stack>
            </Box>

            {/* Statistics Section (Visible after save or if stats available - optional if needed on load) */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">Tổng số</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.totalStudents}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: '#e8f5e9' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" color="success.main">Có mặt</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">{stats.presentCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: '#ffebee' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" color="error.main">Vắng mặt</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">{stats.absentCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ bgcolor: '#fff3e0' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" color="warning.main">Đi muộn</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.lateCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>
                {/* Session List */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Danh sách buổi học
                                </Typography>
                            </Box>
                            <List sx={{
                                width: '100%',
                                maxHeight: 600,
                                overflow: 'auto',
                                '& .MuiListItemButton-root': {
                                    borderLeft: '4px solid transparent',
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.lighter',
                                        borderLeftColor: 'primary.main',
                                        '&:hover': {
                                            bgcolor: 'primary.lighter',
                                        }
                                    }
                                }
                            }}>
                                {sessions.map((session) => {
                                    const isCompleted = session.status === 'Completed';
                                    const isSelected = session.sessionId === selectedSessionId;
                                    const today = dayjs().format("YYYY-MM-DD");
                                    const sessionDate = dayjs(session.date).format("YYYY-MM-DD");
                                    const isToday = sessionDate === today;

                                    return (
                                        <React.Fragment key={session.sessionId}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    selected={isSelected}
                                                    onClick={() => setSelectedSessionId(session.sessionId)}
                                                    sx={{
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        py: 2,
                                                        bgcolor: isToday ? 'info.lighter' : 'inherit',
                                                        '&:hover': {
                                                            bgcolor: isToday ? 'info.light' : 'action.hover',
                                                        },
                                                        ...(isToday && {
                                                            boxShadow: 'inset 0 0 0 2px',
                                                            boxShadowColor: 'info.main',
                                                        })
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            Buổi {session.sessionId} {isToday && "📅"}
                                                        </Typography>
                                                        <Chip
                                                            label={isCompleted ? "Đã học" : "Chưa học"}
                                                            color={isCompleted ? "success" : "warning"}
                                                            size="small"
                                                            variant={isCompleted ? "filled" : "outlined"}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', color: isToday ? 'info.main' : 'text.secondary' }}>
                                                        <EventNote fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" fontWeight={isToday ? "bold" : "normal"}>
                                                            {session.date} {isToday && "(Hôm nay)"}
                                                        </Typography>
                                                    </Box>
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Attendance List */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ minHeight: 600 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Danh sách học viên
                                </Typography>
                                {selectedSession && (
                                    <Chip
                                        label={isEditable ? "Có thể điểm danh hoặc chỉnh sửa điểm danh" : "Đã hoàn thành"}
                                        color={isEditable ? "success" : "default"}
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            {!isEditable && selectedSession && (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Chưa đến thời gian của buổi học này. Bạn không thể chỉnh sửa điểm danh.
                                </Alert>
                            )}

                            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: "none" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Học viên</TableCell>
                                            <TableCell align="center">Trạng thái</TableCell>
                                            <TableCell>Ghi chú</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendanceData.map((item) => (
                                            <TableRow key={item.studentId} hover>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "primary.main" }}>
                                                            <Person />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">{item.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ID: {item.studentId}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Button
                                                            variant={item.status === "PRESENT" ? "contained" : "outlined"}
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleAttendanceChange(item.studentId, "PRESENT")}
                                                            startIcon={item.status === "PRESENT" ? <CheckCircle /> : <CheckCircleOutline />}
                                                            disabled={!isEditable}
                                                            sx={{ opacity: !isEditable && item.status !== "PRESENT" ? 0.5 : 1 }}
                                                        >
                                                            Có mặt
                                                        </Button>
                                                        <Button
                                                            variant={item.status === "ABSENT" ? "contained" : "outlined"}
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleAttendanceChange(item.studentId, "ABSENT")}
                                                            startIcon={item.status === "ABSENT" ? <Cancel /> : <RadioButtonUnchecked />}
                                                            disabled={!isEditable}
                                                            sx={{ opacity: !isEditable && item.status !== "ABSENT" ? 0.5 : 1 }}
                                                        >
                                                            Vắng
                                                        </Button>
                                                        <Button
                                                            variant={item.status === "LATE" ? "contained" : "outlined"}
                                                            color="warning"
                                                            size="small"
                                                            onClick={() => handleAttendanceChange(item.studentId, "LATE")}
                                                            startIcon={item.status === "LATE" ? <EventNote /> : <RadioButtonUnchecked />}
                                                            disabled={!isEditable}
                                                            sx={{ opacity: !isEditable && item.status !== "LATE" ? 0.5 : 1 }}
                                                        >
                                                            Muộn
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder={isEditable ? "Ghi chú..." : ""}
                                                        value={item.note || ""}
                                                        onChange={(e) => handleNoteChange(item.studentId, e.target.value)}
                                                        disabled={!isEditable}
                                                        variant={isEditable ? "outlined" : "standard"}
                                                        InputProps={{ disableUnderline: !isEditable }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {attendanceData.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <Typography color="text.secondary" sx={{ py: 4 }}>
                                                        Vui lòng chọn buổi học để xem danh sách
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={2000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity as any} sx={{ width: "100%" }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};
export default TeacherAttendance;
