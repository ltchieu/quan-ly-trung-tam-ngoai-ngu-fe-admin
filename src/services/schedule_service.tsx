import { ScheduleCheckRequest, ScheduleSuggestionResponse } from "../model/schedule_model";
import { axiosClient } from "../api/axios_client";

export const checkAndSuggestSchedule = async (
  request: ScheduleCheckRequest
): Promise<ScheduleSuggestionResponse> => {
  try {
    const response = await axiosClient.post(`/schedules/check-and-suggest`, request);
    return response.data.data;
  } catch (error) {
    console.error("Error checking schedule:", error);
    throw error;
  }
};


export const getWeeklySchedule = async (
  lecturerId: number | null,
  roomId: number | null,
  courseId: number | null,
  date: string
) => {
  try {
    const response = await axiosClient.get(`/courseclasses/schedule-by-week`, {
      params: {
        lecturerId,
        roomId,
        courseId,
        date,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch tuần:", error);
    throw error;
  }
};


export const getTeacherSchedule = async (date: string) => {
  try {
    const response = await axiosClient.get(`/students/schedule-by-week`, {
      params: {
        date,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch tuần:", error);
    throw error;
  }
};

// Cancel a session
export const cancelSession = async (sessionId: number) => {
  console.log("Canceling session with ID:", sessionId);
  try {
    const response = await axiosClient.delete(`/courseclasses/sessions/${sessionId}/cancel`);
    console.log("Hủy buổi học thành công:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi hủy buổi học:", error);
    throw error;
  }
};

// Add makeup session
export const addMakeupSession = async (classId: number, sessionDate: string, note?: string) => {
  try {
    const requestBody = {
      sessionDate,
      ...(note && { note }) // Only include note if it's not empty
    };
    
    console.log("API Request - Add Makeup Session:", {
      url: `/courseclasses/${classId}/sessions`,
      body: requestBody
    });
    
    const response = await axiosClient.post(`/courseclasses/${classId}/sessions`, requestBody);
    console.log("API Response - Add Makeup Session:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Lỗi khi thêm buổi học bù:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Get suggested makeup dates
export const getSuggestedMakeupDates = async (classId: number, daysAhead: number = 7) => {
  try {
    const response = await axiosClient.get(`/courseclasses/${classId}/sessions/suggest-dates`, {
      params: {
        daysAhead
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy gợi ý ngày học bù:", error);
    throw error;
  }
};
