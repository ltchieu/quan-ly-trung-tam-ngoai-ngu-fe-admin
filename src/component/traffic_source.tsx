// src/components/TrafficSourceChart.tsx
import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

ChartJS.register(ArcElement, Tooltip, Legend);

export const TrafficSourceChart: React.FC = () => {
  const data = {
    labels: ['Desktop', 'Tablet', 'Phone'],
    datasets: [
      {
        data: [63, 15, 22],
        backgroundColor: ['#3F51B5', '#66BB6A', '#FB8C00'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  
  const devices = [
      { title: 'Desktop', value: 63, icon: <DesktopWindowsIcon fontSize="small" />, color: '#3F51B5' },
      { title: 'Tablet', value: 15, icon: <TabletMacIcon fontSize="small" />, color: '#66BB6A' },
      { title: 'Phone', value: 22, icon: <PhoneIphoneIcon fontSize="small" />, color: '#FB8C00' }
  ];

  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3 }}>
      <CardHeader title="Traffic source" />
      <CardContent>
        <Box sx={{ height: 300, position: 'relative', mb: 4 }}>
          <Doughnut data={data} options={options} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            {devices.map(device => (
                <Box key={device.title} sx={{ px: 2 }}>
                    {device.icon}
                    <Typography variant="h6">{device.title}</Typography>
                    <Typography color="text.secondary" variant="subtitle2">{device.value}%</Typography>
                </Box>
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};