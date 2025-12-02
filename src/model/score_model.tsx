export interface ScoreEntry {
    studentId: number;
    studentName: string;
    score: number | null; // Diem
    note: string; // GhiChu
}

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
}

export const SCORE_TYPES: ScoreType[] = [
    { value: 'ATTENDANCE', label: 'Điểm chuyên cần' },
    { value: 'MIDTERM', label: 'Điểm giữa kỳ' },
    { value: 'FINAL', label: 'Điểm cuối kỳ' },
];

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
