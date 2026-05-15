import nodemailer from 'nodemailer'

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
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // HTML Template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6b21a8; border-bottom: 2px solid #f3e8ff; padding-bottom: 10px;">
          Pendaftaran Mitra Baru 🚀
        </h2>
        
        <div style="margin-top: 20px;">
          <p>Halo Admin,</p>
          <p>Terdapat pendaftaran mitra baru di <strong>Dompu Online</strong>. Berikut detailnya:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 120px; color: #666;"><strong>Nama Usaha</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${data.vendorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Pemilik</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>WhatsApp</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" style="color: #25D366; text-decoration: none;">
                  ${data.phone}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Kategori</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${data.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Alamat</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.address}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Deskripsi Singkat:</strong></p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${data.description}</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://dompuonline.com/admin/vendors" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Buka Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    `

    const destEmail = process.env.ADMIN_EMAIL_DEST || 'dompuonline@gmail.com'

    // Only send if credentials exist, otherwise just log to prevent server error
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: \`"Dompu Online" <\${process.env.SMTP_USER}>\`,
        to: destEmail,
        subject: \`New Mitra Registration - \${data.vendorName} (\${data.category})\`,
        html: html,
      })
      console.log('Admin notification email sent successfully')
    } else {
      console.log('SMTP credentials not found. Email simulation mode:', html)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send admin notification email:', error)
    return { success: false, error }
  }
}
