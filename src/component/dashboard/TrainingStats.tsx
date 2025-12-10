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
    Chip,
    IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { CanceledSessionData, CourseProgressData, EndingClassData } from "../../model/dashboard_model";
import { useNavigate } from "react-router-dom";

interface Props {
    progress: CourseProgressData[];
    canceledSessions: CanceledSessionData[];
    endingClasses: EndingClassData[];
}

export const TrainingStats: React.FC<Props> = ({
    progress,
    canceledSessions,
    endingClasses,
}) => {
    const navigate = useNavigate();

    const handleViewSchedule = (classId: number) => {
        navigate(`/schedule?classId=${classId}`);
    };

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

            {/* Canceled Sessions */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Buổi học đã hủy" />
                    <CardContent>
                        <List dense>
                            {canceledSessions.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                    Không có buổi học nào bị hủy
                                </Typography>
                            ) : (
                                canceledSessions.map((session) => (
                                    <React.Fragment key={session.sessionId}>
                                        <ListItem 
                                            disablePadding 
                                            sx={{ mb: 2, display: 'block' }}
                                            secondaryAction={
                                                <IconButton 
                                                    edge="end" 
                                                    size="small"
                                                    onClick={() => handleViewSchedule(session.classId)}
                                                    title="Xem lịch học"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {session.className}
                                                </Typography>
                                                {session.hasMakeupSession ? (
                                                    <Chip 
                                                        icon={<CheckCircleIcon />}
                                                        label="Đã có bù" 
                                                        size="small" 
                                                        color="success" 
                                                        variant="outlined"
                                                        sx={{ height: 20 }}
                                                    />
                                                ) : (
                                                    <Chip 
                                                        icon={<CancelIcon />}
                                                        label="Chưa bù" 
                                                        size="small" 
                                                        color="error" 
                                                        variant="outlined"
                                                        sx={{ height: 20 }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                                                {session.courseName}
                                            </Typography>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Ngày hủy: {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
                                            </Typography>
                                            {session.hasMakeupSession && session.makeupSessionDate && (
                                                <Typography variant="caption" display="block" color="success.main">
                                                    Ngày bù: {new Date(session.makeupSessionDate).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            )}
                                            {session.cancelReason && (
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    Lý do: {session.cancelReason}
                                                </Typography>
                                            )}
                                        </ListItem>
                                        <Divider sx={{ mb: 2 }} />
                                    </React.Fragment>
                                ))
                            )}
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
