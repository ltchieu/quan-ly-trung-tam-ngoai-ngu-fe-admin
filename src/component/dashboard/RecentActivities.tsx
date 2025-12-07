import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  PersonAdd as RegistrationIcon,
  Payment as PaymentIcon,
  School as ClassEndIcon,
  Person as ProfileIcon,
  Info as OtherIcon,
} from '@mui/icons-material';
import { ActivityResponse } from '../../model/dashboard_model';
import { getRecentActivities } from '../../services/dashboard_service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface Props {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'registration':
      return <RegistrationIcon sx={{ color: 'primary.main' }} />;
    case 'payment':
      return <PaymentIcon sx={{ color: 'success.main' }} />;
    case 'class_end':
      return <ClassEndIcon sx={{ color: 'info.main' }} />;
    case 'profile_update':
      return <ProfileIcon sx={{ color: 'warning.main' }} />;
    default:
      return <OtherIcon sx={{ color: 'grey.500' }} />;
  }
};

const getActivityColor = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'default' => {
  switch (type) {
    case 'registration':
      return 'primary';
    case 'payment':
      return 'success';
    case 'class_end':
      return 'info';
    case 'profile_update':
      return 'warning';
    default:
      return 'default';
  }
};

export const RecentActivities: React.FC<Props> = ({ 
  limit = 10, 
  autoRefresh = false,
  refreshInterval = 30 
}) => {
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const data = await getRecentActivities(limit);
      setActivities(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError('Không thể tải hoạt động gần đây');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Hoạt động gần đây
        </Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            Chưa có hoạt động nào
          </Typography>
        ) : (
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {activities.map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium" component="span">
                        {activity.title}
                      </Typography>
                      <Chip 
                        label={activity.type} 
                        size="small" 
                        color={getActivityColor(activity.type)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {activity.description}
                      </Typography>
                      {activity.userName && (
                        <Typography variant="caption" color="text.secondary" component="span" display="block">
                          Người thực hiện: {activity.userName}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" component="span" display="block">
                        {dayjs(activity.timestamp).fromNow()} • {dayjs(activity.timestamp).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
