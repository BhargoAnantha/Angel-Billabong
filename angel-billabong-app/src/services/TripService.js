import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/trips";

// Helper untuk ambil token (agar sinkron dengan AuthService)
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTrips = async () => {
    try {
        const response = await axios.get(API_URL, { headers: getAuthHeader() });
        return response.data || [];
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
};

export const createTrip = async (tripData) => {
    try {
        // Mengonversi string price ke number sebelum dikirim ke Go backend
        const formattedData = {
            ...tripData,
            Price: Number(tripData.Price)
        };
        const response = await axios.post(API_URL, formattedData, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        console.error("Error creating trip:", error);
        throw error;
    }
};

export const updateTrip = async (id, tripData) => {
    try {
        const formattedData = {
            ...tripData,
            Price: Number(tripData.Price)
        };
        const response = await axios.put(`${API_URL}/${id}`, formattedData, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        console.error("Error updating trip:", error);
        throw error;
    }
};

export const deleteTrip = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        console.error("Error deleting trip:", error);
        throw error;
    }
};

export default { getTrips, createTrip, updateTrip, deleteTrip };