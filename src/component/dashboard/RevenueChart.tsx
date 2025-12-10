import React from "react";
import { Card, CardHeader, CardContent, Box } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { RevenueChartData } from "../../model/dashboard_model";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    data: RevenueChartData[];
}

export const RevenueChart: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((d) => `Tháng ${d.month}`),
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data: data.map((d) => d.revenue),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value: any) => `${value / 1000000}M`,
                },
            },
        },
    };

    return (
        <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
            <CardHeader title="Doanh thu năm nay" />
            <CardContent>
                <Box sx={{ height: 350, position: "relative" }}>
                    <Line data={chartData} options={options} />
                </Box>
            </CardContent>
        </Card>
    );
};
