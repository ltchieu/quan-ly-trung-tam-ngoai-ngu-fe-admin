import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { TopCourseData } from "../../model/dashboard_model";

interface Props {
    data: TopCourseData[];
}

export const TopCourses: React.FC<Props> = ({ data }) => {
    return (
        <Card sx={{ height: "100%", borderRadius: 4, boxShadow: 3 }}>
            <CardHeader title="Top Khóa học bán chạy" />
            <CardContent sx={{ p: 0 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên khóa học</TableCell>
                                <TableCell align="right">Đăng ký</TableCell>
                                <TableCell align="right">Doanh thu</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.courseId}>
                                    <TableCell component="th" scope="row">
                                        <Typography variant="body2" fontWeight="bold">
                                            {row.courseName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{row.registrations}</TableCell>
                                    <TableCell align="right">
                                        {(row.revenue / 1000000).toFixed(0)}M
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
