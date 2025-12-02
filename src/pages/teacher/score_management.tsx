import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Breadcrumbs,
    Link,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Avatar,
    Chip,
    Stack
} from "@mui/material";
import {
    ArrowBack,
    Save,
    Edit,
    Person
} from "@mui/icons-material";
import { getClassDetail } from "../../services/class_service";
import { getScoresByClassId, saveScores } from "../../services/score_service";
import { ClassDetailResponse } from "../../model/class_model";
import { ScoreBoardItem, SCORE_TYPES, SaveScoreRequest, ScoreInputRequest } from "../../model/score_model";

const TeacherScoreManagement: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [scores, setScores] = useState<ScoreBoardItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedType, setSelectedType] = useState<string>(SCORE_TYPES[0].value);
    const [entryData, setEntryData] = useState<ScoreInputRequest[]>([]);
    const [saving, setSaving] = useState(false);

    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchData = async () => {
        if (classId) {
            try {
                setLoading(true);
                const [detail, scoreList] = await Promise.all([
                    getClassDetail(classId),
                    getScoresByClassId(classId)
                ]);
                setClassDetail(detail);

                // If scoreList is empty, we might want to populate it with students from classDetail for display
                // But typically getScoresByClassId should return all students even with null scores.
                // If not, we merge.
                if (scoreList.length === 0 && detail.students) {
                    const emptyScores = detail.students.map(s => ({
                        studentId: s.studentId,
                        studentName: s.fullName,
                        attendanceScore: null,
                        midtermScore: null,
                        finalScore: null,
                        averageScore: null
                    }));
                    setScores(emptyScores);
                } else {
                    setScores(scoreList);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setNotification({
                    open: true,
                    message: "Lỗi khi tải dữ liệu lớp học.",
                    severity: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [classId]);

    const handleOpenDialog = () => {
        // Initialize entry data based on current scores and selected type
        // But wait, we need to select type first. 
        // Let's default to the first type or keep previous selection.
        prepareEntryData(selectedType);
        setOpenDialog(true);
    };

    const prepareEntryData = (type: string) => {
        const data: ScoreInputRequest[] = scores.map(s => {
            let currentScore = 0;
            if (type === 'ATTENDANCE') currentScore = s.attendanceScore || 0;
            if (type === 'MIDTERM') currentScore = s.midtermScore || 0;
            if (type === 'FINAL') currentScore = s.finalScore || 0;

            return {
                studentId: s.studentId,
                score: currentScore,
                note: "" // We don't have note in ScoreBoardItem, maybe we should? For now leave empty.
            };
        });
        setEntryData(data);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        prepareEntryData(type);
    };

    const handleScoreChange = (studentId: number, value: string) => {
        const numValue = parseFloat(value);
        setEntryData(prev => prev.map(item =>
            item.studentId === studentId ? { ...item, score: isNaN(numValue) ? 0 : numValue } : item
        ));
    };

    const handleNoteChange = (studentId: number, value: string) => {
        setEntryData(prev => prev.map(item =>
            item.studentId === studentId ? { ...item, note: value } : item
        ));
    };

    const handleSave = async () => {
        // Validate scores (0-10)
        const invalidScore = entryData.find(d => d.score < 0 || d.score > 10);
        if (invalidScore) {
            setNotification({
                open: true,
                message: "Điểm số không hợp lệ (phải từ 0-10).",
                severity: "error"
            });
            return;
        }

        if (!classId) return;

        try {
            setSaving(true);
            const request: SaveScoreRequest = {
                classId: classId,
                type: selectedType,
                scores: entryData
            };
            await saveScores(request);
            setNotification({
                open: true,
                message: "Lưu điểm thành công!",
                severity: "success"
            });
            setOpenDialog(false);
            fetchData(); // Reload data
        } catch (error) {
            console.error("Error saving scores:", error);
            setNotification({
                open: true,
                message: "Lưu điểm thất bại.",
                severity: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) {
        return <Box sx={{ p: 3 }}>Đang tải...</Box>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
                    {classDetail?.className || "Lớp học"}
                </Link>
                <Typography color="text.primary">Quản lý điểm</Typography>
            </Breadcrumbs>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Bảng điểm lớp học
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {classDetail?.className} - {classDetail?.courseName}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/teacher/classes/${classId}`)}>
                        Quay lại
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleOpenDialog}
                    >
                        Nhập điểm
                    </Button>
                </Stack>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: "none" }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell>STT</TableCell>
                                    <TableCell>Học viên</TableCell>
                                    <TableCell align="center">Điểm chuyên cần</TableCell>
                                    <TableCell align="center">Điểm giữa kỳ</TableCell>
                                    <TableCell align="center">Điểm cuối kỳ</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Điểm trung bình</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {scores.map((row, index) => (
                                    <TableRow key={row.studentId} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "primary.main" }}>
                                                    <Person />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{row.studentName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {row.studentId}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">{row.attendanceScore !== null ? row.attendanceScore : "-"}</TableCell>
                                        <TableCell align="center">{row.midtermScore !== null ? row.midtermScore : "-"}</TableCell>
                                        <TableCell align="center">{row.finalScore !== null ? row.finalScore : "-"}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {row.averageScore !== null ? row.averageScore : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {scores.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="text.secondary" sx={{ py: 4 }}>
                                                Chưa có dữ liệu điểm
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Dialog Input Score */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Nhập điểm</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            select
                            label="Loại điểm"
                            value={selectedType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            {SCORE_TYPES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Học viên</TableCell>
                                    <TableCell width="150">Điểm số (0-10)</TableCell>
                                    <TableCell>Ghi chú</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entryData.map((item) => {
                                    const studentName = scores.find(s => s.studentId === item.studentId)?.studentName || "Unknown";
                                    return (
                                        <TableRow key={item.studentId}>
                                            <TableCell>{studentName}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={item.score}
                                                    onChange={(e) => handleScoreChange(item.studentId, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                    error={item.score < 0 || item.score > 10}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={item.note}
                                                    onChange={(e) => handleNoteChange(item.studentId, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Ghi chú..."
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu điểm"}
                    </Button>
                </DialogActions>
            </Dialog>

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
export default TeacherScoreManagement;
