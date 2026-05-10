package main

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
)

const (
	smtpHost     = "smtp.gmail.com"
	smtpPort     = "587"
	smtpEmail    = "firmanjulsyahputra@gmail.com"
	smtpPassword = "yitd lbvr eunf neaa"
	senderName   = "Angel Billabong Fast Cruise"
)

const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #001D35; padding: 40px 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .header p { color: #60a5fa; font-size: 12px; margin: 8px 0 0; letter-spacing: 2px; text-transform: uppercase; }
    .badge { display: inline-block; background: #10b981; color: white; font-size: 11px; font-weight: 700; padding: 6px 18px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; margin-top: 20px; }
    .body { padding: 40px; }
    .greeting { font-size: 16px; color: #0f172a; font-weight: 600; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 32px; }
    .booking-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 28px; margin-bottom: 28px; text-align: center; }
    .booking-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .booking-code { font-size: 32px; font-weight: 900; color: #001D35; letter-spacing: 4px; font-family: 'Courier New', monospace; }
    .details-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-key { font-size: 12px; color: #64748b; font-weight: 500; }
    .detail-val { font-size: 12px; color: #0f172a; font-weight: 700; text-align: right; max-width: 60%; }
    .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
    .info-box p { font-size: 12px; color: #1e40af; margin: 0; line-height: 1.6; }
    .cta { text-align: center; margin: 32px 0 8px; }
    .cta a { background: #001D35; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: inline-block; }
    .footer { background: #f8fafc; padding: 28px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Angel Billabong Fast Cruise</h1>
      <p>Sanur ↔ Nusa Penida</p>
      <div class="badge">✓ Payment Confirmed</div>
    </div>

    <div class="body">
      <p class="greeting">Hi, {{.FirstName}}!</p>
      <p class="sub">
        Pembayaran tiket perjalanan kamu telah kami konfirmasi. Simpan kode booking di bawah ini untuk mengelola reservasi kamu.
      </p>

      <div class="booking-box">
        <div class="booking-label">Booking Code</div>
        <div class="booking-code">{{.BookingCode}}</div>
      </div>

      <div class="details-title">Detail Perjalanan</div>

      <div class="detail-row">
        <span class="detail-key">Nama Pemesan</span>
        <span class="detail-val">{{.CustomerName}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Rute / Paket</span>
        <span class="detail-val">{{.RouteName}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Tanggal Keberangkatan</span>
        <span class="detail-val">{{.DepartureDate}}</span>
      </div>

      {{if .DepartureTime}}
      <div class="detail-row">
        <span class="detail-key">Jam Keberangkatan</span>
        <span class="detail-val">{{.DepartureTime}} WITA</span>
      </div>
      {{end}}

      {{if .IsRoundTrip}}
      <div class="detail-row">
        <span class="detail-key">Tanggal Pulang</span>
        <span class="detail-val">{{.ReturnDate}}</span>
      </div>
      {{end}}

      {{if .ReturnTime}}
      <div class="detail-row">
        <span class="detail-key">Jam Pulang</span>
        <span class="detail-val">{{.ReturnTime}} WITA</span>
      </div>
      {{end}}

      {{if .TourSession}}
      <div class="detail-row">
        <span class="detail-key">Sesi Tour</span>
        <span class="detail-val">{{.TourSession}}</span>
      </div>
      {{end}}

      <div class="detail-row">
        <span class="detail-key">Total Pembayaran</span>
        <span class="detail-val">IDR {{.TotalPrice}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Metode Pembayaran</span>
        <span class="detail-val">{{.Payment}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Status</span>
        <span class="detail-val" style="color:#10b981;">✓ Sukses</span>
      </div>

      <div class="info-box">
        <p>
          <strong>Cara cek reservasi:</strong><br>
          Kunjungi website kami → klik <strong>My Reservation</strong> → masukkan kode booking <strong>{{.BookingCode}}</strong> dan email kamu.
        </p>
      </div>

      <div class="cta">
        <a href="https://angelbillabong.com">Kunjungi Website Kami</a>
      </div>
    </div>

    <div class="footer">
      <p>Angel Billabong Fast Cruise • Sanur, Bali, Indonesia</p>
      <p style="margin-top:4px;">Email ini dikirim otomatis. Jangan balas email ini.</p>
    </div>
  </div>
</body>
</html>
`

// ── EmailData — semua field yang dipakai template ─────────────────────────────

type EmailData struct {
	FirstName     string
	CustomerName  string
	BookingCode   string
	RouteName     string
	DepartureDate string
	DepartureTime string // Jam berangkat transport (kosong jika tidak ada)
	ReturnDate    string // Tanggal pulang (round trip transport)
	ReturnTime    string // ✅ FIX: Jam pulang round trip transport
	TourSession   string // ✅ FIX: Sesi tour untuk trip booking (misal "07.30 - 08.15")
	TotalPrice    string
	Payment       string
	IsRoundTrip   bool
}

// ── Kirim email ───────────────────────────────────────────────────────────────

func SendBookingConfirmationEmail(toEmail string, data EmailData) error {
	tmpl, err := template.New("email").Parse(emailTemplate)
	if err != nil {
		return fmt.Errorf("gagal parse template: %w", err)
	}

	var bodyBuf bytes.Buffer
	if err := tmpl.Execute(&bodyBuf, data); err != nil {
		return fmt.Errorf("gagal render template: %w", err)
	}

	subject := fmt.Sprintf("✅ Booking Confirmed — %s | Angel Billabong Fast Cruise", data.BookingCode)

	headers := fmt.Sprintf(
		"From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n",
		senderName, smtpEmail, toEmail, subject,
	)

	message := []byte(headers + bodyBuf.String())

	auth := smtp.PlainAuth("", smtpEmail, smtpPassword, smtpHost)
	addr := smtpHost + ":" + smtpPort

	if err := smtp.SendMail(addr, auth, smtpEmail, []string{toEmail}, message); err != nil {
		return fmt.Errorf("gagal kirim email: %w", err)
	}

	return nil
}