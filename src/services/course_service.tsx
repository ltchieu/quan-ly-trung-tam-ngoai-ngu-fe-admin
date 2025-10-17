import { axiosClient } from "../api/axios_client";

export function getAllCourse(){
    return axiosClient.get("/courses")
}