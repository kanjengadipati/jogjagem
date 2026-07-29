'use client';

import { useLocale } from '@/contexts/LocaleContext';

export default function SyaratKetentuanPage() {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  if (isEn) {
    return (
      <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16 text-stone-800">
        <h1 className="font-serif text-3xl font-bold mb-8">Terms & Conditions</h1>
        <p className="text-sm text-stone-500 mb-8">Last updated: July 2026</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="font-bold text-base mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using the Jogjagem platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part, you must not use our services.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">2. Partner Registration</h2>
            <p>To register as a business partner, you must:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Be responsible for the confidentiality of your account</li>
              <li>Not use the platform for illegal purposes</li>
              <li>Have the authority to register the submitted business</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">3. Prohibited Content</h2>
            <p>Partners are prohibited from displaying or advertising the following content on Jogjagem:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Products or services that violate Indonesian law</li>
              <li>Alcoholic beverages and illegal substances</li>
              <li>Prostitution and adult content</li>
              <li>Illegal online lending services</li>
              <li>Gambling in any form, including online gambling</li>
              <li>Products or services that infringe intellectual property rights</li>
            </ul>
            <p className="mt-2">Jogjagem reserves the right to reject, disable, or remove listings that violate these terms without prior notice.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">4. Listing Content</h2>
            <p>Partners are fully responsible for the content displayed in their listings, including but not limited to photos, descriptions, prices, and other information. Jogjagem reserves the right to review, approve, or reject content that violates our guidelines.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">5. Payment &amp; Sponsorship</h2>
            <p>Payments for sponsorship services are processed through Midtrans. Payment is deemed valid after the transaction status is confirmed as &quot;paid&quot; by the payment system. Jogjagem is not responsible for payment failures caused by third parties.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">6. Limitation of Liability</h2>
            <p>Jogjagem is not liable for direct, indirect, incidental, or consequential damages arising from the use of our platform. We do not guarantee uninterrupted availability of the platform.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">7. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms & Conditions at any time. Changes will be announced through the platform and take effect immediately upon publication.</p>
          </div>
        </section>
      </main>
    );
  }

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
          <h2 className="font-bold text-base mb-2">3. Konten yang Dilarang</h2>
          <p>Mitra dilarang menampilkan atau mengiklankan konten berikut di platform Jogjagem:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Produk atau jasa yang melanggar hukum Indonesia</li>
            <li>Minuman beralkohol dan zat terlarang</li>
            <li>Prostitusi dan konten dewasa</li>
            <li>Pinjaman online (pinjol) ilegal</li>
            <li>Perjudian dalam bentuk apa pun, termasuk judi online</li>
            <li>Produk atau jasa yang melanggar hak kekayaan intelektual</li>
          </ul>
          <p className="mt-2">Jogjagem berhak untuk menolak, menonaktifkan, atau menghapus listing yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">4. Konten Listing</h2>
          <p>Mitra bertanggung jawab penuh atas konten yang ditampilkan di listing mereka, termasuk namun tidak terbatas pada foto, deskripsi, harga, dan informasi lainnya. Jogjagem berhak untuk meninjau, menyetujui, atau menolak konten yang melanggar pedoman kami.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">5. Pembayaran & Sponsorship</h2>
          <p>Pembayaran untuk layanan sponsorship diproses melalui Midtrans. Pembayaran dianggap sah setelah status transaksi dikonfirmasi sebagai &quot;paid&quot; oleh sistem pembayaran. Jogjagem tidak bertanggung jawab atas kegagalan pembayaran yang disebabkan oleh pihak ketiga.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">6. Pembatasan Tanggung Jawab</h2>
          <p>Jogjagem tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan platform kami. Kami tidak menjamin ketersediaan platform secara terus-menerus tanpa gangguan.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">7. Perubahan Ketentuan</h2>
          <p>Kami berhak untuk mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui platform dan berlaku segera setelah dipublikasikan.</p>
        </div>
      </section>
    </main>
  );
}
