import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    Button,
    Stack,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Breadcrumbs,
    Link,
} from "@mui/material";
import {
    ArrowBack,
    CalendarToday,
    AccessTime,
    Room,
    School,
    Person,
    Email,
    Phone,
    Edit,
} from "@mui/icons-material";
import { getClassDetail } from "../../services/class_service";
import { ClassDetailResponse, StudentInClass } from "../../model/class_model";

const TeacherClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            if (classId) {
                try {
                    setLoading(true);
                    const detail = await getClassDetail(classId);
                    setClassDetail(detail);
                } catch (error) {
                    console.error("Error fetching class detail:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [classId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DangHoc":
                return "success";
            case "SapMo":
                return "warning";
            case "DaKetThuc":
                return "default";
            case "CanhBao":
                return "error";
            case "NghiHoc":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "DangHoc":
                return "Đang học";
            case "SapMo":
                return "Sắp mở";
            case "DaKetThuc":
                return "Đã kết thúc";
            case "CanhBao":
                return "Cảnh báo";
            case "NghiHoc":
                return "Nghỉ học";
            default:
                return status;
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    if (!classDetail) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Typography variant="h6">Không tìm thấy thông tin lớp học.</Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/teacher/classes")}>
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    // Calculate progress
    const totalSessions = classDetail.totalSessions || 0;
    const completedSessions = classDetail.sessions ? classDetail.sessions.filter(s => s.status === 'Completed').length : 0;
    const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

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
                <Typography color="text.primary">{classDetail.className}</Typography>
            </Breadcrumbs>

            {/* Header & Actions */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {classDetail.className}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={classDetail.courseName}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    </Stack>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/teacher/classes")}>
                        Quay lại
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => navigate(`/teacher/classes/${classId}/scores`)}>
                        Quản lý điểm
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/teacher/classes/${classId}/attendance`)}>
                        Điểm danh
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Class Info */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Thông tin chung
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2} textAlign="left">
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Stack spacing={3}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <CalendarToday color="action" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Thời gian học
                                                </Typography>
                                                <Typography variant="body1">
                                                    {classDetail.startDate} - {classDetail.endDate}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <AccessTime color="action" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Lịch học
                                                </Typography>
                                                <Typography variant="body1">
                                                    {classDetail.schedulePattern}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Room color="action" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Phòng học
                                                </Typography>
                                                <Typography variant="body1">{classDetail.roomName}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <School color="action" sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Sĩ số
                                                </Typography>
                                                <Typography variant="body1">
                                                    {classDetail.currentEnrollment}/{classDetail.maxCapacity} học viên
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Student List */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Danh sách học viên
                                </Typography>
                                <Chip label={`${classDetail.students ? classDetail.students.length : 0} học viên`} size="small" />
                            </Box>
                            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: "none" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Học viên</TableCell>
                                            <TableCell>Liên hệ</TableCell>
                                            <TableCell align="right">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {classDetail.students && classDetail.students.map((student) => (
                                            <TableRow key={student.studentId} hover>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "primary.main" }} src={student.avatar}>
                                                            {student.fullName.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">{student.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {student.gender ? "Nam" : "Nữ"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Phone sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
                                                            <Typography variant="caption">{student.phone}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Email sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
                                                            <Typography variant="caption">{student.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sidebar Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Tiến độ lớp học
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                                <Box sx={{ position: "relative", display: "inline-flex" }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{ width: "100%", height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Đã hoàn thành</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {completedSessions}/{totalSessions} buổi
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                                {progress}% chương trình
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Giảng viên
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {classDetail.instructorName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Giảng viên chính
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherClassDetail;
