import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { SaveScoreRequest, ScoreBoardItem, ClassGradesResponse, StudentGradeInfo, GradeRequest } from "../model/score_model";

export const getClassGrades = async (classId: number | string): Promise<ClassGradesResponse> => {
    const response = await axiosClient.get<ApiResponse<ClassGradesResponse>>(`/lecturers/grades/class/${classId}`);
    console.log("Fetched class grades:", response.data);
    return response.data.data;
};


const mapToScoreBoardItem = (student: StudentGradeInfo): ScoreBoardItem => {
    return {
        studentId: student.studentId,
        studentName: student.studentName,
        attendanceScore: student.attendanceScore,
        midtermScore: student.midtermScore,
        finalScore: student.finalScore,
        averageScore: student.totalScore,
    };
};


export const getScoresByClassId = async (classId: number | string): Promise<ScoreBoardItem[]> => {
    try {
        const gradesResponse = await getClassGrades(classId);
        return gradesResponse.students.map(mapToScoreBoardItem);
    } catch (error: any) {
        console.error("Error fetching class grades:", error);
        throw error;
    }
};

export const submitGrade = async (request: GradeRequest): Promise<number> => {
    const response = await axiosClient.post<ApiResponse<number>>('/lecturers/grades', request);
    return response.data.data; 
};


export const updateGrade = async (gradeId: number, request: GradeRequest): Promise<number> => {
    const response = await axiosClient.put<ApiResponse<number>>(`/lecturers/grades/${gradeId}`, request);
    return response.data.data; 
};

export const saveGrade = async (gradeId: number | null, request: GradeRequest): Promise<number> => {
    if (gradeId) {
        return await updateGrade(gradeId, request);
    } else {
        return await submitGrade(request);
    }
};

export const saveScores = async (request: SaveScoreRequest) => {
    console.warn("saveScores is deprecated. Use submitGrade/updateGrade instead.");
    throw new Error("This API endpoint is deprecated. Please use the new grade submission API.");
};
