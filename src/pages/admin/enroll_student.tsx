import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Room as RoomIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hook/useDebounce";
import { getCourseFilterList, filterClasses, registerCourseForStudent, getPaymentMethods, confirmCashPayment } from "../../services/class_service";
import { useAxiosPrivate } from "../../hook/useAxiosPrivate";
import { getAllStudents } from "../../services/student_service";
import { CourseFilterData, ClassView } from "../../model/class_model";
import { StudentSearchResult, PaymentMethod } from "../../model/enrollment_model";
import CreateStudentDialog from "../../component/create_student_dialog";
import VNPayPaymentDialog from "../../component/vnpay_payment_dialog";

// Extend ClassView với courseId để group classes
interface ClassViewWithCourse extends ClassView {
  courseId: number;
}

const steps = ["Chọn khóa học", "Chọn lớp học", "Chọn học viên", "Chọn phương thức thanh toán", "Xác nhận"];

const EnrollStudent: React.FC = () => {
  useAxiosPrivate();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  // Data states
  const [courses, setCourses] = useState<CourseFilterData[]>([]);
  const [classes, setClasses] = useState<ClassViewWithCourse[]>([]);
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Selection states
  const [selectedCourses, setSelectedCourses] = useState<CourseFilterData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassView | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // UI states
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
  const debouncedSearchKeyword = useDebounce(studentSearchKeyword, 500);
  
  // Alert states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [createStudentDialogOpen, setCreateStudentDialogOpen] = useState(false);
  
  // VNPay dialog states
  const [vnpayDialogOpen, setVnpayDialogOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [invoiceExpiryTime, setInvoiceExpiryTime] = useState<string>("");

  // Group classes by course using useMemo
  const groupedClasses = useMemo(() => {
    const groups: { [key: number]: { course: CourseFilterData; classes: ClassViewWithCourse[] } } = {};
    
    classes.forEach((cls) => {
      const courseId = cls.courseId;
      if (!groups[courseId]) {
        const course = selectedCourses.find(c => c.courseId === courseId);
        if (course) {
          groups[courseId] = { course, classes: [] };
        }
      }
      if (groups[courseId]) {
        groups[courseId].classes.push(cls);
      }
    });
    
    return Object.values(groups);
  }, [classes, selectedCourses]);

  // Load courses and payment methods on mount
  useEffect(() => {
    loadCourses();
    loadPaymentMethods();
  }, []);

  // Load classes when courses are selected
  useEffect(() => {
    if (selectedCourses.length > 0) {
      loadClassesForMultipleCourses(selectedCourses.map(c => c.courseId));
    } else {
      setClasses([]);
      setSelectedClass(null);
    }
  }, [selectedCourses]);

  // Search students when keyword changes
  useEffect(() => {
    if (debouncedSearchKeyword && debouncedSearchKeyword.trim().length >= 2) {
      searchStudentsHandler(debouncedSearchKeyword);
    } else {
      setStudents([]);
    }
  }, [debouncedSearchKeyword]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setError(null);
    try {
      const data = await getCourseFilterList();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách khóa học");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadClassesForMultipleCourses = async (courseIds: number[]) => {
    setLoadingClasses(true);
    setError(null);
    try {
      // Load classes for all selected courses
      const classPromises = courseIds.map(courseId => 
        filterClasses(null, null, courseId, null, 1, 100).then(response => ({
          courseId,
          response
        }))
      );
      
      const results = await Promise.all(classPromises);
      
      // Combine all classes from all courses and add courseId to each class
      const allClasses: ClassViewWithCourse[] = [];
      results.forEach(({ courseId, response }) => {
        if (response && response.classes) {
          // Add courseId to each class
          const classesWithCourseId = response.classes.map((cls: ClassView) => ({
            ...cls,
            courseId
          } as ClassViewWithCourse));
          allClasses.push(...classesWithCourseId);
        }
      });
      
      setClasses(allClasses);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lớp học");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const searchStudentsHandler = async (keyword: string) => {
    setLoadingStudents(true);
    try {
      const response = await getAllStudents(0, 10, keyword);
      if (response.code === 1000 && response.data && response.data.content) {
        const mappedStudents: StudentSearchResult[] = response.data.content.map((student: any) => ({
          studentId: student.id,
          studentCode: student.id.toString(), // StudentAdminResponse không có studentCode
          fullName: student.fullName,
          email: student.email,
          phone: student.phoneNumber,
          avatar: student.avatarUrl || undefined
        }));
        setStudents(mappedStudents);
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err: any) {
      console.error("Load payment methods error:", err);
      setError("Không thể tải phương thức thanh toán");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleNext = () => {
    // Validate before moving to next step
    if (activeStep === 0 && selectedCourses.length === 0) {
      setError("Vui lòng chọn ít nhất một khóa học");
      return;
    }
    if (activeStep === 1 && !selectedClass) {
      setError("Vui lòng chọn lớp học");
      return;
    }
    if (activeStep === 2 && !selectedStudent) {
      setError("Vui lòng chọn học viên");
      return;
    }
    if (activeStep === 3 && !selectedPaymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }
    
    setError(null);
    if (activeStep === steps.length - 1) {
      setConfirmDialogOpen(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedCourses([]);
    setSelectedClass(null);
    setSelectedStudent(null);
    setSelectedPaymentMethod(null);
    setStudentSearchKeyword("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedStudent || !selectedPaymentMethod) return;

    setSubmitting(true);
    setError(null);
    try {
      // Bước 1: Đăng ký khóa học (tạo hóa đơn)
      const response = await registerCourseForStudent(
        selectedStudent.studentId,
        [selectedClass.classId],
        selectedPaymentMethod.id
      );
      
      const invoiceData = response.data;
      
      // Bước 2: Xử lý theo phương thức thanh toán
      if (selectedPaymentMethod.id === 1) {
        // Thanh toán tiền mặt - tự động xác nhận
        try {
          await confirmCashPayment(invoiceData.invoiceId);
          setSuccess(`Đăng ký và thanh toán tiền mặt thành công! Mã hóa đơn: ${invoiceData.invoiceId}. Hóa đơn đã được gửi qua email.`);
        } catch (cashErr: any) {
          setSuccess(`Đăng ký thành công! Mã hóa đơn: ${invoiceData.invoiceId}. Lưu ý: ${cashErr.message}`);
        }
        
        setConfirmDialogOpen(false);
        
        // Reset after 4 seconds
        setTimeout(() => {
          handleReset();
          setSuccess(null);
        }, 4000);
      } else {
        // Thanh toán VNPay - hiển thị QR code
        setCreatedInvoiceId(invoiceData.invoiceId);
        setInvoiceAmount(invoiceData.totalAmount);
        setInvoiceExpiryTime(invoiceData.expiryTime);
        setConfirmDialogOpen(false);
        setVnpayDialogOpen(true);
      }
      
    } catch (err: any) {
      setError(err.message || "Đăng ký khóa học thất bại");
      setConfirmDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVnpayDialogClose = () => {
    setVnpayDialogOpen(false);
    setSuccess("Hóa đơn đã được tạo. Học viên có thể thanh toán trong vòng 15 phút.");
    
    // Reset after 4 seconds
    setTimeout(() => {
      handleReset();
      setSuccess(null);
    }, 4000);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon color="primary" />
              Chọn khóa học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng chọn khóa học mà bạn muốn thêm học viên
            </Typography>

            {loadingCourses ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Autocomplete
                multiple
                options={courses}
                value={selectedCourses}
                onChange={(event, newValue) => {
                  setSelectedCourses(newValue);
                }}
                getOptionLabel={(option) => option.courseName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn khóa học"
                    placeholder="Tìm và chọn nhiều khóa học"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.courseName}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            )}

            {selectedCourses.length > 0 && (
              <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: "primary.50" }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Các khóa học đã chọn ({selectedCourses.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {selectedCourses.map((course) => (
                    <Chip
                      key={course.courseId}
                      label={course.courseName}
                      color="primary"
                      variant="filled"
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ClassIcon color="primary" />
              Chọn lớp học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Chọn lớp học phù hợp từ {selectedCourses.length} khóa học đã chọn
            </Typography>

            {loadingClasses ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : classes.length === 0 ? (
              <Alert severity="info">Không có lớp học nào cho các khóa học đã chọn</Alert>
            ) : (
              <Box>
                {groupedClasses.map((group) => (
                  <Accordion key={group.course.courseId} defaultExpanded={selectedCourses.length === 1}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: 'primary.50',
                        '&:hover': { backgroundColor: 'primary.100' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {group.course.courseName}
                        </Typography>
                        <Chip 
                          label={`${group.classes.length} lớp`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2 }}>
                      <Grid container spacing={2}>
                        {group.classes.map((cls) => {
                          const isFull = cls.currentEnrollment >= cls.maxCapacity;
                          const isSelected = selectedClass?.classId === cls.classId;
                          
                          return (
                            <Grid size={{ xs: 12 }} key={cls.classId}>
                              <Paper
                                elevation={isSelected ? 8 : 1}
                                sx={{
                                  p: 2,
                                  cursor: isFull ? "not-allowed" : "pointer",
                                  border: isSelected ? "2px solid" : "1px solid",
                                  borderColor: isSelected ? "primary.main" : "divider",
                                  opacity: isFull ? 0.6 : 1,
                                  backgroundColor: isFull ? "action.disabledBackground" : "background.paper",
                                  transition: "all 0.3s",
                                  "&:hover": {
                                    elevation: isFull ? 1 : 4,
                                    borderColor: isFull ? "divider" : "primary.light",
                                  },
                                }}
                                onClick={() => !isFull && setSelectedClass(cls)}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                  <Box flex={1}>
                                    <Typography variant="h6" gutterBottom>
                                      {cls.className}
                                      {selectedClass?.classId === cls.classId && (
                                        <CheckCircleIcon
                                          color="primary"
                                          sx={{ ml: 1, verticalAlign: "middle" }}
                                        />
                                      )}
                                    </Typography>
                                    
                                    <Grid container spacing={1} sx={{ mt: 1 }}>
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <PersonIcon fontSize="small" color="action" />
                                          <Typography variant="body2">
                                            Giảng viên: {cls.instructorName}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <RoomIcon fontSize="small" color="action" />
                                          <Typography variant="body2">
                                            Phòng: {cls.roomName}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <AccessTimeIcon fontSize="small" color="action" />
                                          <Typography variant="body2">
                                            Lịch: {cls.schedulePattern}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <EventIcon fontSize="small" color="action" />
                                          <Typography variant="body2">
                                            Giờ học: {cls.startTime} - {cls.endTime}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>

                                  <Box textAlign="right">
                                    <Chip
                                      icon={<PeopleIcon />}
                                      label={`${cls.currentEnrollment}/${cls.maxCapacity}`}
                                      color={(cls.maxCapacity - cls.currentEnrollment) > 0 ? "success" : "error"}
                                      size="small"
                                    />
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                      {(cls.maxCapacity - cls.currentEnrollment) > 0
                                        ? `Còn ${cls.maxCapacity - cls.currentEnrollment} chỗ`
                                        : "Đã đầy"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonAddIcon color="primary" />
                  Tìm và chọn học viên
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tìm kiếm học viên theo tên, mã học viên, email hoặc số điện thoại
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setCreateStudentDialogOpen(true)}
                sx={{ textTransform: "none" }}
              >
                Tạo học viên mới
              </Button>
            </Box>

            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.fullName} (${option.studentCode})`}
              loading={loadingStudents}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              inputValue={studentSearchKeyword}
              onInputChange={(_, newInputValue) => setStudentSearchKeyword(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tìm kiếm học viên"
                  placeholder="Nhập tên, mã học viên, email hoặc SĐT..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <ListItem {...props} key={option.studentId}>
                  <ListItemAvatar>
                    <Avatar src={option.avatar} alt={option.fullName}>
                      {option.fullName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${option.fullName} (${option.studentCode})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {option.email}
                        </Typography>
                        {" — "}
                        {option.phone}
                      </>
                    }
                  />
                </ListItem>
              )}
              noOptionsText={
                studentSearchKeyword.length < 2
                  ? "Nhập ít nhất 2 ký tự để tìm kiếm"
                  : "Không tìm thấy học viên"
              }
            />

            {selectedStudent && (
              <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: "success.50" }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Học viên đã chọn
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedStudent.avatar} alt={selectedStudent.fullName} sx={{ width: 56, height: 56 }}>
                    {selectedStudent.fullName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedStudent.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mã HV: {selectedStudent.studentCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.email} • {selectedStudent.phone}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon color="primary" />
              Chọn phương thức thanh toán
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng chọn phương thức thanh toán cho khóa học
            </Typography>

            {loadingPaymentMethods ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {paymentMethods.map((method) => {
                  const isSelected = selectedPaymentMethod?.id === method.id;
                  
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={method.id}>
                      <Paper
                        elevation={isSelected ? 8 : 1}
                        sx={{
                          p: 3,
                          cursor: "pointer",
                          border: isSelected ? "2px solid" : "1px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          transition: "all 0.3s",
                          "&:hover": {
                            elevation: 4,
                            borderColor: "primary.light",
                          },
                        }}
                        onClick={() => setSelectedPaymentMethod(method)}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {method.name}
                              {isSelected && (
                                <CheckCircleIcon
                                  color="primary"
                                  sx={{ ml: 1, verticalAlign: "middle" }}
                                />
                              )}
                            </Typography>
                            {method.description && (
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {selectedPaymentMethod && (
              <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: "primary.50" }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Phương thức thanh toán đã chọn
                </Typography>
                <Typography variant="h6">{selectedPaymentMethod.name}</Typography>
                {selectedPaymentMethod.description && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedPaymentMethod.description}
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon color="primary" />
              Xác nhận thông tin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng kiểm tra lại thông tin trước khi đăng ký khóa học
            </Typography>

            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <SchoolIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Khóa học"
                  secondary={selectedCourses.map(c => c.courseName).join(", ")}
                />
              </ListItem>
              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <ClassIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Lớp học"
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {selectedClass?.className}
                      </Typography>
                      <br />
                      Giảng viên: {selectedClass?.instructorName} • Phòng: {selectedClass?.roomName}
                      <br />
                      Lịch: {selectedClass?.schedulePattern} • Giờ học: {selectedClass?.startTime} - {selectedClass?.endTime}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemAvatar>
                  <Avatar src={selectedStudent?.avatar} alt={selectedStudent?.fullName}>
                    {selectedStudent?.fullName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Học viên"
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {selectedStudent?.fullName} ({selectedStudent?.studentCode})
                      </Typography>
                      <br />
                      {selectedStudent?.email} • {selectedStudent?.phone}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <CheckCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Phương thức thanh toán"
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {selectedPaymentMethod?.name}
                      </Typography>
                      {selectedPaymentMethod?.description && (
                        <>
                          <br />
                          {selectedPaymentMethod.description}
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              Sau khi xác nhận, hóa đơn sẽ được tạo và học viên cần thanh toán trong thời hạn quy định.
            </Alert>
          </Box>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <PersonAddIcon fontSize="large" color="primary" />
            Thêm học viên vào lớp học
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box sx={{ minHeight: 400 }}>{getStepContent(activeStep)}</Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBeforeIcon />}
              variant="outlined"
            >
              Quay lại
            </Button>
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/admin/students")}
              >
                Hủy
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <NavigateNextIcon />}
                disabled={
                  (activeStep === 0 && !selectedCourses) ||
                  (activeStep === 1 && !selectedClass) ||
                  (activeStep === 2 && !selectedStudent) ||
                  (activeStep === 3 && !selectedPaymentMethod)
                }
              >
                {activeStep === steps.length - 1 ? "Xác nhận" : "Tiếp theo"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận thêm học viên</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn đăng ký học viên <strong>{selectedStudent?.fullName}</strong> vào lớp{" "}
            <strong>{selectedClass?.className}</strong> với phương thức thanh toán{" "}
            <strong>{selectedPaymentMethod?.name}</strong>?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Hóa đơn sẽ được tạo ngay sau khi xác nhận và học viên cần thanh toán trong thời hạn.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting} autoFocus>
            {submitting ? <CircularProgress size={24} /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Student Dialog */}
      <CreateStudentDialog
        open={createStudentDialogOpen}
        onClose={() => setCreateStudentDialogOpen(false)}
        onSuccess={(studentId, studentName) => {
          // Tự động chọn học viên vừa tạo
          const newStudent: StudentSearchResult = {
            studentId,
            studentCode: studentId.toString(),
            fullName: studentName,
            email: "",
            phone: "",
          };
          setSelectedStudent(newStudent);
          setSuccess(`Đã tạo học viên "${studentName}" thành công!`);
        }}
      />

      {/* VNPay Payment Dialog */}
      {createdInvoiceId && (
        <VNPayPaymentDialog
          open={vnpayDialogOpen}
          onClose={handleVnpayDialogClose}
          invoiceId={createdInvoiceId}
          amount={invoiceAmount}
          expiryTime={invoiceExpiryTime}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnrollStudent;
