// src/pages/DashboardPage.tsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { SummaryCard } from "../component/summary_card";
import { SalesChart } from "../component/sale_card";
import { TrafficSourceChart } from "../component/traffic_source";
import { Sidebar } from "../component/sidebar";

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth={false}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Overview
      </Typography>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <SummaryCard
            title="Budget"
            value="$24k"
            icon={<AttachMoneyIcon />}
            iconBgColor="primary.main"
            change={12}
          />
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <SummaryCard
            title="Total Customers"
            value="1.6k"
            icon={<PeopleIcon />}
            iconBgColor="success.main"
            change={-16}
          />
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          
          <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              
              <Typography color="text.secondary" variant="overline">
                Task Progress
              </Typography>
              <Typography variant="h4">75.5%</Typography>
              {/* Add a LinearProgress component here */}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <SummaryCard
            title="Total Profit"
            value="$15k"
            icon={<MonetizationOnIcon />}
            iconBgColor="warning.main"
          />
        </Grid>

        {/* Charts */}
        <Grid size={{ md: 8, sm: 12, xs: 12 }}>
          <SalesChart />
        </Grid>
        <Grid size={{ md: 4, sm: 6, xs: 12 }}>
          <TrafficSourceChart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
