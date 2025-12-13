// src/component/EditCurriculum.tsx
import React, { useState } from 'react';
import {
    TextField, Button, List, ListItem, ListItemText, IconButton,
    Box, Typography, Divider, Grid, Alert, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Accordion, AccordionSummary, AccordionDetails, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ModuleData } from '../model/module_model';
import { SkillModuleGroup } from '../model/course_model';
import { createModule, deleteModule, updateModuleBasicInfo, updateObjective } from '../services/course_service';

interface Props {
    courseId: number;
    initialModules: ModuleData[];
    skillModules: SkillModuleGroup[];
    objectives: { id: number; objectiveName: string }[];
    totalCourseHours: number;
    onModulesChange: () => void;
}

interface EditingModuleState {
    moduleId: number;
    moduleName: string;
    duration: number;
}

const EditCurriculum: React.FC<Props> = ({ courseId, skillModules, objectives, totalCourseHours, onModulesChange }) => {

    // Removed generic newModule state in favor of per-skill adding or dialog
    const [newModuleOpen, setNewModuleOpen] = useState<{ skillId: number } | null>(null);
    const [newModuleName, setNewModuleName] = useState('');
    const [newModuleDuration, setNewModuleDuration] = useState(0);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<EditingModuleState | null>(null);

    // Objective Editing State
    const [editingObjectiveId, setEditingObjectiveId] = useState<number | null>(null);
    const [tempObjectiveName, setTempObjectiveName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    // Separate error states
    // Separate error states
    const [objectiveError, setObjectiveError] = useState<string | null>(null);
    const [moduleError, setModuleError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // --- Handlers for Objective ---
    const handleEditObjective = (obj: { id: number; objectiveName: string }) => {
        // console.log("Editing objective:", obj);
        setEditingObjectiveId(obj.id);
        setTempObjectiveName(obj.objectiveName || "");
        setObjectiveError(null);
    };

    const handleCancelEditObjective = () => {
        setEditingObjectiveId(null);
        setTempObjectiveName('');
        setObjectiveError(null);
    };

    const handleSaveObjective = async (objectiveId: number) => {
        // console.log("Saving objective:", objectiveId, "Content:", tempObjectiveName);

        // Ensure we are checking the current state value
        if (!tempObjectiveName || tempObjectiveName.trim().length === 0) {
            setObjectiveError("Mô tả mục tiêu không được để trống.");
            return;
        }

        setIsSubmitting(true);
        setObjectiveError(null);
        try {
            await updateObjective(objectiveId, tempObjectiveName);
            setEditingObjectiveId(null);
            setNotification({ open: true, message: "Cập nhật mục tiêu thành công!", severity: 'success' });
            onModulesChange(); // Refresh data to see changes
        } catch (err: any) {
            console.error("Lỗi khi cập nhật mục tiêu:", err);
            setObjectiveError(err.response?.data?.message || "Cập nhật mục tiêu thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Handlers cho Module ---

    // Open add form for a specific skill
    const handleOpenAddModule = (skillId: number) => {
        setNewModuleOpen({ skillId });
        setNewModuleName('');
        setNewModuleDuration(0);
        setModuleError(null);
    };

    const handleCancelAddModule = () => {
        setNewModuleOpen(null);
    };

    const handleAddModule = async (skillId: number) => {
        if (newModuleName.trim() === '' || newModuleDuration <= 0) {
            setModuleError("Tên module không được rỗng và thời lượng phải lớn hơn 0.");
            return;
        }
        setIsSubmitting(true);
        setModuleError(null);
        try {
            await createModule(courseId, {
                moduleName: newModuleName,
                duration: newModuleDuration,
                skillId: skillId
            } as any);
            setNewModuleOpen(null);
            setNotification({ open: true, message: "Thêm module thành công!", severity: 'success' });
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi thêm module:", err);
            setModuleError(err.response?.data?.message || "Thêm module thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveModule = async (moduleId: number) => {
        if (!window.confirm(`Bạn có chắc muốn xóa module này không?`)) return;

        setIsSubmitting(true);
        setModuleError(null);
        try {
            await deleteModule(moduleId);
            setNotification({ open: true, message: "Xóa module thành công!", severity: 'success' });
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi xóa module:", err);
            setModuleError(err.response?.data?.message || "Xóa module thất bại.");
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
        if (!editingModule || editingModule.moduleName.trim() === '') {
            alert("Tên module không được rỗng.");
            return;
        }
        
        if (editingModule.duration <= 0) {
            alert("Thời lượng phải lớn hơn 0.");
            return;
        }

        setIsSubmitting(true);
        setModuleError(null);
        try {

            await updateModuleBasicInfo(editingModule.moduleId, {
                moduleName: editingModule.moduleName,
                duration: editingModule.duration,
            });
            handleCloseEditDialog();
            setNotification({ open: true, message: "Cập nhật module thành công!", severity: 'success' });
            onModulesChange();
        } catch (err: any) {
            console.error("Lỗi khi cập nhật module:", err);
            setModuleError(err.response?.data?.message || "Cập nhật module thất bại.");
        } finally {
            if (!moduleError || editDialogOpen) setIsSubmitting(false);
        }
    };

    return (
        <Grid container spacing={4}>
            <Grid key="objectives-section" size={{ xs: 12, md: 12 }}>
                <Typography variant="h6" gutterBottom>Mục tiêu khóa học</Typography>
                {objectiveError && <Alert severity="error" sx={{ mb: 2 }}>{objectiveError}</Alert>}
                <List dense>
                    {(objectives || []).map((item, index) => (
                        <ListItem key={`objective-${item.id || index}`} disableGutters
                            secondaryAction={
                                editingObjectiveId === item.id ? (
                                    <>
                                        <IconButton edge="end" aria-label="save" onClick={() => handleSaveObjective(item.id)} disabled={isSubmitting}>
                                            <CheckIcon color="primary" />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="cancel" onClick={handleCancelEditObjective} disabled={isSubmitting}>
                                            <CloseIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditObjective(item)} disabled={isSubmitting}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                )
                            }
                        >
                            {editingObjectiveId === item.id ? (
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={tempObjectiveName}
                                    onChange={(e) => setTempObjectiveName(e.target.value)}
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            ) : (
                                <ListItemText primary={`- ${item.objectiveName}`} />
                            )}
                        </ListItem>
                    ))}
                    {(!objectives || objectives.length === 0) && <Typography variant="body2" color="textSecondary">Chưa có mục tiêu nào.</Typography>}
                </List>
            </Grid>

            <Divider key="divider" orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

            {/* Phần Module grouped by Skill */}
            <Grid key="modules-section" size={{ xs: 12, md: 12 }}>
                <Typography variant="h6" gutterBottom>Chương trình học (Theo Kỹ Năng)</Typography>

                {moduleError && <Alert severity="error" sx={{ mb: 2 }}>{moduleError}</Alert>}
                
                {(() => {
                    const totalModuleHours = (skillModules || []).reduce((sum, group) => 
                        sum + (group.modules || []).reduce((groupSum, mod) => groupSum + mod.duration, 0), 0
                    );
                    if (totalModuleHours !== totalCourseHours) {
                        return (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight="bold">
                                    Tổng thời lượng modules ({totalModuleHours} giờ) không khớp với thời lượng khóa học ({totalCourseHours} giờ).
                                </Typography>
                                <Typography variant="caption">
                                    Vui lòng điều chỉnh thời lượng các module để tổng bằng {totalCourseHours} giờ.
                                </Typography>
                            </Alert>
                        );
                    }
                    return null;
                })()}

                {(skillModules || []).map((group) => (
                    <Accordion key={`skill-${group.skillId}`} defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${group.skillId}-content`}
                            id={`panel-${group.skillId}-header`}
                            sx={{ backgroundColor: '#f5f5f5' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">{group.skillName}</Typography>
                            <Typography variant="caption" sx={{ ml: 2, alignSelf: 'center' }}>
                                ({group.modules ? group.modules.length : 0} modules)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List dense>
                                {(group.modules || []).map((item) => (
                                    <ListItem
                                        key={`module-${item.moduleId}`}
                                        disableGutters
                                        secondaryAction={
                                            <>
                                                <IconButton edge="end" size="small" sx={{ mr: 0.5 }} onClick={() => handleOpenEditDialog(item as any)} disabled={isSubmitting}>
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
                                {(!group.modules || group.modules.length === 0) && (
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 1, px: 2 }}>
                                        Chưa có module nào trong kỹ năng này.
                                    </Typography>
                                )}
                            </List>

                            {/* Add Module Form specifically for this skill */}
                            {newModuleOpen?.skillId === group.skillId ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                                    <TextField
                                        label="Tên Module mới"
                                        value={newModuleName}
                                        onChange={(e) => setNewModuleName(e.target.value)}
                                        fullWidth size="small"
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                    <TextField
                                        label="Giờ"
                                        type="number"
                                        value={newModuleDuration || ''}
                                        onChange={(e) => setNewModuleDuration(Number(e.target.value) || 0)}
                                        sx={{ width: 80 }} size="small"
                                        InputProps={{ inputProps: { min: 1 } }}
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleAddModule(group.skillId)}
                                        disabled={isSubmitting}
                                    >
                                        Lưu
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={handleCancelAddModule}
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </Button>
                                </Box>
                            ) : (
                                <Button
                                    startIcon={<AddIcon />}
                                    size="small"
                                    onClick={() => handleOpenAddModule(group.skillId)}
                                    sx={{ mt: 1 }}
                                >
                                    Thêm Module
                                </Button>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}

                {(!skillModules || skillModules.length === 0) && (
                    <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
                        Khóa học này chưa được cấu hình kỹ năng. Vui lòng kiểm tra lại dữ liệu đầu vào.
                    </Typography>
                )}
            </Grid>
            {/* ... Dialog ... */}

            {/* Dialog Chỉnh sửa Module */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Chỉnh sửa Module</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="moduleName"
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
                        name="duration"
                        label="Thời lượng (giờ)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editingModule?.duration || ''}
                        onChange={handleEditModuleChange}
                        InputProps={{ inputProps: { min: 1 } }}
                        sx={{ mt: 2 }}
                        disabled={isSubmitting}
                    />

                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 2 }}>
                    <Button onClick={handleCloseEditDialog} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSaveChanges} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={2000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    marginTop: '60px'
                }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default EditCurriculum;