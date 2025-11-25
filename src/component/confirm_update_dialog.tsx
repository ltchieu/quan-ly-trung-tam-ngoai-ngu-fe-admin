import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Grid, Chip, Divider
} from "@mui/material";
import { ScheduleAlternative } from "../model/schedule_model";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalClassId: number | null;
  selectedAlternative: ScheduleAlternative | null;
}

const ConfirmUpdateDialog: React.FC<Props> = ({ open, onClose, onConfirm, selectedAlternative }) => {
  if (!selectedAlternative) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Xác nhận thay đổi lịch học
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
            Để giải quyết xung đột và mở lại lớp học này, hệ thống sẽ cập nhật thông tin như sau:
        </Typography>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #ddd' }}>
            <Grid container spacing={2}>
                <Grid size={{xs: 12}}>
                    <Typography variant="caption" color="text.secondary">Lý do thay đổi:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                        {selectedAlternative.reason || "Thay đổi để tránh trùng lịch"}
                    </Typography>
                </Grid>
                
                <Grid size={{xs: 6}}>
                    <Typography variant="caption" color="text.secondary">Ngày bắt đầu mới:</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedAlternative.startDate}</Typography>
                </Grid>
                <Grid size={{xs: 6}}>
                    <Typography variant="caption" color="text.secondary">Giờ học:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {selectedAlternative.startTime} - {selectedAlternative.endTime}
                    </Typography>
                </Grid>
                
                <Grid size={{xs: 12}}>
                    <Typography variant="caption" color="text.secondary">Lịch trong tuần:</Typography>
                    <Chip label={selectedAlternative.schedulePattern} color="info" size="small" sx={{fontWeight: 'bold'}} />
                </Grid>

                <Grid size={{xs: 12}}>
                    <Divider sx={{my: 1}} />
                    <Typography variant="caption" color="text.secondary">Tài nguyên mới:</Typography>
                    <Box sx={{display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap'}}>
                         <Chip label={`Phòng: ${selectedAlternative.availableRooms[0]?.name || "Tự động chọn"}`} variant="outlined" size="small"/>
                         <Chip label={`GV: ${selectedAlternative.availableLecturers[0]?.name || "Tự động chọn"}`} variant="outlined" size="small"/>
                    </Box>
                </Grid>
            </Grid>
        </Box>

        <Typography variant="body2" color="error" sx={{ mt: 2, fontStyle: 'italic' }}>
           * Lưu ý: Hành động này sẽ cập nhật thông tin lớp học và kích hoạt trạng thái "Mở".
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Hủy bỏ</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
            Xác nhận cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmUpdateDialog;