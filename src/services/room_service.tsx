import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { RoomResponse, RoomDetailResponse, CreateRoomRequest } from "../model/room_model";


export async function getAllRooms(): Promise<RoomResponse[]> {
    const response = await axiosClient.get<ApiResponse<RoomResponse[]>>("/rooms/room-name");
    return response.data.data;
}


export async function getRoomById(id: number): Promise<RoomDetailResponse> {
    const response = await axiosClient.get<ApiResponse<RoomDetailResponse>>(`/rooms/${id}`);
    return response.data.data;
}


export async function createRoom(data: CreateRoomRequest): Promise<RoomDetailResponse> {
    const response = await axiosClient.post<ApiResponse<RoomDetailResponse>>("/rooms", data);
    return response.data.data;
}



export function updateRoom(id: number, data: { name: string; capacity: number }) {
    console.warn("updateRoom is not implemented in backend API yet");
    throw new Error("Update room API not available");
}

export function deleteRoom(id: number) {
    console.warn("deleteRoom is not implemented in backend API yet");
    throw new Error("Delete room API not available");
}
