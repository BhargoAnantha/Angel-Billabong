import axios from 'axios';

// Sesuaikan dengan endpoint di Registertransport_bookRouter di Go kamu
const API_URL = "http://localhost:8080/api/v1/transport_book";

/**
 * Membuat reservasi transport baru (CREATE/POST)
 * Fungsi ini yang dipanggil di ProcessPayment.jsx
 */
export const createTransportBook = async (bookingData) => {
    try {
        console.log("Sending Transport Payload:", bookingData); // Intip data di console
        const response = await axios.post(API_URL, bookingData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        // Tangkap pesan error spesifik dari Go/PostgreSQL
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Gagal menyimpan ke database";
        console.error("Backend Error:", errorMsg);
        throw new Error(errorMsg);
    }
};

/**
 * Mengambil semua data manifest (GET)
 */
export const getTransportBooks = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching transport books:", error);
        throw error;
    }
};

/**
 * Mengubah status pembayaran (PATCH)
 * Digunakan setelah proses bayar selesai
 */
export const updateTransportBookStatus = async (id, statusData) => {
    try {
        // statusData berisi { payment_status: "Sukses" } 
        const response = await axios.patch(`${API_URL}/${id}/status`, statusData);
        return response.data;
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};