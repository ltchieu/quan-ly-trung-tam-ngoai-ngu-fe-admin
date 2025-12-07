import { NeatConfig, NeatGradient } from "@firecms/neat";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyResetCodeService, resetPasswordService } from "../services/auth_service";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ResetPassword = () => {
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

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isHideNewPassword, setIsHideNewPassword] = useState<boolean>(true);
  const [isHideConfirmPassword, setIsHideConfirmPassword] = useState<boolean>(true);
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

  // Verify reset code when component mounts
  useEffect(() => {
    const verifyCode = async () => {
      if (!code) {
        setError("Mã xác minh không hợp lệ. Vui lòng kiểm tra lại link trong email.");
        setVerifying(false);
        return;
      }

      try {
        const response = await verifyResetCodeService(code);
        if (response.data && response.data.email) {
          setEmail(response.data.email);
        }
        setVerifying(false);
      } catch (err: any) {
        setError(err.message || "Mã xác minh không hợp lệ hoặc đã hết hạn.");
        setVerifying(false);
      }
    };

    verifyCode();
  }, [code]);

  useEffect(() => {
    const passwordValid = newPassword.length >= 6;
    const passwordsMatch = newPassword === confirmPassword && newPassword !== "";
    setIsDisable(!passwordValid || !passwordsMatch);
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setError(null);
    setLoading(true);

    try {
      await resetPasswordService(code, newPassword, confirmPassword);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
        {verifying ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={60} sx={{ color: "#005F73", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Đang xác minh mã...
            </Typography>
          </Box>
        ) : success ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="#4caf50" gutterBottom>
              Đặt lại mật khẩu thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Mật khẩu của bạn đã được cập nhật. Đang chuyển đến trang đăng nhập...
            </Typography>
            <CircularProgress size={30} sx={{ color: "#005F73" }} />
          </Box>
        ) : error && !email ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <LockResetIcon sx={{ fontSize: 60, color: "#f44336", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="#f44336" gutterBottom>
              Lỗi xác minh
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate("/forgot-password")}
              sx={{
                backgroundColor: "#005F73",
                textTransform: "none",
                "&:hover": { backgroundColor: "#004E64" },
              }}
            >
              Yêu cầu lại link reset password
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <LockResetIcon sx={{ fontSize: 60, color: "#005F73", mb: 2 }} />
              <Typography variant="h4" fontWeight={700} color="#004E64" gutterBottom>
                Đặt lại mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: <strong>{email}</strong>
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Mật khẩu mới"
                type={isHideNewPassword ? "password" : "text"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setIsHideNewPassword(!isHideNewPassword)}
                        edge="end"
                      >
                        <FontAwesomeIcon
                          icon={isHideNewPassword ? faEyeSlash : faEye}
                          style={{ fontSize: "18px" }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  newPassword && newPassword.length < 6
                    ? "Mật khẩu phải có ít nhất 6 ký tự"
                    : ""
                }
                error={newPassword !== "" && newPassword.length < 6}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                type={isHideConfirmPassword ? "password" : "text"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                placeholder="Nhập lại mật khẩu mới"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setIsHideConfirmPassword(!isHideConfirmPassword)}
                        edge="end"
                      >
                        <FontAwesomeIcon
                          icon={isHideConfirmPassword ? faEyeSlash : faEye}
                          style={{ fontSize: "18px" }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  confirmPassword && confirmPassword !== newPassword
                    ? "Mật khẩu không khớp"
                    : ""
                }
                error={confirmPassword !== "" && confirmPassword !== newPassword}
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
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Button
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
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
