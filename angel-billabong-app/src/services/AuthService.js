// src/services/AuthService.js
import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1";

/**
 * Login function menggunakan sessionStorage.
 * Data akan otomatis terhapus saat tab browser ditutup.
 */
export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        if (response.data.token) {
            // Menggunakan sessionStorage agar lebih aman (auto-delete saat tab tutup)
            sessionStorage.setItem("admin_token", response.data.token);
            sessionStorage.setItem("admin_user", JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Login Gagal";
    }
};

/**
 * Logout manual untuk menghapus semua sesi admin
 */
export const logout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    // Gunakan replace agar user tidak bisa tekan tombol 'back' untuk kembali ke admin
    window.location.replace("/login");
};

/**
 * Logout otomatis tanpa redirect (untuk digunakan di halaman publik)
 */
export const clearAdminSession = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
};

/**
 * Cek apakah user memiliki sesi aktif di tab ini
 */
export const isAuthenticated = () => {
    return sessionStorage.getItem("admin_token") !== null;
};