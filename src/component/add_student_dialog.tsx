import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Typography,
    InputAdornment,
    CircularProgress,
    Box,
    Tabs,
    Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { StudentAdminResponse } from "../model/student_model";
import { getAllStudents } from "../services/student_service";
import useDebounce from "../hook/useDebounce";
import { useNavigate } from "react-router-dom";

interface AddStudentDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (studentId: number) => void;
    classId: number | null;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
    open,
    onClose,
    onAdd,
    classId,
}) => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentAdminResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (open) {
            setSearchTerm("");
            setStudents([]);
            setTabValue(0);
            fetchStudents("");
        }
    }, [open]);

    useEffect(() => {
        if (open && tabValue === 0) {
            fetchStudents(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, open, tabValue]);

    const fetchStudents = async (term: string) => {
        setLoading(true);
        try {
            const response = await getAllStudents(0, 100, term);
            if (response.code === 1000 && response.data) {
                setStudents(response.data.content);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 1) {
            // Navigate to add student page
            onClose();
            navigate("/students/add");
        } else {
            setTabValue(newValue);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Thêm học viên vào lớp</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Tìm kiếm" />
                        <Tab label="Thêm mới" />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <>
                        <Box sx={{ mb: 2, mt: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm học viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <List sx={{ maxHeight: 400, overflow: "auto" }}>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <ListItem
                                            key={student.id}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="add"
                                                    color="primary"
                                                    onClick={() => onAdd(student.id)}
                                                >
                                                    <PersonAddIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={student.avatarUrl || undefined} alt={student.fullName}>
                                                    {student.fullName.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={student.fullName}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {student.email}
                                                        </Typography>
                                                        {` - ${student.phoneNumber}`}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography align="center" color="textSecondary" sx={{ mt: 2 }}>
                                        Không tìm thấy học viên nào.
                                    </Typography>
                                )}
                            </List>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddStudentDialog;
