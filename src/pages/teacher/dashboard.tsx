import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    School,
    CalendarToday,
    People,
    AccessTime,
    CheckCircle,
    Warning,
    EventNote,
} from "@mui/icons-material";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getLecturerDashboardStats } from "../../services/teacher_service";
import { LecturerDashboardStatsResponse } from "../../model/teacher_model";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TeacherDashboard: React.FC = () => {
    useAxiosPrivate();
    const [dashboardData, setDashboardData] = useState<LecturerDashboardStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await getLecturerDashboardStats();
                setDashboardData(data);
                setError("");
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Không thể tải dữ liệu dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Chart data from API
    const chartData = dashboardData ? {
        labels: dashboardData.attendanceStats.map(stat => stat.className),
        datasets: [
            {
                label: 'Tỷ lệ đi học (%)',
                data: dashboardData.attendanceStats.map(stat => stat.attendancePercent),
                backgroundColor: '#4caf50',
            },
            {
                label: 'Tỷ lệ vắng (%)',
                data: dashboardData.attendanceStats.map(stat => stat.absentPercent),
                backgroundColor: '#f44336',
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !dashboardData) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error || "Không có dữ liệu"}</Alert>
            </Container>
        );
    }

    const { overview, weeklySchedule, activeClasses, reminders } = dashboardData;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
                Dashboard Giảng viên
            </Typography>

            {/* 1. Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ bgcolor: "#e3f2fd", height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <School color="primary" fontSize="large" />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {overview.classesInCharge}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lớp đang phụ trách
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ bgcolor: "#fff3e0", height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <CalendarToday color="warning" fontSize="large" />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {overview.todayClasses}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lớp dạy hôm nay
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ bgcolor: "#e8f5e9", height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <People color="success" fontSize="large" />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {overview.totalStudents}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng học viên
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ bgcolor: "#f3e5f5", height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <AccessTime color="secondary" fontSize="large" />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {overview.hoursTaught}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Giờ dạy trong tháng
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* 2. Weekly Schedule (Today) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3, height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Lịch dạy hôm nay
                            </Typography>
                            <List>
                                {weeklySchedule.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemIcon>
                                                <EventNote color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {item.className}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {item.time} | {item.room}
                                                        </Typography>
                                                        <br />
                                                        <Chip
                                                            label={item.status}
                                                            color="primary"
                                                            size="small"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    </React.Fragment>
                                                }
                                                secondaryTypographyProps={{ component: 'div' }}
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 4. Reminders */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ mb: 3, height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Nhắc nhở
                            </Typography>
                            <Stack spacing={2}>
                                {reminders.map((item) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            p: 2,
                                            bgcolor: item.type === "warning" ? "#fff3e0" : "#e3f2fd",
                                            borderRadius: 1,
                                            borderLeft: `4px solid ${item.type === "warning" ? "#ff9800" : "#2196f3"
                                                }`,
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="start">
                                            {item.type === "warning" ? (
                                                <Warning color="warning" fontSize="small" />
                                            ) : (
                                                <CheckCircle color="info" fontSize="small" />
                                            )}
                                            <Typography variant="body2">{item.message}</Typography>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 3. Active Classes List */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Lớp đang phụ trách
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tên lớp</TableCell>
                                            <TableCell>Khóa học</TableCell>
                                            <TableCell align="center">Sĩ số</TableCell>
                                            <TableCell>Tiến độ</TableCell>
                                            <TableCell align="center">Hành động</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activeClasses.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell sx={{ fontWeight: "bold" }}>{row.className}</TableCell>
                                                <TableCell>{row.course}</TableCell>
                                                <TableCell align="center">{row.students}</TableCell>
                                                <TableCell sx={{ width: 200 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Box sx={{ width: "100%", mr: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={row.progressPercent}
                                                            />
                                                        </Box>
                                                        <Box sx={{ minWidth: 35 }}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >{`${row.progress}`}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                                                        Điểm danh
                                                    </Button>
                                                    <Button size="small" variant="text">
                                                        DS Lớp
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 5. Statistics */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Tỷ lệ chuyên cần
                            </Typography>
                            {chartData && <Bar options={chartOptions} data={chartData} />}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherDashboard;
