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
import { getClassGrades, saveGrade } from "../../services/score_service";
import { ClassDetailResponse } from "../../model/class_model";
import { SCORE_TYPES, GradeRequest, ClassGradesResponse, StudentGradeInfo } from "../../model/score_model";

const TeacherScoreManagement: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [gradesData, setGradesData] = useState<ClassGradesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentGradeInfo | null>(null);
    const [selectedType, setSelectedType] = useState<string>(SCORE_TYPES[0].value);
    const [scoreValue, setScoreValue] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
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
                const grades = await getClassGrades(classId);
                setGradesData(grades);

            } catch (error: any) {
                console.error("Error fetching data:", error);
                const errorMessage = error?.response?.data?.message || "Lỗi khi tải dữ liệu điểm. Vui lòng thử lại.";
                setNotification({
                    open: true,
                    message: errorMessage,
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

    const handleOpenDialog = (student: StudentGradeInfo, gradeType: string) => {
        setSelectedStudent(student);
        setSelectedType(gradeType);
        
        // Get current grade data based on type
        let currentGrade = null;
        let currentScore = 0;
        let currentComment = "";
        
        if (gradeType === 'ATTENDANCE' && student.attendanceGrade) {
            currentGrade = student.attendanceGrade;
            currentScore = student.attendanceScore || 0;
            currentComment = student.attendanceGrade.comment || "";
        } else if (gradeType === 'MIDTERM' && student.midtermGrade) {
            currentGrade = student.midtermGrade;
            currentScore = student.midtermScore || 0;
            currentComment = student.midtermGrade.comment || "";
        } else if (gradeType === 'FINAL' && student.finalGrade) {
            currentGrade = student.finalGrade;
            currentScore = student.finalScore || 0;
            currentComment = student.finalGrade.comment || "";
        }
        
        setScoreValue(currentScore);
        setComment(currentComment);
        setOpenDialog(true);
    };

    const handleSave = async () => {
        // Validate score (0-10)
        if (scoreValue < 0 || scoreValue > 10) {
            setNotification({
                open: true,
                message: "Điểm số không hợp lệ (phải từ 0-10).",
                severity: "error"
            });
            return;
        }

        if (!selectedStudent) return;

        try {
            setSaving(true);
            
            // Get gradeTypeId from selected type
            const gradeTypeId = SCORE_TYPES.find(t => t.value === selectedType)?.gradeTypeId || 1;
            
            // Get gradeId if updating existing grade
            let gradeId: number | null = null;
            if (selectedType === 'ATTENDANCE' && selectedStudent.attendanceGrade) {
                gradeId = selectedStudent.attendanceGrade.gradeId;
            } else if (selectedType === 'MIDTERM' && selectedStudent.midtermGrade) {
                gradeId = selectedStudent.midtermGrade.gradeId;
            } else if (selectedType === 'FINAL' && selectedStudent.finalGrade) {
                gradeId = selectedStudent.finalGrade.gradeId;
            }
            
            const request: GradeRequest = {
                enrollmentId: selectedStudent.enrollmentId,
                gradeTypeId: gradeTypeId,
                score: scoreValue,
                comment: comment || undefined
            };
            
            await saveGrade(gradeId, request);
            
            setNotification({
                open: true,
                message: gradeId ? "Cập nhật điểm thành công!" : "Nhập điểm thành công!",
                severity: "success"
            });
            setOpenDialog(false);
            fetchData(); // Reload data
        } catch (error: any) {
            console.error("Error saving grade:", error);
            const errorMessage = error?.response?.data?.message || "Lưu điểm thất bại.";
            setNotification({
                open: true,
                message: errorMessage,
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
                    {gradesData?.className || "Lớp học"}
                </Link>
                <Typography color="text.primary">Quản lý điểm</Typography>
            </Breadcrumbs>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Bảng điểm lớp học
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {gradesData?.className} - {gradesData?.courseName}
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/teacher/classes/${classId}`)}>
                    Quay lại
                </Button>
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
                                {gradesData?.students.map((student, index) => (
                                    <TableRow key={student.studentId} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Avatar 
                                                    src={student.avatar || undefined}
                                                    sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "primary.main" }}
                                                >
                                                    {!student.avatar && <Person />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{student.studentName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {student.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                size="small"
                                                variant={student.attendanceScore !== null ? "text" : "outlined"}
                                                onClick={() => handleOpenDialog(student, 'ATTENDANCE')}
                                                sx={{ minWidth: 60 }}
                                            >
                                                {student.attendanceScore !== null ? student.attendanceScore : "Nhập"}
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                size="small"
                                                variant={student.midtermScore !== null ? "text" : "outlined"}
                                                onClick={() => handleOpenDialog(student, 'MIDTERM')}
                                                sx={{ minWidth: 60 }}
                                            >
                                                {student.midtermScore !== null ? student.midtermScore : "Nhập"}
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                size="small"
                                                variant={student.finalScore !== null ? "text" : "outlined"}
                                                onClick={() => handleOpenDialog(student, 'FINAL')}
                                                sx={{ minWidth: 60 }}
                                            >
                                                {student.finalScore !== null ? student.finalScore : "Nhập"}
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {student.totalScore !== null ? student.totalScore.toFixed(2) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!gradesData || gradesData.students.length === 0) && (
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

            {/* Dialog Input/Edit Score */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedStudent && (
                        <Box>
                            <Typography variant="h6">
                                {SCORE_TYPES.find(t => t.value === selectedType)?.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Học viên: {selectedStudent.studentName}
                            </Typography>
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Loại điểm"
                            value={SCORE_TYPES.find(t => t.value === selectedType)?.label || ""}
                            fullWidth
                            disabled
                            size="small"
                        />
                        <TextField
                            label="Điểm số (0-10)"
                            type="number"
                            value={scoreValue}
                            onChange={(e) => setScoreValue(parseFloat(e.target.value) || 0)}
                            fullWidth
                            inputProps={{ min: 0, max: 10, step: 0.5 }}
                            error={scoreValue < 0 || scoreValue > 10}
                            helperText={scoreValue < 0 || scoreValue > 10 ? "Điểm phải từ 0 đến 10" : ""}
                        />
                        <TextField
                            label="Nhận xét (không bắt buộc)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Nhập nhận xét của bạn..."
                        />
                    </Box>
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
export default TeacherScoreManagement;
