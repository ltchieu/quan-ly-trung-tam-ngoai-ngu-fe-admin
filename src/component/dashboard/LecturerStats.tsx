import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { LecturerProductivityData, LecturerDistributionData } from "../../model/dashboard_model";


interface Props {
    topLecturers: LecturerProductivityData[];
    distribution: LecturerDistributionData[];
}

export const LecturerStats: React.FC<Props> = ({
    topLecturers,
    distribution,
}) => {
    const pieData = {
        labels: distribution.map((d) => d.status),
        datasets: [
            {
                data: distribution.map((d) => d.count),
                backgroundColor: ["#4caf50", "#ff9800"],
                borderWidth: 1,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
            },
        },
    };

    return (
        <Grid container spacing={3}>
            {/* Top Lecturers */}
            <Grid size={{ md: 8, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Giảng viên năng suất nhất" />
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên giảng viên</TableCell>
                                        <TableCell align="right">Số lớp đang dạy</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topLecturers.map((row) => (
                                        <TableRow key={row.lecturerId}>
                                            <TableCell>{row.lecturerName}</TableCell>
                                            <TableCell align="right">{row.activeClasses}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* Lecturer Distribution */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
                    <CardHeader title="Phân bổ giảng viên" />
                    <CardContent>
                        <Box sx={{ height: 250, position: "relative" }}>
                            <Pie data={pieData} options={pieOptions} />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
