// src/components/SalesChart.tsx
import React from 'react';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const SalesChart: React.FC = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This year',
        data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 18, 17, 20],
        backgroundColor: '#6366F1',
        barThickness: 12,
        borderRadius: 4,
      },
      {
        label: 'Last year',
        data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
        backgroundColor: '#A5B4FC',
        barThickness: 12,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${value}K`,
        },
      },
    },
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3 }}>
      <CardHeader title="Sales" />
      <CardContent>
        <Box sx={{ height: 350, position: 'relative' }}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};