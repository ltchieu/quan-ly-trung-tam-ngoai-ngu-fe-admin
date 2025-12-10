import { Box, Button } from "@mui/material";
import React from "react";
import { Sidebar } from "../component/sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useLogout } from "../hook/useLogout";
import UserMenu from "../component/user_menu";

type Props = {};

const MainLayout = (props: Props) => {
  const buttonSx = {
    padding: "0.5em 2em",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    textTransform: "none",
    cursor: "pointer",
    color: "#2c9caf",
    transition: "all 1000ms",
    fontSize: "15px",
    position: "relative",
    overflow: "hidden",
    outline: "2px solid #2c9caf",
    backgroundColor: "transparent",

    "&::before": {
      content: '""',
      position: "absolute",
      left: "-50px",
      top: 0,
      width: 0,
      height: "100%",
      backgroundColor: "#2c9caf",
      transform: "skewX(45deg)",
      zIndex: -1,
      transition: "width 1000ms",
    },

    "&:hover": {
      color: "#ffffff",
      transform: "scale(1.1)",
      outline: "2px solid #70bdca",
      boxShadow: "4px 5px 17px -4px #268391",
      backgroundColor: "transparent",

      "&::before": {
        width: "250%",
      },
    },

    "&:active": {
      transform: "scale(1.05)",
    },
  };

  const navigate = useNavigate();
  const { auth } = useAuth();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, py: 2, backgroundColor: "#F9FAFB" }}
      >
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 7, mr: 7 }}>
          {auth?.accessToken ? (
            <UserMenu />
          ) : (
            <Button onClick={() => navigate("/login")} sx={buttonSx}>
              Log in
            </Button>
          )}
        </Box>
        <Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
