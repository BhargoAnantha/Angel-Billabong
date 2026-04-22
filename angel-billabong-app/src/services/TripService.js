import axios from 'axios';

// URL Backend Go kamu
const API_URL = "http://localhost:8080/api/v1/trips";

/**
 * READ: Mengambil semua data trips
 */
export const getTrips = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data || [];
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
};

/**
 * CREATE: Menambah data trip baru
 * @param {Object} tripData - Data trip dari form
 */
export const createTrip = async (tripData) => {
    try {
        const response = await axios.post(API_URL, tripData);
        return response.data;
    } catch (error) {
        console.error("Error creating trip:", error);
        throw error;
    }
};

/**
 * UPDATE: Mengubah data trip berdasarkan ID
 * @param {number} id - ID Trip
 * @param {Object} tripData - Data baru
 */
export const updateTrip = async (id, tripData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, tripData);
        return response.data;
    } catch (error) {
        console.error("Error updating trip:", error);
        throw error;
    }
};

/**
 * DELETE: Menghapus data trip
 * @param {number} id - ID Trip
 */
export const deleteTrip = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting trip:", error);
        throw error;
    }
};

// Export semua sebagai satu objek default (opsional)
export default {
    getTrips,
    createTrip,
    updateTrip,
    deleteTrip
};