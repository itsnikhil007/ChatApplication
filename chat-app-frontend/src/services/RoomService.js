import { httpClient } from "../config/AxiosHelper"
import { baseURL } from "../config/AxiosHelper";


export const createRoomApi = async (roomDetail) => {

    const response = await httpClient.post(`/api/v1/rooms`, roomDetail, {
        // headers: {
        //     "Content-Type": "text/plain",
        // },
    });
    return response.data;
}

// export const joinRoomApi = async (roomId) => {

//     const response = await httpClient.get(`/api/v1/rooms/${roomId.trim()}`);
//     return response.data;
// }

export const getMessagess = async (roomId, size=50, page=0) => {

    const response = await httpClient.get(`/api/v1/rooms/${roomId.trim()}/messages?size=${size}&page=${page}`);
    return response.data;
}

export const joinUserApi   = async(roomId, userName) => {

    const response = await httpClient.post(`/api/v1/rooms/${roomId.trim()}/users/${userName.trim()}/join`);
    return response.data;
}

export const userLeave = async (roomId, userName) => {
    const response = await httpClient.delete(`/api/v1/rooms/${roomId.trim()}/users/${userName.trim()}/leave`);
    return response.data;
}

export const getRoomDetails = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
  return response.data;
};


export const getActiveUser = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}/activeUsers`);
  return response.data;
};

