import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, List, ListItem, ListItemText, Chip, Divider, Alert, ListItemButton
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ScheduleSuggestionResponse, ScheduleAlternative } from '../model/schedule_model';

interface Props {
  open: boolean;
  onClose: () => void;
  data: ScheduleSuggestionResponse | null;
  onSelectAlternative?: (alt: ScheduleAlternative) => void;
}

const SuggestionDialog: React.FC<Props> = ({ open, onClose, data, onSelectAlternative }) => {
  if (!data) return null;

  const isConflict = data.status === 'CONFLICT';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* --- HEADER --- */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isConflict ? 'error.main' : 'primary.main' }}>
        {isConflict ? <WarningIcon /> : <CheckCircleIcon />}
        {isConflict ? "Phát hiện xung đột lịch trình" : "Yêu cầu chọn tài nguyên"}
      </DialogTitle>

      <DialogContent dividers>
        {/* --- MESSAGE --- */}
        <Alert severity={isConflict ? "error" : "info"} sx={{ mb: 2 }}>
          {data.message}
        </Alert>

        {/* --- NỘI DUNG XỬ LÝ THEO STATUS --- */}
        {/* TRƯỜNG HỢP: CONFLICT (Hiện danh sách Alternatives) */}
        {isConflict && data.alternatives && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Các phương án thay thế gợi ý:
            </Typography>
            {data.alternatives.length > 0 ? (
              <List sx={{ bgcolor: '#fff0f0', borderRadius: 1 }}>
                {data.alternatives.map((alt, index) => (
                  <React.Fragment key={index}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => onSelectAlternative && onSelectAlternative(alt)}>
                        <ListItemText 
                          primary={`Phương án ${index + 1}`} 
                          // Thay 'alt.details' bằng trường hiển thị thực tế của bạn
                          secondary={alt.reason || "Chi tiết lịch học mới..."} 
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < data.alternatives.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy phương án thay thế phù hợp.
              </Typography>
            )}
          </Box>
        )}

        {/* TRƯỜNG HỢP: AVAILABLE (Hiện danh sách Phòng/GV khả dụng) */}
        {!isConflict && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Danh sách phòng trống */}
            {data.availableRooms && data.availableRooms.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Phòng học khả dụng:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {data.availableRooms.map((room) => (
                    <Chip 
                      key={room.id} 
                      label={room.name} 
                      onClick={() => console.log("Chọn phòng:", room.id)}
                      color="success" variant="outlined" clickable 
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Danh sách giảng viên rảnh */}
            {data.availableLecturers && data.availableLecturers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Giảng viên phù hợp:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {data.availableLecturers.map((lecturer) => (
                    <Chip 
                      key={lecturer.id} 
                      label={lecturer.name} 
                      color="primary" variant="outlined" clickable 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuggestionDialog;