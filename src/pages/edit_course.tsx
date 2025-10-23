import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Tabs, Tab, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { ModuleData } from '../model/module_model';
import { getCourseDetail, getModulesByCourseId } from '../services/course_service';
import EditCurriculum from '../component/edit_curriculum';
import EditCourseInfo from '../component/edit_course_infor';
import EditContentDetails from '../component/edit_content_details';
import { CourseDetails } from '../model/course_model';

const EditCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State cho thông tin cơ bản của khóa học
    const [courseBaseData, setCourseBaseData] = useState<Partial<CourseDetails>>({});

    // State riêng cho danh sách modules
    const [modules, setModules] = useState<ModuleData[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Hàm fetch dữ liệu ban đầu
    const fetchData = useCallback(async () => {
        if (!id) {
            setError("Không tìm thấy ID khóa học.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const courseIdNum = Number(id);
            // Fetch song song
            const [courseRes, modulesRes] = await Promise.all([
                getCourseDetail(courseIdNum),
                getModulesByCourseId(courseIdNum) // Fetch modules riêng
            ]);

            // Map dữ liệu Course từ API response vào state
            const apiCourseData = courseRes.data.data; // Giả sử dữ liệu nằm ở đây
            setCourseBaseData({
                tenkhoahoc: apiCourseData.courseName,
                hocphi: apiCourseData.tuitionFee,
                video: apiCourseData.video,
                description: apiCourseData.description,
                entryLevel: apiCourseData.entryLevel,
                targetLevel: apiCourseData.targetLevel,
                image: apiCourseData.image,
                sogiohoc: apiCourseData.studyHours,
                sobuoihoc: apiCourseData.numberOfSessions,
                muctieu: apiCourseData.objectives?.map((o: any) => ({ tenmuctieu: o.objectiveName })) || [],
            });

            // API getModules trả về trực tiếp mảng modules
            setModules(modulesRes.data || []);

        } catch (err: any) { 
            console.error("Lỗi khi tải dữ liệu:", err);
            const errorMsg = err.response?.data?.message || "Không thể tải dữ liệu khóa học hoặc modules.";
            setError(errorMsg);
            setCourseBaseData({});
            setModules([]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Gọi fetchData khi component mount hoặc courseId thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]); 

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Hàm để các component con gọi khi có thay đổi cần fetch lại dữ liệu
    const handleDataNeedsRefresh = () => {
        fetchData();
    };

    // ----- Render UI -----

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
    }

    // Kiểm tra xem dữ liệu cơ bản đã load chưa
    if (!courseBaseData.tenkhoahoc) {
         return <Container><Typography sx={{ mt: 4 }}>Không tìm thấy dữ liệu khóa học.</Typography></Container>;
    }

    return (
        <Container component={Paper} sx={{ p: 4, mt: 4, borderRadius: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa Khóa học: {courseBaseData.tenkhoahoc}
            </Typography>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Course edit tabs">
                    <Tab label="Thông tin chung" id="edit-tab-0" aria-controls="edit-panel-0" />
                    <Tab label="Mục tiêu & Chương trình" id="edit-tab-1" aria-controls="edit-panel-1" />
                    <Tab label="Nội dung chi tiết" id="edit-tab-2" aria-controls="edit-panel-2" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <div role="tabpanel" hidden={activeTab !== 0} id="edit-panel-0" aria-labelledby="edit-tab-0">
                 {activeTab === 0 &&
                    <EditCourseInfo
                        courseId={Number(id)}
                        initialData={courseBaseData as CourseDetails}
                        onSaveSuccess={handleDataNeedsRefresh}
                    />
                 }
            </div>
            {/* <div role="tabpanel" hidden={activeTab !== 1} id="edit-panel-1">
                 {activeTab === 1 &&
                    <EditCurriculum
                        courseId={Number(courseId)}
                        initialModules={modules} 
                        objectives={courseBaseData.muctieu || []}
                        onModulesChange={handleDataNeedsRefresh}
                        // Truyền hàm setData cho objectives nếu cần xử lý lưu ở đây
                        // setDataObjectives={(newObjectives) => setCourseBaseData(prev => ({...prev, muctieu: newObjectives}))}
                    />
                 }
            </div>
             <div role="tabpanel" hidden={activeTab !== 2} id="edit-panel-2">
                 {activeTab === 2 &&
                    <EditContentDetails
                         modules={modules} 
                         onModulesChange={handleDataNeedsRefresh}
                    />
                 }
            </div> */}

             <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                <Button onClick={() => navigate('/courses')}>Quay lại danh sách</Button>
            </Box>
        </Container>
    );
};

export default EditCourse;