'use client';

import { useLocale } from '@/contexts/LocaleContext';

export default function SyaratKetentuanPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16 text-stone-800">
      <h1 className="font-serif text-3xl font-bold mb-8">Syarat & Ketentuan</h1>
      <p className="text-sm text-stone-500 mb-8">Terakhir diperbarui: Juli 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-bold text-base mb-2">1. Penerimaan Ketentuan</h2>
          <p>Dengan mengakses dan menggunakan platform Jogjagem, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak boleh menggunakan layanan kami.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">2. Pendaftaran Mitra</h2>
          <p>Untuk mendaftar sebagai mitra bisnis, Anda harus:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Memberikan informasi yang akurat dan lengkap</li>
            <li>Bertanggung jawab atas kerahasiaan akun Anda</li>
            <li>Tidak menggunakan platform untuk tujuan ilegal</li>
            <li>Memiliki wewenang untuk mendaftarkan bisnis yang diajukan</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">3. Konten Listing</h2>
          <p>Mitra bertanggung jawab penuh atas konten yang ditampilkan di listing mereka, termasuk namun tidak terbatas pada foto, deskripsi, harga, dan informasi lainnya. Jogjagem berhak untuk meninjau, menyetujui, atau menolak konten yang melanggar pedoman kami.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">4. Pembayaran & Sponsorship</h2>
          <p>Pembayaran untuk layanan sponsorship diproses melalui Midtrans. Pembayaran dianggap sah setelah status transaksi dikonfirmasi sebagai &quot;paid&quot; oleh sistem pembayaran. Jogjagem tidak bertanggung jawab atas kegagalan pembayaran yang disebabkan oleh pihak ketiga.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">5. Pembatasan Tanggung Jawab</h2>
          <p>Jogjagem tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan platform kami. Kami tidak menjamin ketersediaan platform secara terus-menerus tanpa gangguan.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">6. Perubahan Ketentuan</h2>
          <p>Kami berhak untuk mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui platform dan berlaku segera setelah dipublikasikan.</p>
        </div>
      </section>
    </main>
  );
}
