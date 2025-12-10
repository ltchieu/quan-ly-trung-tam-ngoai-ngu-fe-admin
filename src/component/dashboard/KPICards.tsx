import React from "react";
import { Grid } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { SummaryCard } from "../summary_card";
import { KpiData } from "../../model/dashboard_model";

interface Props {
    data: KpiData;
}

export const KPICards: React.FC<Props> = ({ data }) => {
    return (
        <Grid container spacing={3}>
            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                <SummaryCard
                    title="Doanh thu tháng này"
                    value={`${(data.revenue / 1000000).toFixed(0)}M VNĐ`}
                    icon={<AttachMoneyIcon />}
                    iconBgColor="primary.main"
                    change={data.revenueGrowth}
                />
            </Grid>
            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                <SummaryCard
                    title="Học viên mới"
                    value={data.newStudents.toString()}
                    icon={<PeopleIcon />}
                    iconBgColor="success.main"
                />
            </Grid>
            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                <SummaryCard
                    title="Lớp đang hoạt động"
                    value={data.activeClasses.toString()}
                    icon={<ClassIcon />}
                    iconBgColor="info.main"
                />
            </Grid>
            <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                <SummaryCard
                    title="Hóa đơn chưa thanh toán"
                    value={data.pendingInvoices.toString()}
                    icon={<ReceiptIcon />}
                    iconBgColor="warning.main"
                />
            </Grid>
        </Grid>
    );
};
