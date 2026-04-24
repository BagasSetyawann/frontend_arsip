import React, { useState, useMemo, useEffect } from "react";
import {
  Inbox,
  Send,
  FileText,
  Home,
  Plus,
  Search,
  File,
  X,
  Eye,
  Menu,
  LogOut,
  Trash2,
  MessageSquareShare,
} from "lucide-react";

// Memanggil komponen dari file terpisah
import Login from "./pages/Login";
import ModalForm from "./components/ModalForm";

// =========================================================================
// 1. KOMPONEN PENDUKUNG
// WAJIB diletakkan di luar komponen App agar tidak re-render & hilang fokus
// =========================================================================

const NavItem = ({
  id,
  icon,
  label,
  activeTab,
  setActiveTab,
  setIsSidebarOpen,
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const DashboardCard = ({ title, count, icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-4 rounded-xl ${bgColor}`}>
      {React.cloneElement(icon, { className: `w-8 h-8 ${color}` })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{count}</p>
    </div>
  </div>
);

// =========================================================================
// 2. KOMPONEN UTAMA (APP)
// =========================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  // --- STATE LOGIN ---
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("username") || "",
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || "staf",
  ); // State Baru untuk Role

  // State untuk Modal Disposisi
  const [isDisposisiOpen, setIsDisposisiOpen] = useState(false);
  const [selectedArsip, setSelectedArsip] = useState(null);
  const [disposisiForm, setDisposisiForm] = useState({
    nomorWa: "",
    pesan: "",
  });
  const [daftarStaf, setDaftarStaf] = useState([]);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setLoggedInUser("");
  };

  // --- FUNGSI AMBIL DATA DARI BACKEND ---
  const fetchArsip = async () => {
    try {
      const response = await fetch(
        "https://backend-arsip.vercel.app/api/arsip",
      );
      const data = await response.json();

      // Tambahkan pengecekan ini!
      if (!response.ok || !Array.isArray(data)) {
        console.error("Gagal mengambil data:", data);
        return;
      }
      const groupedData = {
        suratMasuk: data.filter((item) => item.jenisSurat === "suratMasuk"),
        suratKeluar: data.filter((item) => item.jenisSurat === "suratKeluar"),
        suratKeputusan: data.filter(
          (item) => item.jenisSurat === "suratKeputusan",
        ),
      };
      setArchives(groupedData);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
    }
  };

  const fetchStaf = async () => {
    try {
      const response = await fetch(
        "https://backend-arsip.vercel.app/api/users/staf",
      );
      const data = await response.json();
      setDaftarStaf(data);
    } catch (error) {
      console.error("Gagal mengambil data staf:", error);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchArsip();
      fetchStaf(); // Panggil daftar staf untuk menu dropdown
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchArsip();
  }, [isAuthenticated]);
  const [archives, setArchives] = useState({
    suratMasuk: [],
    suratKeluar: [],
    suratKeputusan: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState("suratMasuk");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKode, setFilterKode] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const initialForm = {
    nomorSurat: "",
    nomorBerkas: "",
    kodeSurat: "",
    penerima: "",
    tanggalSurat: "",
    perihalSurat: "",
    keterangan: "",
    fileUrl: null,
    fileName: "",
  };
  const [formData, setFormData] = useState(initialForm);

  // Panggil fetchArsip otomatis saat web pertama kali dibuka
  useEffect(() => {
    fetchArsip();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        alert("Mohon unggah file dalam format PDF.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileLengkap: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.nomorSurat ||
      !formData.nomorBerkas ||
      !formData.penerima ||
      !formData.tanggalSurat ||
      !formData.perihalSurat
    ) {
      alert("Mohon lengkapi semua isian formulir.");
      return;
    }

    if (formType === "suratKeluar" && !formData.kodeSurat) {
      alert("Kode Surat wajib diisi untuk Surat Keluar!");
      return;
    }

    if (!formData.fileLengkap) {
      alert("Mohon unggah file PDF arsip!");
      return;
    }

    try {
      // ✅ STEP 1: Upload langsung ke Supabase Storage dari frontend
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("arsip-dokumen")
        .upload(uniqueFileName, formData.fileLengkap, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        alert("Gagal mengupload file: " + uploadError.message);
        return;
      }

      // ✅ STEP 2: Ambil URL publik
      const { data: urlData } = supabase.storage
        .from("arsip-dokumen")
        .getPublicUrl(uniqueFileName);

      const publicUrl = urlData.publicUrl;

      // ✅ STEP 3: Kirim data teks + URL ke backend (tanpa file, jadi ringan!)
      const response = await fetch(
        "https://backend-arsip.vercel.app/api/arsip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // ← JSON, bukan FormData
          body: JSON.stringify({
            jenisSurat: formType,
            nomorSurat: formData.nomorSurat,
            nomorBerkas: formData.nomorBerkas,
            kodeSurat: formData.kodeSurat,
            penerima: formData.penerima,
            tanggalSurat: formData.tanggalSurat,
            perihalSurat: formData.perihalSurat,
            keterangan: formData.keterangan,
            fileName: formData.fileLengkap.name,
            filePath: publicUrl, // ← hanya kirim URL
          }),
        },
      );

      if (response.ok) {
        alert("Sukses menyimpan data!");
        await fetchArsip();
        closeModal();
      } else {
        alert("Gagal menyimpan arsip.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  const openModal = (type) => {
    setFormType(type);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  // Fungsi untuk Menghapus Data
  const handleDelete = async (id) => {
    // Munculkan pop-up konfirmasi (jika batal, hentikan fungsi)
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus arsip ini beserta file PDF-nya? Tindakan ini tidak bisa dibatalkan.",
      )
    )
      return;

    try {
      const response = await fetch(
        `https://backend-arsip.vercel.app/api/arsip/${id}`,
        {
          method: "DELETE", // Method DELETE untuk menghapus
        },
      );

      if (response.ok) {
        alert("Arsip berhasil dihapus!");
        await fetchArsip(); // Tarik data terbaru agar tabel langsung hilang
      } else {
        alert("Gagal menghapus arsip.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  // --- FUNGSI WHATSAPP DISPOSISI ---
  const openDisposisiModal = (arsip) => {
    setSelectedArsip(arsip);
    setDisposisiForm({ nomorWa: "", pesan: "" });
    setIsDisposisiOpen(true);
  };

  const kirimDisposisiWhatsApp = (e) => {
    e.preventDefault();

    // Format nomor WA (Ubah angka 0 di depan menjadi 62)
    let noWa = disposisiForm.nomorWa;
    if (noWa.startsWith("0")) {
      noWa = "62" + noWa.substring(1);
    }

    // Buat URL Dokumen (Ubah localhost sesuai domain jika sudah rilis)
    const urlDokumen = selectedArsip.filePath;

    // Format Teks WhatsApp
    const teksWA =
      `*DISPOSISI SURAT MASUK*%0A%0A` +
      `*Dari:* ${userRole.toUpperCase()} (${loggedInUser})%0A` +
      `*No. Surat:* ${selectedArsip.nomorSurat}%0A` +
      `*Perihal:* ${selectedArsip.perihalSurat}%0A%0A` +
      `*Pesan Disposisi:*%0A${disposisiForm.pesan}%0A%0A` +
      `*Link Dokumen:*%0A${urlDokumen}`;

    // Buka WhatsApp Web / App
    window.open(
      `https://api.whatsapp.com/send?phone=${noWa}&text=${teksWA}`,
      "_blank",
    );
    setIsDisposisiOpen(false);
  };
  // Data processing
  const filteredData = useMemo(() => {
    if (activeTab === "dashboard") return [];
    let data = archives[activeTab];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.perihalSurat.toLowerCase().includes(lowerSearch) ||
          item.nomorSurat.toLowerCase().includes(lowerSearch) ||
          item.penerima.toLowerCase().includes(lowerSearch),
      );
    }
    if (activeTab === "suratKeluar" && filterKode) {
      data = data.filter((item) => item.kodeSurat === filterKode);
    }
    return data;
  }, [archives, activeTab, searchTerm, filterKode]);

  const uniqueKodeSurat = useMemo(() => {
    return [
      ...new Set(
        archives.suratKeluar.map((item) => item.kodeSurat).filter(Boolean),
      ),
    ];
  }, [archives.suratKeluar]);
  // Jika belum login, jangan render Dashboard, tapi render halaman Login
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(username, role) => {
          setIsAuthenticated(true);
          setLoggedInUser(username);
          setUserRole(role); // Simpan role ke state
        }}
      />
    );
  }
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Section */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider">E-Arsip</span>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavItem
            id="dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Kategori Surat
            </p>
          </div>
          <NavItem
            id="suratMasuk"
            icon={<Inbox size={20} />}
            label="Surat Masuk"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <NavItem
            id="suratKeluar"
            icon={<Send size={20} />}
            label="Surat Keluar"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <NavItem
            id="suratKeputusan"
            icon={<File size={20} />}
            label="Surat Keputusan"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400 text-center">
          &copy; 2026 Arsiparis v1.0
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 hidden sm:block">
              {activeTab === "dashboard"
                ? "Dashboard"
                : `Manajemen ${activeTab === "suratMasuk" ? "Surat Masuk" : activeTab === "suratKeluar" ? "Surat Keluar" : "Surat Keputusan"}`}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              {/* Nama berubah sesuai user yang login */}
              <span className="text-sm font-bold text-slate-800 capitalize">
                {loggedInUser}
              </span>
              <span className="text-xs text-slate-500">Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border-2 border-white shadow-sm uppercase">
              {loggedInUser.charAt(0)}
            </div>
            {/* Tombol Logout Baru */}
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Ringkasan Arsip
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DashboardCard
                    title="Total Surat Masuk"
                    count={archives.suratMasuk.length}
                    icon={<Inbox />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-100"
                  />
                  <DashboardCard
                    title="Total Surat Keluar"
                    count={archives.suratKeluar.length}
                    icon={<Send />}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                  />
                  <DashboardCard
                    title="Surat Keputusan"
                    count={archives.suratKeputusan.length}
                    icon={<File />}
                    color="text-amber-600"
                    bgColor="bg-amber-100"
                  />
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="p-6 bg-blue-50 rounded-full mb-4">
                    <FileText className="w-16 h-16 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Selamat Datang di Sistem Arsip
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    Pilih menu di sebelah kiri untuk mulai mengelola arsip Anda.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Daftar Arsip
                  </h2>
                  <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    {activeTab === "suratKeluar" && (
                      <select
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                        value={filterKode}
                        onChange={(e) => setFilterKode(e.target.value)}
                      >
                        <option value="">Semua Kode</option>
                        {uniqueKodeSurat.map((kode) => (
                          <option key={kode} value={kode}>
                            {kode}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari..."
                        className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm bg-slate-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => openModal(activeTab)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus size={16} /> Tambah Data
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-6 font-semibold text-sm text-slate-600 border-b">
                          No. Surat
                        </th>
                        <th className="py-4 px-6 font-semibold text-sm text-slate-600 border-b">
                          Tanggal
                        </th>
                        <th className="py-4 px-6 font-semibold text-sm text-slate-600 border-b">
                          Penerima
                        </th>
                        <th className="py-4 px-6 font-semibold text-sm text-slate-600 border-b">
                          Perihal
                        </th>
                        <th className="py-4 px-6 font-semibold text-sm text-slate-600 border-b text-center">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="py-3 px-6 text-sm text-slate-800 font-medium">
                              {item.nomorSurat}
                            </td>
                            {/* Format tanggal agar lebih rapi */}
                            <td className="py-3 px-6 text-sm text-slate-500">
                              {new Date(item.tanggalSurat).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="py-3 px-6 text-sm text-slate-800">
                              {item.penerima}
                            </td>
                            <td className="py-3 px-6 text-sm text-slate-600 truncate max-w-[200px]">
                              {item.perihalSurat}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Tombol Lihat */}
                                {item.filePath && (
                                  <a
                                    href={item.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                    title="Lihat PDF"
                                  >
                                    <Eye size={16} />
                                  </a>
                                )}

                                {/* --- TOMBOL DISPOSISI (Hanya untuk Kepala & Kasubbag) --- */}
                                {(userRole === "kepala" ||
                                  userRole === "kasubbag") &&
                                  activeTab === "suratMasuk" && (
                                    <button
                                      onClick={() => openDisposisiModal(item)}
                                      className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                      title="Disposisi via WhatsApp"
                                    >
                                      <MessageSquareShare size={16} />
                                    </button>
                                  )}

                                {/* Tombol Hapus */}
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="inline-flex p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                  title="Hapus Arsip"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-12 text-center text-slate-500"
                          >
                            Belum ada data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAL WHATSAPP DISPOSISI --- */}
      {isDisposisiOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50 text-emerald-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquareShare size={20} /> Disposisi Surat
              </h3>
              <button
                onClick={() => setIsDisposisiOpen(false)}
                className="hover:text-emerald-900"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={kirimDisposisiWhatsApp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Pilih Penerima Disposisi
                </label>
                <select
                  required
                  value={disposisiForm.nomorWa}
                  onChange={(e) =>
                    setDisposisiForm({
                      ...disposisiForm,
                      nomorWa: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Staf --</option>
                  {daftarStaf.map((staf) => (
                    <option key={staf.id} value={staf.nomorWa}>
                      {/* Mengganti underscore dengan spasi dan membuat hurufnya kapital agar rapi */}
                      {staf.username.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Pesan Instuksi
                </label>
                <textarea
                  required
                  value={disposisiForm.pesan}
                  onChange={(e) =>
                    setDisposisiForm({
                      ...disposisiForm,
                      pesan: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Tolong segera ditindaklanjuti berkas ini..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDisposisiOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
                >
                  Kirim via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ModalForm
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        formType={formType}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
