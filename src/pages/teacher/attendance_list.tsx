import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    TextField,
    MenuItem,
    InputAdornment,
    LinearProgress,
    Button,
    Stack,
    Pagination,
} from "@mui/material";
import {
    Search,
    FilterList,
    School,
    AccessTime,
    Room,
    CalendarToday,
    CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import { getClassesEnrolled, getCourseFilterList } from "../../services/class_service";
import { CourseFilterData } from "../../model/class_model";

const TeacherAttendanceList: React.FC = () => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState<any[]>([]);
    const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<CourseFilterData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch courses for filter
                const courseData = await getCourseFilterList();
                setCourses(courseData);

                // Fetch teacher's classes (API)
                const classResponse = await getClassesEnrolled(1, 1000);

                const mappedClasses = classResponse.classes.map((cls) => ({
                    classId: cls.classId,
                    className: cls.className,
                    courseName: cls.courseName,
                    roomName: cls.roomName,
                    schedulePattern: cls.schedulePattern,
                    startDate: cls.startDate,
                    endDate: cls.endDate,
                    totalStudents: cls.currentEnrollment,
                    status: cls.status,
                    progress: 0,
                    totalSessions: 0,
                    completedSessions: 0
                }));

                setClasses(mappedClasses);
                setFilteredClasses(mappedClasses);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // Handle filtering
    useEffect(() => {
        let result = classes;

        if (searchTerm) {
            result = result.filter((c) =>
                c.className.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCourse !== "all") {
            result = result.filter((c) => c.courseName === selectedCourse);
        }

        setFilteredClasses(result);
        setPage(1); // Reset to first page on filter change
    }, [searchTerm, selectedCourse, classes]);

    // Pagination logic
    const pageCount = Math.ceil(filteredClasses.length / itemsPerPage);
    const displayedClasses = filteredClasses.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DangHoc":
                return "success";
            case "SapMo":
                return "warning";
            case "DaKetThuc":
                return "default";
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
            default:
                return status;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Điểm danh
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Chọn lớp học để thực hiện điểm danh
                </Typography>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 4, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm lớp học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            select
                            fullWidth
                            label="Khóa học"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">Tất cả khóa học</MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.courseId} value={course.courseName}>
                                    {course.courseName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                   
                    <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: "right" }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCourse("all");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            {/* Class List */}
            {loading ? (
                <LinearProgress />
            ) : (
                <>
                    <Grid container spacing={3}>
                        {displayedClasses.map((cls) => (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cls.classId}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "transform 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 2,
                                            }}
                                        >
                                            <Chip
                                                label={cls.courseName}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={getStatusLabel(cls.status)}
                                                size="small"
                                                color={getStatusColor(cls.status) as any}
                                            />
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {cls.className}
                                        </Typography>

                                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Room
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="body2">
                                                    Phòng: {cls.roomName}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <AccessTime
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="body2">
                                                    {cls.schedulePattern}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <CalendarToday
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="body2">
                                                    {cls.startDate} - {cls.endDate}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <School
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="body2">
                                                    Sĩ số: {cls.totalStudents} học viên
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Box sx={{ mt: "auto" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary">
                                                    Tiến độ
                                                </Typography>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {cls.completedSessions}/{cls.totalSessions} buổi ({cls.progress}%)
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={cls.progress}
                                                sx={{ height: 6, borderRadius: 3 }}
                                            />
                                        </Box>
                                    </CardContent>
                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            endIcon={<CheckCircle />}
                                            onClick={() => {
                                                navigate(`/teacher/classes/${cls.classId}/attendance`);
                                            }}
                                        >
                                            Điểm danh
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {displayedClasses.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                Không tìm thấy lớp học nào phù hợp.
                            </Typography>
                        </Box>
                    )}

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default TeacherAttendanceList;
