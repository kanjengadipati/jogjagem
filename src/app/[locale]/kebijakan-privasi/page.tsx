'use client';

import { useLocale } from '@/contexts/LocaleContext';

export default function KebijakanPrivasiPage() {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  if (isEn) {
    return (
      <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16 text-stone-800">
        <h1 className="font-serif text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-stone-500 mb-8">Last updated: July 2026</p>

        <section className="space-y-6 text-sm leading-relaxed">
          {/* ... (keep existing English version) ... */}
          <div>
            <h2 className="font-bold text-base mb-2">1. Information We Collect</h2>
            <p>We collect the following information when you use the Jogjagem platform:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Account information: name, email address, phone number</li>
              <li>Business information: business name, category, location, description</li>
              <li>Usage data: pages visited, interactions with content</li>
              <li>Technical data: IP address, browser type, device information</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">2. Use of Information</h2>
            <p>The information we collect is used to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain the platform services</li>
              <li>Process partner registration and business listings</li>
              <li>Send notifications regarding application and payment status</li>
              <li>Improve user experience and develop new features</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">3. Data Protection</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal data, including data encryption, access controls, and security incident handling procedures.</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data to third parties. Data may be shared with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Payment service providers (Midtrans) for transaction processing</li>
              <li>Infrastructure service providers (hosting, database)</li>
              <li>Legal authorities if required by applicable regulations</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access and update your personal data</li>
              <li>Request deletion of your account data</li>
              <li>Withdraw consent for data processing</li>
              <li>Submit complaints regarding data protection</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">6. Contact</h2>
            <p>If you have questions about this Privacy Policy, please contact us through the email registered on the platform.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white max-w-4xl mx-auto px-6 py-16 text-stone-800">
      <h1 className="font-serif text-3xl font-bold mb-4">Kebijakan Privasi & Persetujuan — Jogjagem</h1>
      <p className="text-sm text-stone-500 mb-2"><strong>Terakhir diperbarui:</strong> [isi tanggal]</p>
      <p className="text-sm text-stone-500 mb-8"><strong>Berlaku untuk:</strong> Situs web, aplikasi, dan Portal Bisnis Jogjagem</p>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 text-sm text-amber-800">
        <p><strong>Catatan:</strong> Dokumen ini adalah draf standar/template yang disusun mengacu pada prinsip umum Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan praktik terbaik industri. Sebelum dipublikasikan, mohon direview oleh konsultan hukum/legal counsel untuk memastikan kepatuhan penuh sesuai kondisi operasional Anda (termasuk penunjukan Pejabat/Petugas Pelindungan Data jika diwajibkan).</p>
      </div>

      <section className="space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="font-bold text-xl mb-4">1. Pendahuluan</h2>
          <p>Kebijakan Privasi & Persetujuan ini menjelaskan bagaimana kami ("Jogjagem", "Kami") mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi data pribadi Anda ("Pengguna", "Anda") saat menggunakan Platform kami — mencakup situs pencarian destinasi wisata, Portal Bisnis, fitur klaim listing, dan layanan iklan.</p>
          <p className="mt-4">Dengan membuat akun, mendaftarkan bisnis, mengajukan klaim, memasang iklan, berlangganan paket, atau menggunakan fitur Platform lainnya, Anda memberikan persetujuan atas pengumpulan dan pemrosesan data pribadi sebagaimana dijelaskan dalam dokumen ini.</p>
        </div>

        <div>
          <h2 className="font-bold text-xl mb-4">2. Data yang Kami Kumpulkan</h2>
          <h3 className="font-bold text-lg mb-2">2.1. Data yang Anda berikan langsung</h3>
          <table className="w-full border-collapse border border-stone-200 mb-6">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-stone-200 p-2 text-left">Kategori</th>
                <th className="border border-stone-200 p-2 text-left">Contoh Data</th>
                <th className="border border-stone-200 p-2 text-left">Konteks Pengumpulan</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-stone-200 p-2">Data akun</td><td className="border border-stone-200 p-2">Nama, email, kata sandi (terenkripsi), nomor telepon</td><td className="border border-stone-200 p-2">Registrasi akun</td></tr>
              <tr><td className="border border-stone-200 p-2">Data bisnis</td><td className="border border-stone-200 p-2">Nama bisnis, kategori, deskripsi, alamat, nomor telepon usaha, email usaha, website, foto/avatar bisnis</td><td className="border border-stone-200 p-2">Pendaftaran bisnis / Klaim listing</td></tr>
              <tr><td className="border border-stone-200 p-2">Dokumen verifikasi</td><td className="border border-stone-200 p-2">Bukti kepemilikan usaha, dokumen legalitas (jika diminta)</td><td className="border border-stone-200 p-2">Proses verifikasi Klaim Bisnis</td></tr>
              <tr><td className="border border-stone-200 p-2">Data pembayaran</td><td className="border border-stone-200 p-2">Detail transaksi (nominal, status, ID transaksi) — <strong>bukan</strong> nomor kartu lengkap</td><td className="border border-stone-200 p-2">Pembayaran iklan/langganan via mitra pembayaran (Midtrans)</td></tr>
              <tr><td className="border border-stone-200 p-2">Konten yang diunggah</td><td className="border border-stone-200 p-2">Ulasan, balasan ulasan, materi iklan (gambar, teks, tautan tujuan)</td><td className="border border-stone-200 p-2">Interaksi dengan fitur Platform</td></tr>
              <tr><td className="border border-stone-200 p-2">Komunikasi</td><td className="border border-stone-200 p-2">Isi pesan saat menghubungi dukungan pelanggan</td><td className="border border-stone-200 p-2">Layanan pelanggan</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold text-lg mb-2">2.2. Data yang dikumpulkan secara otomatis</h3>
          <table className="w-full border-collapse border border-stone-200">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-stone-200 p-2 text-left">Kategori</th>
                <th className="border border-stone-200 p-2 text-left">Contoh Data</th>
                <th className="border border-stone-200 p-2 text-left">Tujuan</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-stone-200 p-2">Data teknis</td><td className="border border-stone-200 p-2">Alamat IP, jenis perangkat, browser, sistem operasi</td><td className="border border-stone-200 p-2">Keamanan & optimasi layanan</td></tr>
              <tr><td className="border border-stone-200 p-2">Data penggunaan</td><td className="border border-stone-200 p-2">Halaman yang dikunjungi, waktu akses, interaksi klik</td><td className="border border-stone-200 p-2">Analitik & peningkatan produk</td></tr>
              <tr><td className="border border-stone-200 p-2">Data iklan</td><td className="border border-stone-200 p-2">Tayangan (impression) dan klik pada Ad Campaign / House Ads</td><td className="border border-stone-200 p-2">Pelaporan performa iklan kepada Pemilik Bisnis, pencegahan penyalahgunaan</td></tr>
              <tr><td className="border border-stone-200 p-2">Cookie & teknologi serupa</td><td className="border border-stone-200 p-2">Lihat Pasal 7</td><td className="border border-stone-200 p-2">Fungsionalitas situs, preferensi, analitik</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="font-bold text-xl mb-4">3. Dasar & Tujuan Pemrosesan Data</h2>
          <p>Kami memproses data pribadi Anda berdasarkan salah satu dasar berikut, sesuai konteksnya:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Persetujuan (consent)</strong> — untuk komunikasi pemasaran, cookie non-esensial, dan penggunaan data yang tidak wajib secara kontraktual.</li>
            <li><strong>Pelaksanaan kontrak</strong> — untuk menyediakan akun, memproses klaim bisnis, menayangkan iklan, dan memproses pembayaran langganan.</li>
            <li><strong>Kewajiban hukum</strong> — untuk kepatuhan terhadap peraturan perundang-undangan yang berlaku.</li>
            <li><strong>Kepentingan sah (legitimate interest)</strong> — untuk keamanan platform, pencegahan penipuan, dan peningkatan layanan, sepanjang tidak mengesampingkan hak Anda.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-xl mb-4">4. Berbagi Data dengan Pihak Ketiga</h2>
          <p>Kami <strong>tidak menjual</strong> data pribadi Anda. Kami dapat membagikan data pribadi terbatas kepada mitra pembayaran, penyedia infrastruktur, otoritas berwenang, dll. Data bisnis publik akan ditampilkan publik.</p>
        </div>

        {/* ... (rest of sections) ... */}
        <div>
          <h2 className="font-bold text-xl mb-4">10. Kontak & Pengaduan</h2>
          <p>Untuk pertanyaan, permintaan terkait data pribadi, atau pengaduan mengenai Kebijakan Privasi ini, silakan hubungi:</p>
          <p className="mt-2"><strong>[Nama Entitas/Perusahaan]</strong><br />
          Email: [isi email khusus privasi/data protection]<br />
          Alamat: [isi alamat]<br />
          [Jika diwajibkan] Petugas Pelindungan Data: [nama/kontak]</p>
        </div>
      </section>
    </main>
  );
}
