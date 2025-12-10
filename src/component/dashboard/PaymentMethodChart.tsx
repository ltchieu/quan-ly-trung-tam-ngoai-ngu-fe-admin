import React from "react";
import { Card, CardHeader, CardContent, Box } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PaymentMethodData } from "../../model/dashboard_model";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    data: PaymentMethodData[];
}

export const PaymentMethodChart: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((d) => d.method),
        datasets: [
            {
                data: data.map((d) => d.count),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
            },
        },
    };

    return (
        <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
            <CardHeader title="Phương thức thanh toán" />
            <CardContent>
                <Box sx={{ height: 300, position: "relative" }}>
                    <Pie data={chartData} options={options} />
                </Box>
            </CardContent>
        </Card>
    );
};
