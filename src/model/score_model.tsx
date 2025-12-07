export interface ScoreEntry {
    studentId: number;
    studentName: string;
    score: number | null; // Diem
    note: string; // GhiChu
}

// Grade Detail with ID
export interface GradeDetail {
    gradeId: number;
    score: number;
    comment: string | null;
    gradedAt: string;
    gradedByName: string;
}

// Student Grade Info from API
export interface StudentGradeInfo {
    studentId: number;
    studentName: string;
    email: string;
    avatar: string | null;
    enrollmentId: number;
    
    // Điểm số
    attendanceScore: number | null;
    midtermScore: number | null;
    finalScore: number | null;
    totalScore: number | null;
    grade: string | null;
    status: string | null;
    
    // Chi tiết điểm với ID
    attendanceGrade: GradeDetail | null;
    midtermGrade: GradeDetail | null;
    finalGrade: GradeDetail | null;
}

// Class Grades Response from API
export interface ClassGradesResponse {
    classId: number;
    className: string;
    courseId: number;
    courseName: string;
    lecturerId: number;
    lecturerName: string;
    students: StudentGradeInfo[];
}

// Legacy interface for backward compatibility
export interface ScoreBoardItem {
    studentId: number;
    studentName: string;
    attendanceScore: number | null;
    midtermScore: number | null;
    finalScore: number | null;
    averageScore: number | null;
}

export interface ScoreType {
    value: string;
    label: string;
    gradeTypeId: number; // 1=Chuyên cần, 2=Giữa kỳ, 3=Cuối kỳ
}

export const SCORE_TYPES: ScoreType[] = [
    { value: 'ATTENDANCE', label: 'Điểm chuyên cần', gradeTypeId: 1 },
    { value: 'MIDTERM', label: 'Điểm giữa kỳ', gradeTypeId: 2 },
    { value: 'FINAL', label: 'Điểm cuối kỳ', gradeTypeId: 3 },
];

// Grade Request for TEA-02 and TEA-03
export interface GradeRequest {
    enrollmentId: number;
    gradeTypeId: number; // 1=Chuyên cần, 2=Giữa kỳ, 3=Cuối kỳ
    score: number; // 0-10
    comment?: string;
}

export interface ScoreInputRequest {
    studentId: number;
    score: number;
    note: string;
}

export interface SaveScoreRequest {
    classId: number | string;
    type: string; // ATTENDANCE, MIDTERM, FINAL
    scores: ScoreInputRequest[];
}
