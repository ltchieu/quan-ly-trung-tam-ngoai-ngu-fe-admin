// Room Response from GET /rooms/room-name and GET /rooms/{id}
export interface RoomResponse {
    roomId: number;
    roomName: string;
    capacity: number;
    status: string | null;
}

// Room Detail Response from GET /rooms/{id}
export interface RoomDetailResponse extends RoomResponse {
    classes?: ClassInRoom[] | null;
}

export interface ClassInRoom {
    classId: number;
    className: string;
    schedulePattern: string;
    startTime: string;
    durationMinutes: number;
}

// Create Room Request for POST /rooms
export interface CreateRoomRequest {
    roomName: string;
    capacity: number;
}
