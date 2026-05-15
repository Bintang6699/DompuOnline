import { Resend } from 'resend'

interface AdminEmailData {
  vendorName: string
  ownerName: string
  phone: string
  category: string
  address: string
  description: string
  thumbnailUrl?: string
}

export async function sendAdminNotification(data: AdminEmailData) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY tidak ditemukan. Email tidak terkirim.')
    return { success: false, error: 'No API key' }
  }

  const resend = new Resend(apiKey)

  const now = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const categoryLabel: Record<string, string> = {
    food: '🍽️ Kuliner',
    transport: '🏍️ Transport',
    shopping: '🛍️ Belanja',
    services: '🔧 Jasa',
  }

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pendaftaran Mitra Baru</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                🚀 Mitra Baru Bergabung!
              </h1>
              <p style="margin:8px 0 0;color:#c4b5fd;font-size:14px;">Dompu Online — Notifikasi Admin</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Halo Admin, ada pendaftaran mitra baru yang masuk. Berikut detailnya:
              </p>

              <!-- Info Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;width:140px;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Nama Usaha</td>
                  <td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${data.vendorName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Pemilik</td>
                  <td style="padding:12px 16px;color:#111827;font-size:14px;border-bottom:1px solid #e5e7eb;">${data.ownerName}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">WhatsApp</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
                    <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" style="color:#16a34a;font-weight:700;text-decoration:none;font-size:14px;">
                      📱 ${data.phone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Kategori</td>
                  <td style="padding:12px 16px;color:#111827;font-size:14px;border-bottom:1px solid #e5e7eb;">${categoryLabel[data.category] || data.category}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Alamat</td>
                  <td style="padding:12px 16px;color:#111827;font-size:14px;border-bottom:1px solid #e5e7eb;">${data.address}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;">Waktu Daftar</td>
                  <td style="padding:12px 16px;color:#111827;font-size:14px;">${now}</td>
                </tr>
              </table>

              <!-- Description -->
              <div style="margin-top:20px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Deskripsi</p>
                <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">${data.description.slice(0, 300)}${data.description.length > 300 ? '...' : ''}</p>
              </div>

              <!-- CTA Button -->
              <div style="margin-top:28px;text-align:center;">
                <a href="https://dompuonline.id/admin/vendors" 
                   style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                  Buka Admin Dashboard →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Email ini dikirim otomatis oleh sistem <strong>Dompu Online</strong>. Jangan reply email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const destEmail = process.env.ADMIN_EMAIL_DEST || 'dompuonline@gmail.com'

    const { data: result, error } = await resend.emails.send({
      from: 'Dompu Online <onboarding@resend.dev>', // Domain default Resend (tidak perlu setup domain)
      to: destEmail,
      subject: `🚀 Mitra Baru: ${data.vendorName} — Dompu Online`,
      html,
    })

    if (error) {
      console.error('[Resend] Error:', error)
      return { success: false, error }
    }

    console.log('[Resend] Email terkirim! ID:', result?.id)
    return { success: true }
  } catch (err) {
    console.error('[Resend] Gagal kirim email:', err)
    return { success: false, error: err }
  }
}
