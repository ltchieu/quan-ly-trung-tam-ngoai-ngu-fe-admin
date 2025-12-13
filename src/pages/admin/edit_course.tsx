import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Tabs, Tab, Button, Paper, CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
} from '@mui/material';
import { ModuleData } from '../../model/module_model';
import { getCourseDetail } from '../../services/course_service';
import { useAxiosPrivate } from '../../hook/useAxiosPrivate';
import EditCurriculum from '../../component/edit_curriculum';
import EditCourseInfo from '../../component/edit_course_infor';
import EditContentDetails from '../../component/edit_content_details';
import { CourseDetailResponse } from '../../model/course_model';

const EditCourse: React.FC = () => {
    useAxiosPrivate();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State cho thông tin cơ bản của khóa học, sử dụng CourseDetailResponse
    const [courseBaseData, setCourseBaseData] = useState<Partial<CourseDetailResponse>>({});

    // State riêng cho danh sách modules
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [skillModuleGroups, setSkillModuleGroups] = useState<import('../../model/course_model').SkillModuleGroup[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [hasOpenClasses, setHasOpenClasses] = useState(false);

    // Hàm fetch dữ liệu ban đầu
    const fetchData = useCallback(async (shouldShowLoading = true) => {
        if (!id) {
            setError("Không tìm thấy ID khóa học.");
            setLoading(false);
            return;
        }
        if (shouldShowLoading) setLoading(true);
        setError(null);
        try {
            const courseIdNum = Number(id);
            const courseRes = await getCourseDetail(courseIdNum);
            const apiCourseData = courseRes.data.data as CourseDetailResponse;
           console.log("Fetched course data:", apiCourseData);

            if (apiCourseData.classInfos && apiCourseData.classInfos.length > 0) {
                setHasOpenClasses(true);
            } else {
                setHasOpenClasses(false);
            }

            // Set dữ liệu Course từ API response vào state
            setCourseBaseData(apiCourseData);

            // Set skill module groups
            if (apiCourseData.skillModules) {
                setSkillModuleGroups(apiCourseData.skillModules);
            } else {
                setSkillModuleGroups([]);
            }

            // Flatten skillModules to ModuleData[]
            const flattenedModules: ModuleData[] = [];
            if (apiCourseData.skillModules) {
                apiCourseData.skillModules.forEach(group => {
                    if (group.modules) {
                        group.modules.forEach(m => {
                            flattenedModules.push({
                                moduleId: m.moduleId,
                                moduleName: m.moduleName,
                                duration: m.duration || 0,
                                skillId: group.skillId,
                                contents: m.contents?.map((c: any) => ({
                                    id: c.id,
                                    contentName: c.contentName || c.contentDescription
                                })) || [],
                                documents: m.documents?.map((d: any) => ({
                                    documentId: d.documentId,
                                    fileName: d.fileName || d.documentTitle,
                                    link: d.link || d.documentUrl,
                                    description: d.description,
                                    image: d.image
                                })) || [],
                                tailieu: [],
                                noidung: []
                            } as any);
                        });
                    }
                });
            }

            const mappedModules = flattenedModules.map(m => ({
                ...m,
                tenmodule: m.moduleName,
                thoiluong: m.duration,
                noidung: m.contents ? m.contents.map((c: any) => ({ tennoidung: c.contentName })) : [],
                tailieu: m.documents ? m.documents.map((d: any) => ({ tenfile: d.fileName, link: d.link, mota: d.description, hinh: d.image })) : []
            }));

            setModules(mappedModules as any);

        } catch (err: any) {
            console.error("Lỗi khi tải dữ liệu:", err);
            const errorMsg = err.response?.data?.message || "Không thể tải dữ liệu khóa học.";
            setError(errorMsg);
            setCourseBaseData({});
            setModules([]);
        } finally {
            if (shouldShowLoading) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Hàm để các component con gọi khi có thay đổi cần fetch lại dữ liệu
    const handleDataNeedsRefresh = () => {
        fetchData(false);
    };

    // ----- Render UI -----

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
    }

    // Kiểm tra xem dữ liệu cơ bản đã load chưa
    if (!courseBaseData.courseName) {
        return <Container><Typography sx={{ mt: 4 }}>Không tìm thấy dữ liệu khóa học.</Typography></Container>;
    }

    return (
        <Container maxWidth="lg">
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, mt: 4 }}>
                <Link underline="hover" color="inherit" href="/">
                    Dashboard
                </Link>
                <Link underline="hover" color="inherit" href="/courses">
                    Khóa học
                </Link>
                <Typography color="text.primary">Chỉnh sửa</Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Chỉnh sửa Khóa học: {courseBaseData.courseName}
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
                            initialData={courseBaseData as CourseDetailResponse}
                            onSaveSuccess={handleDataNeedsRefresh}
                            hasOpenClasses={hasOpenClasses}
                            totalModuleDuration={modules.reduce((total, m) => total + m.duration, 0)}
                        />
                    }
                </div>
                <div role="tabpanel" hidden={activeTab !== 1} id="edit-panel-1">
                    {activeTab === 1 &&
                        <EditCurriculum
                            courseId={Number(id)}
                            initialModules={modules}
                            skillModules={skillModuleGroups}
                            objectives={courseBaseData.objectives || []}
                            totalCourseHours={courseBaseData.studyHours || 0}
                            onModulesChange={handleDataNeedsRefresh}
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
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                    <Button onClick={() => navigate('/courses')}>Quay lại danh sách</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditCourse;