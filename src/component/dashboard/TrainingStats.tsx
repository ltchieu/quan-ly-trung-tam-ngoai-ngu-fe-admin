import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    Typography,
    LinearProgress,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    CourseProgressData,
    ClassScheduleData,
    EndingClassData,
} from "../../services/dashboard_service";

interface Props {
    progress: CourseProgressData[];
    schedule: ClassScheduleData[];
    endingClasses: EndingClassData[];
}

export const TrainingStats: React.FC<Props> = ({
    progress,
    schedule,
    endingClasses,
}) => {
    return (
        <Grid container spacing={3}>
            {/* Course Progress */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Tiến độ khóa học" />
                    <CardContent>
                        <List dense>
                            {progress.map((item) => (
                                <ListItem key={item.classId} disablePadding sx={{ mb: 2, display: 'block' }}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.className}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.completedSessions}/{item.totalSessions} buổi ({Math.round(item.progressRate)}%)
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={item.progressRate}
                                        color={
                                            item.progressRate < 50
                                                ? "error"
                                                : item.progressRate >= 90
                                                    ? "success"
                                                    : "primary"
                                        }
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* Class Schedule */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Phân bổ khung giờ" />
                    <CardContent>
                        <List>
                            {schedule.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText primary={item.timeFrame} secondary={`${item.count} lớp`} />
                                    </ListItem>
                                    {index < schedule.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* Ending Classes */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Lớp học sắp kết thúc" />
                    <CardContent>
                        <List dense>
                            {endingClasses.map((item) => (
                                <ListItem key={item.classId} disablePadding sx={{ mb: 2, display: 'block' }}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.className}
                                        </Typography>
                                        <Typography variant="caption" color={item.remainingSessions <= 2 ? "error.main" : "text.secondary"} fontWeight={item.remainingSessions <= 2 ? "bold" : "normal"}>
                                            Còn {item.remainingSessions} buổi
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                                        {item.courseName}
                                    </Typography>
                                    <Typography variant="caption" display="block" color={item.remainingSessions === 0 ? "error.main" : "text.secondary"}>
                                        Kết thúc: {new Date(item.endDate).toLocaleDateString('vi-VN')}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
