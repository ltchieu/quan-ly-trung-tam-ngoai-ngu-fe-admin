import { Box } from "@mui/material";
import React from "react";
import { Sidebar } from "../component/sidebar";
import { Outlet } from "react-router-dom";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, py: 8, backgroundColor: "#F9FAFB" }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
