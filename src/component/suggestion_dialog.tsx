import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, List, ListItem, ListItemText, Chip, Divider, Alert, ListItemButton, Stack
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ScheduleSuggestionResponse, ScheduleAlternative } from '../model/schedule_model';
import dayjs from 'dayjs';

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

        {/* --- INITIAL CHECK INFO --- */}
        {data.initialCheck && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Kết quả kiểm tra:
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2">
                  Phòng khả dụng: <strong>{data.initialCheck.availableRoomCount}</strong>
                </Typography>
                <Typography variant="body2">
                  Giảng viên khả dụng: <strong>{data.initialCheck.availableLecturerCount}</strong>
                </Typography>
              </Box>
              
              {/* Display Room Conflicts */}
              {data.initialCheck.roomConflicts && data.initialCheck.roomConflicts.length > 0 && (
                <Box>
                  <Typography variant="body2" color="error" fontWeight="bold" sx={{ mb: 0.5 }}>
                    <EventBusyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Xung đột phòng học:
                  </Typography>
                  {data.initialCheck.roomConflicts.map((conflict, idx) => (
                    <Alert key={idx} severity="error" sx={{ mb: 1, py: 0.5 }}>
                      <Typography variant="body2">{conflict.description}</Typography>
                      {conflict.conflictingClassName && (
                        <Typography variant="caption" display="block">
                          Lớp: {conflict.conflictingClassName}
                          {conflict.conflictingCourseName && ` - ${conflict.conflictingCourseName}`}
                        </Typography>
                      )}
                      {conflict.conflictDate && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          <AccessTimeIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />
                          {' '}{dayjs(conflict.conflictDate).format('DD/MM/YYYY')}
                          {conflict.conflictStartTime && conflict.conflictEndTime && 
                            ` (${conflict.conflictStartTime} - ${conflict.conflictEndTime})`
                          }
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              )}

              {/* Display Lecturer Conflicts */}
              {data.initialCheck.lecturerConflicts && data.initialCheck.lecturerConflicts.length > 0 && (
                <Box>
                  <Typography variant="body2" color="error" fontWeight="bold" sx={{ mb: 0.5 }}>
                    <EventBusyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Xung đột giảng viên:
                  </Typography>
                  {data.initialCheck.lecturerConflicts.map((conflict, idx) => (
                    <Alert key={idx} severity="warning" sx={{ mb: 1, py: 0.5 }}>
                      <Typography variant="body2">{conflict.description}</Typography>
                      {conflict.conflictingClassName && (
                        <Typography variant="caption" display="block">
                          Lớp: {conflict.conflictingClassName}
                          {conflict.conflictingCourseName && ` - ${conflict.conflictingCourseName}`}
                        </Typography>
                      )}
                      {conflict.conflictDate && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          <AccessTimeIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />
                          {' '}{dayjs(conflict.conflictDate).format('DD/MM/YYYY')}
                          {conflict.conflictStartTime && conflict.conflictEndTime && 
                            ` (${conflict.conflictStartTime} - ${conflict.conflictEndTime})`
                          }
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* --- NỘI DUNG XỬ LÝ THEO STATUS --- */}
        {/* TRƯỜNG HỢP: CONFLICT (Hiện danh sách Alternatives) */}
        {isConflict && data.alternatives && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Các phương án thay thế gợi ý:
            </Typography>
            {data.alternatives && data.alternatives.length > 0 ? (
              <List sx={{ bgcolor: '#fff0f0', borderRadius: 1 }}>
                {data.alternatives.map((alt, index) => (
                  <React.Fragment key={index}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => onSelectAlternative && onSelectAlternative(alt)}>
                        <ListItemText 
                          primary={
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Phương án {index + 1} - {alt.type}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {alt.reason}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" display="block">
                                📅 Ngày: {dayjs(alt.startDate).format('DD/MM/YYYY')} | 
                                ⏰ Giờ: {alt.startTime} - {alt.endTime} | 
                                📆 Lịch: {alt.schedulePattern}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Phòng khả dụng: {alt.availableRooms?.length || 0} | 
                                Giảng viên: {alt.availableLecturers?.length || 0}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {data.alternatives && index < data.alternatives.length - 1 && <Divider />}
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