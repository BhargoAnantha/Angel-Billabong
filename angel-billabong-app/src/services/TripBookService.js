import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/trip-books";

/**
 * Membuat reservasi trip baru
 */
export const createTripBook = async (bookingData) => {
    try {
        console.log("Sending Payload:", bookingData);
        const response = await axios.post(API_URL, bookingData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        const serverError = error.response?.data?.error;
        const friendlyMsg = error.response?.data?.message;
        const genericMsg  = "Gagal membuat reservasi. Pastikan koneksi server aman.";
        const finalError  = serverError || friendlyMsg || genericMsg;
        console.error("Error creating trip book:", { status: error.response?.status, detail: finalError });
        throw new Error(finalError);
    }
};

/**
 * Mengambil semua data reservasi trip
 */
export const getTripBooks = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Error fetching trip books:", error.message);
        return [];
    }
};

/**
 * Mengambil detail reservasi berdasarkan ID
 */
export const getTripBookById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching trip book ${id}:`, error.message);
        throw error;
    }
};

/**
 * ✅ FIX: Update status reservasi menggunakan PATCH /status
 * Endpoint ini yang trigger kirim email + WA di backend Go
 * statusData contoh: { status: "Sukses" }
 */
export const updateTripBookStatus = async (id, statusData) => {
    try {
        // WAJIB PATCH ke /status — bukan PUT ke /:id
        // Endpoint PATCH /:id/status di trip_book.go yang trigger email & WA
        const response = await axios.patch(`${API_URL}/${id}/status`, statusData);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`Error updating trip status ${id}:`, errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * Menghapus data reservasi
 */
export const deleteTripBook = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting trip book ${id}:`, error.message);
        throw error;
    }
};