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
    // Menggunakan layanan FormSubmit (Tanpa perlu SMTP / Password API)
    // Email tujuan
    const destEmail = process.env.ADMIN_EMAIL_DEST || 'dompuonline@gmail.com'

    const response = await fetch(`https://formsubmit.co/ajax/${destEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        _subject: `Pendaftaran Mitra Baru 🚀 - ${data.vendorName}`,
        _template: "table", // Format tabel rapi otomatis dari FormSubmit
        Nama_Usaha: data.vendorName,
        Pemilik: data.ownerName,
        WhatsApp: data.phone,
        Kategori: data.category,
        Alamat: data.address,
        Deskripsi: data.description,
      }),
    });

    const result = await response.json();
    console.log("Admin notification sent via FormSubmit:", result);

    return { success: true };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}

