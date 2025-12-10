import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import BlockIcon from "@mui/icons-material/Block";

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const { auth } = useAuth();

    const handleGoHome = () => {
        // Redirect based on role
        if (auth.role === "TEACHER") {
            navigate("/teacher/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <BlockIcon sx={{ fontSize: 80, color: "error.main" }} />
                </Box>

                <Typography variant="h3" fontWeight="bold" color="error.main" gutterBottom>
                    403
                </Typography>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Không có quyền truy cập
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên
                    nếu bạn cho rằng đây là lỗi.
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGoHome}
                >
                    Về trang chủ
                </Button>
            </Paper>
        </Container>
    );
};

export default Unauthorized;
