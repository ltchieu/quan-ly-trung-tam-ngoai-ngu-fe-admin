import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Breadcrumbs,
    Link,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Snackbar,
    Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { getRoomById } from "../../services/room_service";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";
import { RoomDetailResponse } from "../../model/room_model";

const RoomDetailPage: React.FC = () => {
    useAxiosPrivate();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [roomDetail, setRoomDetail] = useState<RoomDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        if (id) {
            fetchRoomDetail();
        }
    }, [id]);

    const fetchRoomDetail = async () => {
        try {
            setLoading(true);
            const data = await getRoomById(Number(id));
            setRoomDetail(data);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.response?.data?.message || "Không thể tải thông tin phòng học";
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!roomDetail) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">Không tìm thấy thông tin phòng học</Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/rooms")}
                    sx={{ mt: 2 }}
                >
                    Quay lại
                </Button>
            </Container>
        );
    }

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
                        navigate("/rooms");
                    }}
                >
                    Quản lý phòng học
                </Link>
                <Typography color="text.primary">Chi tiết phòng học</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Chi tiết phòng học
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/admin/rooms")}
                >
                    Quay lại
                </Button>
            </Box>

            {/* Room Information Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Thông tin phòng học
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: "medium", width: 150 }}>
                                Mã phòng:
                            </Typography>
                            <Typography variant="body1">{roomDetail.roomId}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: "medium", width: 150 }}>
                                Tên phòng:
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                {roomDetail.roomName}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: "medium", width: 150 }}>
                                Sức chứa:
                            </Typography>
                            <Typography variant="body1">{roomDetail.capacity} học viên</Typography>
                        </Box>
                        <Box sx={{ display: "flex", mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: "medium", width: 150 }}>
                                Trạng thái:
                            </Typography>
                            <Chip
                                label={roomDetail.status || "N/A"}
                                color={roomDetail.status === "available" ? "success" : "default"}
                                size="small"
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RoomDetailPage;
