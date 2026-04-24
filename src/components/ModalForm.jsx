import React, { useRef } from 'react';
import { X, FileText, FileDown, Trash2 } from 'lucide-react';

export default function ModalForm({ isModalOpen, closeModal, formType, formData, handleInputChange, handleFileChange, handleSubmit, handleCancelFile }) {
  if (!isModalOpen) return null;

  // Ref untuk mereset input file agar bisa pilih file yang sama lagi setelah dibatalkan
  const fileInputRef = useRef(null);

  const onCancelFile = () => {
    handleCancelFile(); // Reset state di App.jsx
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input file
  };

  let title = "";
  if (formType === 'suratMasuk') title = "Input Surat Masuk";
  if (formType === 'suratKeluar') title = "Input Surat Keluar";
  if (formType === 'suratKeputusan') title = "Input Surat Keputusan";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nomor Surat</label>
              <input required type="text" name="nomorSurat" value={formData.nomorSurat} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" placeholder="Cth: 001/SK/2026" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nomor Berkas</label>
              <input required type="text" name="nomorBerkas" value={formData.nomorBerkas} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" placeholder="Cth: B-001" />
            </div>

            {formType === 'suratKeluar' && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Kode Surat</label>
                <input required type="text" name="kodeSurat" value={formData.kodeSurat} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" placeholder="Cth: UMUM, KEU" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Penerima / Tujuan</label>
              <input required type="text" name="penerima" value={formData.penerima} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal Surat</label>
              <input required type="date" name="tanggalSurat" value={formData.tanggalSurat} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" />
            </div>

            <div className={`space-y-1.5 ${formType === 'suratKeluar' ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <label className="text-sm font-semibold text-slate-700">Perihal Surat</label>
              <input required type="text" name="perihalSurat" value={formData.perihalSurat} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" />
            </div>

            {formType === 'suratMasuk' && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Keterangan</label>
                <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" />
              </div>
            )}

            {/* ===== AREA UPLOAD FILE ===== */}
            <div className="space-y-1.5 md:col-span-2 mt-2">
              <label className="text-sm font-semibold text-slate-700">Unggah PDF Surat</label>

              {formData.fileName ? (
                // ===== TAMPILAN SETELAH FILE DIPILIH =====
                <div className="flex items-center gap-3 p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                  {/* Icon PDF */}
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <FileDown className="h-8 w-8 text-blue-500" />
                  </div>

                  {/* Nama File */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{formData.fileName}</p>
                    <p className="text-xs text-blue-500 mt-0.5">File siap diunggah ✓</p>
                  </div>

                  {/* Tombol Ganti File */}
                  <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors shrink-0">
                    <span>Ganti</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Tombol Batalkan / Hapus File */}
                  <button
                    type="button"
                    onClick={onCancelFile}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                    title="Batalkan file ini"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                // ===== TAMPILAN SEBELUM FILE DIPILIH =====
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 mt-2">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 px-1">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="application/pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400">PDF hingga 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30">
              Simpan Arsip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
