import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { PromotionResponse } from "../../model/promotion_model";
import { getAllPromotions, deletePromotion } from "../../services/promotion_service";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";
import dayjs from "dayjs";

const PromotionListPage: React.FC = () => {
  useAxiosPrivate();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const promoData = await getAllPromotions();
      setPromotions(promoData);
    } catch (error: any) {
      console.error("Failed to fetch data", error);
      setError(error.message || "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "tắt" : "bật";
    if (window.confirm(`Bạn có chắc chắn muốn ${action} khuyến mãi này?`)) {
      try {
        await deletePromotion(id); // This is now togglePromotionStatus
        fetchData();
      } catch (error: any) {
        console.error("Failed to toggle promotion status", error);
        alert(error.message || "Thay đổi trạng thái khuyến mãi thất bại");
      }
    }
  };

  // Get unique promotion types from the data
  const promotionTypes = Array.from(
    new Set(promotions.map(p => p.promotionTypeName))
  ).map((name, index) => ({
    id: promotions.find(p => p.promotionTypeName === name)?.promotionTypeId || index,
    name: name
  }));

  const filteredPromotions = promotions.filter((p) => {
    if (filterType === "ALL") return true;
    return p.promotionTypeId === Number(filterType);
  });

  const getTypeColor = (typeId: number) => {
    switch (typeId) {
      case 1: // Khuyến mãi học lẻ
        return "success";
      case 2: // Khuyến mãi combo
        return "primary";
      case 3: // Khuyến mãi học viên cũ
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        <Typography color="text.primary">Quản lý Khuyến mãi</Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          Danh sách Khuyến mãi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/promotions/add")}
        >
          Thêm Khuyến mãi
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Loại khuyến mãi</InputLabel>
          <Select
            value={filterType}
            label="Loại khuyến mãi"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            {promotionTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Tên chương trình</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Thời gian</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không có khuyến mãi nào.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promo) => (
                <TableRow key={promo.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {promo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {promo.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={promo.promotionTypeName}
                      color={getTypeColor(promo.promotionTypeId)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dayjs(promo.startDate).format("DD/MM/YYYY")} -{" "}
                      {dayjs(promo.endDate).format("DD/MM/YYYY")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={promo.active ? "Đang chạy" : "Tạm dừng"}
                      color={promo.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/promotions/${promo.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color={promo.active ? "error" : "success"}
                      onClick={() => handleToggleStatus(promo.id, promo.active)}
                      title={promo.active ? "Tắt khuyến mãi" : "Bật khuyến mãi"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PromotionListPage;
