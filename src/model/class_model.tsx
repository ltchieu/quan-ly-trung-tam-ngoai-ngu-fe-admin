export interface ClassView {
  malop: number;
  tenlop: string;
  tenPhong: string;
  lichHoc: string;
  tenGiangVien: string;
  trangThai: string;
  makhoahoc: number;
}

export interface CourseFilterData {
  courseId: number;
  courseName: string;
}

export interface LecturerFilterData {
    lecturerId: number;
    lecturerName: string;
}
export interface RoomFilterData {
    roomId: number;
    roomName: string;
}

export interface ClassCreationRequest {
  courseId: number | string;
  className: string;
  lecturerId: number | string;
  roomId: number | string;
  schedule: string;
  startTime: string;
  minutesPerSession: number | string;
  startDate: string;
  note?: string;
}

export interface CheckConflictRequest {
  schedulePattern: string;
  startTime: string;
  durationMinutes: number;
  startDate: string;
}