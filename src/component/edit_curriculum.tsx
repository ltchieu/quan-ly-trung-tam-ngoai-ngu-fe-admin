// src/component/EditCurriculum.tsx
import React, { useState, useEffect } from 'react';
import {
    TextField, Button, List, ListItem, ListItemText, IconButton,
    Box, Typography, Divider, Grid, Alert, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { ModuleData } from '../model/module_model';
import { createModule, deleteModule, updateModule } from '../services/course_service';

interface Props {
    courseId: number;
    initialModules: ModuleData[];
    objectives: { tenmuctieu: string }[]; 
    onModulesChange: () => void;
    // setDataObjectives?: (newObjectives: { tenmuctieu: string }[]) => void;
}
interface EditingModuleState {
    moduleId: number; 
    moduleName: string;
    duration: number;
}

const EditCurriculum: React.FC<Props> = ({ courseId, initialModules, objectives, onModulesChange }) => {

    const [newModule, setNewModule] = useState({ moduleName: '', duration: 0 });

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<EditingModuleState | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Handlers cho Module ---
    const handleAddModule = async () => {
        if (newModule.moduleName.trim() === '' || newModule.duration <= 0) {
            setError("Tên module không được rỗng và thời lượng phải lớn hơn 0.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await createModule(courseId, newModule); 
            setNewModule({ moduleName: '', duration: 0 }); 
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi thêm module:", err);
            setError(err.response?.data?.message || "Thêm module thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveModule = async (moduleId: number) => {
        if (!window.confirm(`Bạn có chắc muốn xóa module này không?`)) return; 

        setIsSubmitting(true);
        setError(null);
        try {
            await deleteModule(moduleId);
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi xóa module:", err);
            setError(err.response?.data?.message || "Xóa module thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Handlers cho Edit Module ---
    const handleOpenEditDialog = (module: ModuleData) => {
        setEditingModule({
            moduleId: module.moduleId,
            moduleName: module.moduleName,
            duration: module.duration,
        });
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditingModule(null);
    };

    const handleEditModuleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingModule) return;
        const { name, value } = event.target;
        setEditingModule(prev => prev ? ({
            ...prev,
            [name]: name === 'duration' ? (Number(value) || 0) : value
        }) : null);
    };

    const handleSaveChanges = async () => {
        if (!editingModule || editingModule.moduleName.trim() === '' || editingModule.duration <= 0) {
            alert("Tên module không được rỗng và thời lượng phải lớn hơn 0.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {

            await updateModule(editingModule.moduleId, {
                moduleName: editingModule.moduleName,
                duration: editingModule.duration,
            });
            handleCloseEditDialog();
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi cập nhật module:", err);
            setError(err.response?.data?.message || "Cập nhật module thất bại.");
        } finally {
             if(!error || editDialogOpen) setIsSubmitting(false);
        }
    };

    return (
        <Grid container spacing={4}>
            {/* Phần mục tiêu (Chỉ hiển thị, chưa có chức năng sửa/xóa) */}
            <Grid size={{xs: 12, md: 6}}>
                <Typography variant="h6" gutterBottom>Mục tiêu khóa học</Typography>
                {/* Có thể thêm nút "Thêm/Sửa mục tiêu" nếu cần */}
                <List dense>
                    {(objectives || []).map((item, index) => (
                        <ListItem key={index} disableGutters>
                            <ListItemText primary={`- ${item.tenmuctieu}`} />
                        </ListItem>
                    ))}
                    {(!objectives || objectives.length === 0) && <Typography variant="body2" color="textSecondary">Chưa có mục tiêu nào.</Typography>}
                </List>
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }}/>

            {/* Phần Module */}
            <Grid size={{xs: 12, md: 6}}>
                <Typography variant="h6" gutterBottom>Chương trình học (Modules)</Typography>
                 {/* Form Thêm Module */}
                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        label="Tên Module mới"
                        value={newModule.moduleName}
                        onChange={(e) => setNewModule({...newModule, moduleName: e.target.value})}
                        fullWidth size="small"
                        disabled={isSubmitting}
                     />
                    <TextField
                        label="Thời lượng (giờ)"
                        type="number"
                        value={newModule.duration || ''}
                        onChange={(e) => setNewModule({...newModule, duration: Number(e.target.value) || 0})}
                        sx={{width: 150}} size="small"
                        InputProps={{ inputProps: { min: 1 } }}
                        disabled={isSubmitting}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleAddModule}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
                     >
                        Thêm
                    </Button>
                </Box>

                {/* Hiển thị lỗi chung */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Danh sách Module */}
                 <List dense>
                    {initialModules.map((item) => ( // Dùng initialModules để hiển thị
                        <ListItem
                            key={item.moduleId} // Dùng ID từ API làm key
                            disableGutters
                            secondaryAction={
                                <>
                                    <IconButton edge="end" size="small" sx={{ mr: 0.5 }} onClick={() => handleOpenEditDialog(item)} disabled={isSubmitting}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton edge="end" size="small" onClick={() => handleRemoveModule(item.moduleId)} disabled={isSubmitting}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </>
                            }
                        >
                            <ListItemText primary={item.moduleName} secondary={`${item.duration} giờ`} />
                        </ListItem>
                    ))}
                    {initialModules.length === 0 && <Typography variant="body2" color="textSecondary">Chưa có module nào.</Typography>}
                </List>
            </Grid>

            {/* Dialog Chỉnh sửa Module */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Chỉnh sửa Module</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="moduleName" // Đổi name thành moduleName cho khớp state
                        label="Tên Module"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editingModule?.moduleName || ''}
                        onChange={handleEditModuleChange}
                        sx={{ mt: 1 }}
                        disabled={isSubmitting}
                    />
                    <TextField
                        margin="dense"
                        name="duration" // Đổi name thành duration
                        label="Thời lượng (giờ)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editingModule?.duration || ''}
                        onChange={handleEditModuleChange}
                        InputProps={{ inputProps: { min: 1 } }}
                        disabled={isSubmitting}
                    />
                     {/* Hiển thị lỗi ngay trong Dialog nếu cần */}
                     {/* {error && editDialogOpen && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>} */}
                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 2 }}>
                    <Button onClick={handleCloseEditDialog} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSaveChanges} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24}/> : 'Lưu thay đổi'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default EditCurriculum;