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
import { ClassDetailResponse, SessionInfoDetail, AttendanceSessionRequest } from "../../model/class_model";
import dayjs from "dayjs";

const TeacherAttendance: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [sessions, setSessions] = useState<SessionInfoDetail[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | number>("");
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [attendanceStatus, setAttendanceStatus] = useState<"Taken" | "Not Taken">("Not Taken");
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
                try {
                    const data = await getAttendanceBySessionId(selectedSessionId);
                    // Map API response to UI model
                    if (data && data.entries && data.entries.length > 0) {
                        const mappedData = data.entries.map((entry) => ({
                            studentId: entry.studentId,
                            fullName: entry.studentName,
                            isAbsent: entry.absent,
                            note: entry.note
                        }));
                        setAttendanceData(mappedData);
                        setAttendanceStatus("Taken");
                    } else {
                        // Fallback to class student list if no attendance data
                        throw new Error("No attendance data");
                    }
                } catch (error) {
                    console.log("Fetching attendance failed or empty, falling back to student list:", error);
                    if (classDetail && classDetail.students) {
                        const defaultData = classDetail.students.map((student) => ({
                            studentId: student.studentId,
                            fullName: student.fullName,
                            isAbsent: false, // Default to Present
                            note: ""
                        }));
                        setAttendanceData(defaultData);
                        setAttendanceStatus("Not Taken");
                    } else {
                        setAttendanceData([]);
                        setAttendanceStatus("Not Taken");
                    }
                }

                // Check editability
                const session = sessions.find(s => s.sessionId === selectedSessionId);
                if (session) {
                    const today = dayjs().format("YYYY-MM-DD");
                    // Assuming session.date is in YYYY-MM-DD format. If not, might need parsing.
                    // Let's try to normalize both to be safe.
                    const sessionDate = dayjs(session.date).format("YYYY-MM-DD");

                    const isToday = sessionDate === today;
                    const isCompleted = session.status === "Completed";

                    // Rule: 
                    // 1. If Completed -> Read only
                    // 2. If Not Completed -> Editable ONLY if it is Today

                    if (isCompleted) {
                        setIsEditable(false);
                    } else {
                        setIsEditable(isToday);
                    }
                }
            }
        };

        fetchAttendance();
    }, [selectedSessionId, sessions, classDetail]);

    const handleAttendanceChange = (studentId: number, isAbsent: boolean) => {
        if (!isEditable) return;
        setAttendanceData((prev) =>
            prev.map((item) =>
                item.studentId === studentId ? { ...item, isAbsent: isAbsent } : item
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
                    absent: item.isAbsent,
                    note: item.note || ""
                }))
            };
            await saveAttendance(selectedSessionId, request);

            // Update local session status to Completed if it was successful
            setSessions(prev => prev.map(s => s.sessionId === selectedSessionId ? { ...s, status: 'Completed' } : s));
            setAttendanceStatus("Taken");
            // After saving, it becomes completed, so it might become read-only depending on logic, 
            // but usually we might want to allow editing on the same day? 
            // The requirement says: "if the status is already studied then the attendance will not be allowed anymore"
            // So we should disable editing immediately.
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

                                    return (
                                        <React.Fragment key={session.sessionId}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    selected={isSelected}
                                                    onClick={() => setSelectedSessionId(session.sessionId)}
                                                    sx={{
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        py: 2
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            Buổi {session.sessionId}
                                                        </Typography>
                                                        <Chip
                                                            label={isCompleted ? "Đã học" : "Chưa học"}
                                                            color={isCompleted ? "success" : "warning"}
                                                            size="small"
                                                            variant={isCompleted ? "filled" : "outlined"}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                        <EventNote fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2">
                                                            {session.date}
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
                                        label={isEditable ? "Đang điểm danh" : (selectedSession.status === 'Completed' ? "Đã kết thúc" : "Chưa đến ngày học")}
                                        color={isEditable ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            {!isEditable && selectedSession && (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    {selectedSession.status === 'Completed'
                                        ? "Buổi học này đã hoàn thành. Bạn không thể chỉnh sửa điểm danh."
                                        : "Chỉ có thể điểm danh cho buổi học diễn ra trong ngày hôm nay."}
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
                                                            variant={!item.isAbsent ? "contained" : "outlined"}
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleAttendanceChange(item.studentId, false)}
                                                            startIcon={!item.isAbsent ? <CheckCircle /> : <CheckCircleOutline />}
                                                            disabled={!isEditable}
                                                            sx={{ opacity: !isEditable && item.isAbsent ? 0.5 : 1 }}
                                                        >
                                                            Có mặt
                                                        </Button>
                                                        <Button
                                                            variant={item.isAbsent ? "contained" : "outlined"}
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleAttendanceChange(item.studentId, true)}
                                                            startIcon={item.isAbsent ? <Cancel /> : <RadioButtonUnchecked />}
                                                            disabled={!isEditable}
                                                            sx={{ opacity: !isEditable && !item.isAbsent ? 0.5 : 1 }}
                                                        >
                                                            Vắng
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
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity as any} sx={{ width: "100%" }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default TeacherAttendance;
