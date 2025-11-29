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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { StudentModel } from "../model/student_model";
import { getAllStudents, createStudent } from "../services/student_service";
import useDebounce from "../hook/useDebounce";

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
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentModel[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Form state for new student
    const [newStudent, setNewStudent] = useState({
        hoten: "",
        email: "",
        sdt: "",
        gioitinh: true,
        ngaysinh: "",
        diachi: "",
    });

    useEffect(() => {
        if (open) {
            setSearchTerm("");
            setStudents([]);
            setTabValue(0);
            setNewStudent({
                hoten: "",
                email: "",
                sdt: "",
                gioitinh: true,
                ngaysinh: "",
                diachi: "",
            });
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
            const res = await getAllStudents(0, 100);
            let data = res.data.data.students;

            if (term) {
                const lowerTerm = term.toLowerCase();
                data = data.filter(
                    (s) =>
                        s.hoten.toLowerCase().includes(lowerTerm) ||
                        s.email.toLowerCase().includes(lowerTerm) ||
                        s.sdt.includes(lowerTerm)
                );
            }
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async () => {
        try {
            // Validate basic fields
            if (!newStudent.hoten || !newStudent.email || !newStudent.sdt) {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, SĐT)");
                return;
            }

            // Call API to create student
            const createdStudent = await createStudent(newStudent);

            // Add to class
            onAdd(createdStudent.mahocvien);
            onClose();
        } catch (error: any) {
            console.error("Error creating student:", error);
            alert(error.message || "Có lỗi xảy ra khi tạo học viên");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Thêm học viên vào lớp</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab label="Tìm kiếm" />
                        <Tab label="Thêm mới" />
                    </Tabs>
                </Box>

                {tabValue === 0 ? (
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
                                            key={student.mahocvien}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="add"
                                                    color="primary"
                                                    onClick={() => onAdd(student.mahocvien)}
                                                >
                                                    <PersonAddIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={student.hinhanh} alt={student.hoten} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={student.hoten}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {student.email}
                                                        </Typography>
                                                        {` - ${student.sdt}`}
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
                ) : (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    required
                                    value={newStudent.hoten}
                                    onChange={(e) => setNewStudent({ ...newStudent, hoten: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    required
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    required
                                    value={newStudent.sdt}
                                    onChange={(e) => setNewStudent({ ...newStudent, sdt: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                                <FormControl fullWidth>
                                    <InputLabel>Giới tính</InputLabel>
                                    <Select
                                        value={newStudent.gioitinh ? 1 : 0}
                                        label="Giới tính"
                                        onChange={(e) => setNewStudent({ ...newStudent, gioitinh: e.target.value === 1 })}
                                    >
                                        <MenuItem value={1}>Nam</MenuItem>
                                        <MenuItem value={0}>Nữ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                                <TextField
                                    fullWidth
                                    label="Ngày sinh"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={newStudent.ngaysinh}
                                    onChange={(e) => setNewStudent({ ...newStudent, ngaysinh: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ"
                                    multiline
                                    rows={2}
                                    value={newStudent.diachi}
                                    onChange={(e) => setNewStudent({ ...newStudent, diachi: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleCreateStudent}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Tạo và Thêm vào lớp"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddStudentDialog;
