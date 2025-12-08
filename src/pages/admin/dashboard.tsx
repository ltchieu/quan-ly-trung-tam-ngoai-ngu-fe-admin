import React, { useEffect, useState } from "react";
import { Container, Typography, Breadcrumbs, CircularProgress, Box, Grid } from "@mui/material";
import { KPICards } from "../../component/dashboard/KPICards";
import { RevenueChart } from "../../component/dashboard/RevenueChart";
import { TopCourses } from "../../component/dashboard/TopCourses";
import { PaymentMethodChart } from "../../component/dashboard/PaymentMethodChart";
import { TrainingStats } from "../../component/dashboard/TrainingStats";
import { LecturerStats } from "../../component/dashboard/LecturerStats";
import { RecentActivities } from "../../component/dashboard/RecentActivities";
import {
  getDashboardData,
  DashboardData,
} from "../../services/dashboard_service";


const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Tổng quan
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* 1. Overview (KPI Cards) */}
        <section>
          <KPICards data={data.kpi} />
        </section>

        {/* 2. Financial & Business Statistics */}
        <section>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Thống kê Kinh doanh & Tài chính
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ md: 8, xs: 12 }}>
              <RevenueChart data={data.annualRevenue} />
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <PaymentMethodChart data={data.paymentMethods} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TopCourses data={data.topCourses} />
            </Grid>
          </Grid>
        </section>

        {/* 3. Training Statistics */}
        <section>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Thống kê Đào tạo
          </Typography>
          <TrainingStats
            progress={data.courseProgress}
            schedule={data.classSchedule}
            endingClasses={data.endingClasses}
          />
        </section>

        {/* 4. Lecturer & Personnel Statistics */}
        <section>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Thống kê Giảng viên & Nhân sự
          </Typography>
          <LecturerStats
            topLecturers={data.topLecturers}
            distribution={data.lecturerDistribution}
          />
        </section>

        {/* 5. Recent Activities */}
        <section>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Hoạt động Hệ thống
          </Typography>
          <RecentActivities limit={15} autoRefresh={true} refreshInterval={30} />
        </section>
      </Box>
    </Container>
  );
};

export default DashboardPage;
