import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  iconBgColor: string;
  change?: number; // Tỷ lệ thay đổi (ví dụ: 12, -16)
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, iconBgColor, change }) => {
  const isPositiveChange = change && change > 0;

  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Avatar sx={{ backgroundColor: iconBgColor, height: 56, width: 56 }}>
            {icon}
          </Avatar>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {isPositiveChange ? (
              <ArrowUpwardIcon color="success" fontSize="small" />
            ) : (
              <ArrowDownwardIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={isPositiveChange ? 'success.main' : 'error.main'}
              sx={{ mr: 1 }}
            >
              {Math.abs(change)}%
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Since last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};