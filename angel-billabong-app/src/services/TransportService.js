import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/transport"; // Ganti port sesuai backendmu

export const getTransports = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createTransport = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateTransport = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteTransport = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};