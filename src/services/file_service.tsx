import { axiosMultipart, axiosClient } from "../api/axios_client";

//Upload ảnh
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosMultipart.post("/files", formData);
    return response.data.data.fileUrl;
}

//Lấy đường dẫn ảnh
export function getImageUrl(fileName: string): string {
    console.log(axiosClient.defaults.baseURL + "/files/" + fileName);
    return `${axiosClient.defaults.baseURL}/files/${fileName}`;
}