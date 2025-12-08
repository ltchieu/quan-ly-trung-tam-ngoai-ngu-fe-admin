import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import logo from "../img/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faCalendar, faChalkboardUser, faTicket, faUsers, faUserTie, faList, faDoorOpen, faUserPlus, faReceipt } from "@fortawesome/free-solid-svg-icons";

const drawerWidth = 280;

const navItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "/" },
  { text: "Khóa học", icon: <FontAwesomeIcon icon={faBook} />, path: "/courses" },
  { text: "Lớp học", icon: <FontAwesomeIcon icon={faChalkboardUser} />, path: "/class" },
  { text: "Ca học", icon: <FontAwesomeIcon icon={faCalendar} />, path: "/schedule" },
  { text: "Học viên", icon: <FontAwesomeIcon icon={faUsers} />, path: "/students" },
  { text: "Đăng ký cho học viên", icon: <FontAwesomeIcon icon={faUserPlus} />, path: "/enroll-student" },
  { text: "Hóa đơn", icon: <FontAwesomeIcon icon={faReceipt} />, path: "/admin/invoices" },
  { text: "Giảng viên", icon: <FontAwesomeIcon icon={faUserTie} />, path: "/teachers" },
  { text: "Khuyến mãi", icon: <FontAwesomeIcon icon={faTicket} />, path: "/promotions" },
  { text: "Danh mục", icon: <FontAwesomeIcon icon={faList} />, path: "/categories" },
  { text: "Phòng học", icon: <FontAwesomeIcon icon={faDoorOpen} />, path: "/rooms" },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();

  const getNavItems = () => {
    if (role === "TEACHER") {
      return [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/teacher/dashboard" },
        { text: "Lịch dạy", icon: <FontAwesomeIcon icon={faCalendar} />, path: "/teacher/schedule" },
        { text: "Lớp phụ trách", icon: <FontAwesomeIcon icon={faChalkboardUser} />, path: "/teacher/classes" },
        { text: "Điểm danh", icon: <FontAwesomeIcon icon={faUsers} />, path: "/teacher/attendance" },
      ];
    }
    // Default to ADMIN items
    return navItems;
  };

  const displayNavItems = getNavItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#111827",
          color: "#FFFFFF",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Phần logo */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Box
              component="img"
              src={logo}
              sx={{ width: "50%", mr: 1, filter: "brightness(0) invert(1)" }}
            />
          </Box>
          <Box
            sx={{
              border: "1px solid #4B5563",
              borderRadius: 3,
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="body2" color="#D1D5DB">
                Workspace
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                Devias
              </Typography>
            </Box>
            <UnfoldMoreIcon sx={{ color: "#9CA3AF" }} />
          </Box>
        </Box>
      </Box>

      {/* Phần các mục điều hướng */}
      <List sx={{ px: 2 }}>
        {displayNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={item.text}
              style={{ textDecoration: "none" }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? "#635bff" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "white" : "#9CA3AF",
                      minWidth: "auto",
                      mr: 2,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiTypography-root": {
                        color: isActive ? "#FFFFFF" : "#9CA3AF",
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Drawer>
  );
};
