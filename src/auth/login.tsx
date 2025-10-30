import { NeatConfig, NeatGradient } from "@firecms/neat";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  TypographyProps,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { LoginRequest } from "../model/auth_model";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { loginService } from "../services/auth_service";

const Login = () => {
  const gradientConfig: NeatConfig = {
    colors: [
        {
            color: '#005F73',
            enabled: true,
        },
        {
            color: '#0A9396',
            enabled: true,
        },
        {
            color: '#94D2BD',
            enabled: true,
        },
        {
            color: '#E9D8A6',
            enabled: true,
        },
        {
            color: '#EE9B00',
            enabled: false,
        },
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
    backgroundColor: '#004E64',
    backgroundAlpha: 1,
    grainScale: 3,
    grainSparsity: 0,
    grainIntensity: 0.3,
    grainSpeed: 1,
    resolution: 1,
    yOffset: 0,
  };

  const labelProps: TypographyProps = {
    variant: "body1",
    color: "black",
    textAlign: "left",
  };

  const [loginValue, setLoginValue] = useState<LoginRequest>({
    identifier: "",
    password: "",
  });

  const { login } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDisable, setIsDisable] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginValue((prevData) => {
      const newData = { ...prevData, [name]: value };

      const allFilled = Object.values(newData).every(
        (val) => val !== "" && val !== null && val !== undefined
      );

      setIsDisable(!allFilled);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    setError(null);

    try {
      const loginData = await loginService(loginValue);
      console.log("Đăng nhập thành công:", loginData);

      login(loginData);

      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        '& a[href="https://neat.firecms.co"]': {
          display: "none !important",
          visibility: "hidden !important",
        },
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          borderRadius: "10px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            zIndex: 2,
            width: "400px",
            padding: "24px",
            backgroundColor: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            color: "white",
            margin: "auto",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="black">
            Log in
          </Typography>

          <Box sx={{ textAlign: "left", mt: 4 }}>
            <Typography {...labelProps} sx={{ mb: 1 }}>
              Email
            </Typography>

            <TextField
              placeholder="Nhập địa chỉ email của bạn"
              required
              name="identifier"
              type="text"
              fullWidth
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ textAlign: "left", mt: 3 }}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography {...labelProps} sx={{ mb: 1 }}>
                Password
              </Typography>
              <Button
                sx={{ color: "darkgray", textTransform: "none" }}
                startIcon={
                  <FontAwesomeIcon icon={faEyeSlash} color="darkgray" />
                }
              >
                Hide
              </Button>
            </Box>

            <TextField
              placeholder="Nhập password"
              onChange={handleChange}
              required
              type="password"
              name="password"
              fullWidth
              sx={{ mb: "5px" }}
            />
            <a
              href="#"
              style={{
                color: "black",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Forgot password
            </a>
          </Box>

          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={isDisable}
            loading={loading}
            sx={{
              borderRadius: 20,
              textTransform: "none",
              backgroundColor: "#0A9396",
              color: "white",
              mt: 3,
              fontSize: 20,
            }}
          >
            Log in
          </Button>

          <Typography color="error" sx={{ mt: 3 }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
