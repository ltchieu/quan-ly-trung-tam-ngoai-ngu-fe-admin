import { NeatConfig, NeatGradient } from "@firecms/neat";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordService } from "../services/auth_service";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ForgotPassword = () => {
  const gradientConfig: NeatConfig = {
    colors: [
      { color: "#005F73", enabled: true },
      { color: "#0A9396", enabled: true },
      { color: "#94D2BD", enabled: true },
      { color: "#E9D8A6", enabled: true },
      { color: "#EE9B00", enabled: false },
    ],
    speed: 3,
    horizontalPressure: 5,
    verticalPressure: 7,
    waveFrequencyX: 2,
    waveFrequencyY: 2,
    waveAmplitude: 8,
    shadows: 6,
    highlights: 8,
    colorBrightness: 1,
    colorSaturation: 7,
    wireframe: false,
    colorBlending: 10,
    backgroundColor: "#004E64",
    backgroundAlpha: 1,
    grainScale: 3,
    grainSparsity: 0,
    grainIntensity: 0.3,
    grainSpeed: 1,
    resolution: 1,
    yOffset: 0,
  };

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDisable, setIsDisable] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (canvasRef.current) {
      const neat = new NeatGradient({
        ref: canvasRef.current,
        ...gradientConfig,
      });
      return () => {
        neat.destroy();
      };
    }
  }, []);

  useEffect(() => {
    setIsDisable(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await forgotPasswordService(email);
      setSuccess(response.message || "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
      setEmail(""); // Clear form after success
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <Paper
        elevation={10}
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: "90%", sm: "450px" },
          padding: 4,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <EmailIcon sx={{ fontSize: 60, color: "#005F73", mb: 2 }} />
          <Typography variant="h4" fontWeight={700} color="#004E64" gutterBottom>
            Quên mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
            placeholder="example@email.com"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isDisable || loading}
            sx={{
              backgroundColor: "#005F73",
              color: "white",
              padding: "12px",
              fontSize: "16px",
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              mb: 2,
              "&:hover": {
                backgroundColor: "#004E64",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            {loading ? "Đang gửi..." : "Gửi email"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/login")}
              sx={{
                color: "#005F73",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
