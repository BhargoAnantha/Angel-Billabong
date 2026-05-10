package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// ── Konfigurasi Fonnte ────────────────────────────────────────────────────
// Daftar gratis di: https://fonnte.com
// Setelah daftar & connect nomor WA → copy token dari dashboard
const (
	fonnteToken   = "YOUR_FONNTE_TOKEN_HERE" // ← Ganti dengan token Fonnte kamu
	fonnteBaseURL = "https://api.fonnte.com/send"
)

// ── Kirim pesan WA via Fonnte ─────────────────────────────────────────────

func SendWhatsAppMessage(toNumber string, message string) error {
	payload := map[string]string{
		"target":  toNumber, // Format: "628123456789" (tanpa +)
		"message": message,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("gagal marshal payload WA: %w", err)
	}

	req, err := http.NewRequest("POST", fonnteBaseURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("gagal buat request WA: %w", err)
	}

	req.Header.Set("Authorization", fonnteToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("gagal kirim WA: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fonnte API error: status %d", resp.StatusCode)
	}

	return nil
}

// ── Format pesan WA untuk user ────────────────────────────────────────────

func BuildUserWAMessage(data EmailData) string {
	roundTripInfo := ""
	if data.IsRoundTrip {
		roundTripInfo = fmt.Sprintf("\n🔄 Pulang       : %s", data.ReturnDate)
	}

	return fmt.Sprintf(
		`✅ *Pembayaran Dikonfirmasi!*
Angel Billabong Fast Cruise

Halo *%s*! Pembayaran tiket kamu sudah kami konfirmasi.

📋 *Detail Booking:*
━━━━━━━━━━━━━━━━━━
🎫 Kode Booking  : *%s*
🛥️ Rute          : %s
📅 Keberangkatan : %s%s
⏰ Jam            : %s WITA
💳 Metode Bayar  : %s
💰 Total          : IDR %s
━━━━━━━━━━━━━━━━━━

📌 *Cara Cek Reservasi:*
Kunjungi website kami → klik *My Reservation* → masukkan kode *%s* dan email kamu.

Terima kasih sudah memilih Angel Billabong Fast Cruise! 🌊`,
		data.CustomerName,
		data.BookingCode,
		data.RouteName,
		data.DepartureDate,
		roundTripInfo,
		data.DepartureTime,
		data.Payment,
		data.TotalPrice,
		data.BookingCode,
	)
}

// ── Format pesan WA untuk admin (notifikasi internal) ─────────────────────

func BuildAdminWAMessage(data EmailData, customerWA string) string {
	roundTripInfo := ""
	if data.IsRoundTrip {
		roundTripInfo = fmt.Sprintf("\n🔄 Pulang       : %s", data.ReturnDate)
	}

	return fmt.Sprintf(
		`🔔 *Notifikasi Admin — Booking Sukses*
Angel Billabong Internal

Booking berikut telah dikonfirmasi sukses:

📋 *Detail:*
━━━━━━━━━━━━━━━━━━
🎫 Kode           : *%s*
👤 Pemesan        : %s
📱 WA             : %s
🛥️ Rute           : %s
📅 Keberangkatan  : %s%s
💰 Total          : IDR %s
━━━━━━━━━━━━━━━━━━

Email konfirmasi & notif WA telah dikirim ke user.`,
		data.BookingCode,
		data.CustomerName,
		customerWA,
		data.RouteName,
		data.DepartureDate,
		roundTripInfo,
		data.TotalPrice,
	)
}