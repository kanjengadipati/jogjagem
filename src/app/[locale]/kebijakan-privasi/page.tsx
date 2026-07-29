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
    <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16 text-stone-800">
      <h1 className="font-serif text-3xl font-bold mb-8">Kebijakan Privasi</h1>
      <p className="text-sm text-stone-500 mb-8">Terakhir diperbarui: Juli 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-bold text-base mb-2">1. Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi berikut saat Anda menggunakan platform Jogjagem:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Informasi akun: nama, alamat email, nomor telepon</li>
            <li>Informasi bisnis: nama usaha, kategori, lokasi, deskripsi</li>
            <li>Data penggunaan: halaman yang dikunjungi, interaksi dengan konten</li>
            <li>Data teknis: alamat IP, tipe browser, perangkat yang digunakan</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">2. Penggunaan Informasi</h2>
          <p>Informasi yang kami kumpulkan digunakan untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Menyediakan dan memelihara layanan platform</li>
            <li>Memproses pendaftaran mitra dan listing bisnis</li>
            <li>Mengirimkan notifikasi terkait status aplikasi dan pembayaran</li>
            <li>Meningkatkan pengalaman pengguna dan mengembangkan fitur baru</li>
            <li>Memenuhi kewajiban hukum dan peraturan</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">3. Perlindungan Data</h2>
          <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda, termasuk enkripsi data, kontrol akses, dan prosedur penanganan insiden keamanan.</p>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">4. Pembagian Data</h2>
          <p>Kami tidak menjual data pribadi Anda kepada pihak ketiga. Data dapat dibagikan dengan:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Penyedia layanan pembayaran (Midtrans) untuk pemrosesan transaksi</li>
            <li>Penyedia layanan infrastruktur (hosting, database)</li>
            <li>Otoritas hukum jika diwajibkan oleh peraturan yang berlaku</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">5. Hak Anda</h2>
          <p>Anda memiliki hak untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Mengakses dan memperbarui data pribadi Anda</li>
            <li>Meminta penghapusan data akun Anda</li>
            <li>Menarik persetujuan pemrosesan data</li>
            <li>Mengajukan keluhan terkait perlindungan data</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base mb-2">6. Kontak</h2>
          <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui email yang terdaftar di platform.</p>
        </div>
      </section>
    </main>
  );
}
