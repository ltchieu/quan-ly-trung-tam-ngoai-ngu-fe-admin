import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useRefreshToken } from "../hook/useRefreshToken";
import { CircularProgress, Box } from "@mui/material";


const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        console.log("🔄 PersistLogin: Verifying refresh token...");
        await refresh();
        console.log("✅ PersistLogin: Token refreshed successfully");
      } catch (error) {
        console.error("❌ PersistLogin: Token refresh failed", error);
      } finally {
        isMounted && setIsLoading(false);
      }
    };
    
    // Đọc persist flag từ localStorage
    const persist = localStorage.getItem("persist") === "true";

    // CRITICAL: Logic theo Dave Gray
    if (!persist) {
      // Không có persist → skip loading ngay
      console.log("⏭️ No persist flag, skipping token refresh");
      setIsLoading(false);
    }
    else if (!auth?.accessToken) {
      // Có persist nhưng chưa có token → PHẢI refresh trước khi render routes
      console.log("🔑 Persist enabled, no token - attempting refresh");
      verifyRefreshToken();
    } 
    else {
      // Đã có token → skip loading
      console.log("✅ Token already exists, skipping refresh");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <div style={{ color: "#666", fontSize: "14px" }}>
          Đang xác thực...
        </div>
      </Box>
    );
  }
  return <Outlet />;
};

export default PersistLogin;
