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
    TextField,
    Avatar
} from "@mui/material";
import {
    ArrowBack,
    Save,
    Person
} from "@mui/icons-material";
import { getClassGrades, saveGrade } from "../../services/score_service";
import { SCORE_TYPES, GradeRequest, ClassGradesResponse, StudentGradeInfo } from "../../model/score_model";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";

const TeacherScoreManagement: React.FC = () => {
    useAxiosPrivate();
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [gradesData, setGradesData] = useState<ClassGradesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState(false);

    // Edited scores tracking
    const [editedScores, setEditedScores] = useState<Map<string, {
        studentId: number;
        gradeType: string;
        score: number;
        gradeId?: number;
        enrollmentId: number;
    }>>(new Map());

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

    const handleScoreChange = (student: StudentGradeInfo, gradeType: string, value: string) => {
        // Allow empty value (user is deleting/clearing the field)
        if (value === '') {
            const key = `${student.studentId}-${gradeType}`;
            const newEditedScores = new Map(editedScores);
            newEditedScores.delete(key); // Remove from edited scores if clearing
            setEditedScores(newEditedScores);
            return;
        }

        const score = parseFloat(value);
        // Validate score range
        if (isNaN(score) || score < 0 || score > 10) return;

        const key = `${student.studentId}-${gradeType}`;
        let gradeId: number | undefined;

        // Get gradeId from existing grade
        if (gradeType === 'ATTENDANCE' && student.attendanceGrade) {
            gradeId = student.attendanceGrade.gradeId;
        } else if (gradeType === 'MIDTERM' && student.midtermGrade) {
            gradeId = student.midtermGrade.gradeId;
        } else if (gradeType === 'FINAL' && student.finalGrade) {
            gradeId = student.finalGrade.gradeId;
        }

        const newEditedScores = new Map(editedScores);
        newEditedScores.set(key, {
            studentId: student.studentId,
            gradeType,
            score,
            gradeId,
            enrollmentId: student.enrollmentId
        });
        setEditedScores(newEditedScores);
    };

    const handleSaveAll = async () => {
        if (editedScores.size === 0) {
            setNotification({
                open: true,
                message: "Không có thay đổi nào để lưu.",
                severity: "warning"
            });
            return;
        }

        try {
            setSaving(true);
            let successCount = 0;
            let errorCount = 0;

            // Save all edited scores
            const entries = Array.from(editedScores.entries());
            for (const [key, data] of entries) {
                try {
                    const gradeTypeId = SCORE_TYPES.find(t => t.value === data.gradeType)?.gradeTypeId || 1;
                    
                    const request: GradeRequest = {
                        enrollmentId: data.enrollmentId,
                        gradeTypeId: gradeTypeId,
                        score: data.score,
                        comment: undefined
                    };
                    
                    await saveGrade(data.gradeId || null, request);
                    successCount++;
                } catch (error) {
                    console.error(`Error saving score for ${key}:`, error);
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                setNotification({
                    open: true,
                    message: `Lưu thành công ${successCount} điểm!`,
                    severity: "success"
                });
                setEditedScores(new Map()); // Clear edited scores
                fetchData(); // Reload data
            } else {
                setNotification({
                    open: true,
                    message: `Lưu thành công ${successCount} điểm, thất bại ${errorCount} điểm.`,
                    severity: "warning"
                });
                fetchData();
            }
        } catch (error: any) {
            console.error("Error saving grades:", error);
            setNotification({
                open: true,
                message: "Có lỗi xảy ra khi lưu điểm.",
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
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button 
                        variant="contained" 
                        startIcon={<Save />} 
                        onClick={handleSaveAll}
                        disabled={editedScores.size === 0 || saving}
                    >
                        Lưu thay đổi {editedScores.size > 0 && `(${editedScores.size})`}
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/teacher/classes/${classId}`)}>
                        Quay lại
                    </Button>
                </Box>
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
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={editedScores.get(`${student.studentId}-ATTENDANCE`)?.score ?? student.attendanceScore ?? ''}
                                                onChange={(e) => handleScoreChange(student, 'ATTENDANCE', e.target.value)}
                                                placeholder="0-10"
                                                inputProps={{ min: 0, max: 10, step: 0.5 }}
                                                sx={{ 
                                                    width: 80,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderColor: editedScores.has(`${student.studentId}-ATTENDANCE`) ? 'warning.main' : undefined,
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: editedScores.has(`${student.studentId}-ATTENDANCE`) ? 'warning.main' : 'primary.main'
                                                        }
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={editedScores.get(`${student.studentId}-MIDTERM`)?.score ?? student.midtermScore ?? ''}
                                                onChange={(e) => handleScoreChange(student, 'MIDTERM', e.target.value)}
                                                placeholder="0-10"
                                                inputProps={{ min: 0, max: 10, step: 0.5 }}
                                                sx={{ 
                                                    width: 80,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderColor: editedScores.has(`${student.studentId}-MIDTERM`) ? 'warning.main' : undefined,
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: editedScores.has(`${student.studentId}-MIDTERM`) ? 'warning.main' : 'primary.main'
                                                        }
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={editedScores.get(`${student.studentId}-FINAL`)?.score ?? student.finalScore ?? ''}
                                                onChange={(e) => handleScoreChange(student, 'FINAL', e.target.value)}
                                                placeholder="0-10"
                                                inputProps={{ min: 0, max: 10, step: 0.5 }}
                                                sx={{ 
                                                    width: 80,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderColor: editedScores.has(`${student.studentId}-FINAL`) ? 'warning.main' : undefined,
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: editedScores.has(`${student.studentId}-FINAL`) ? 'warning.main' : 'primary.main'
                                                        }
                                                    }
                                                }}
                                            />
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
