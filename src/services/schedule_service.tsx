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