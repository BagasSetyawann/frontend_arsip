import React from 'react';
import { X, FileText, FileDown } from 'lucide-react';

export default function ModalForm({ isModalOpen, closeModal, formType, formData, handleInputChange, handleFileChange, handleSubmit }) {
  if (!isModalOpen) return null;

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

            <div className="space-y-1.5 md:col-span-2 mt-2">
              <label className="text-sm font-semibold text-slate-700">Unggah PDF Surat</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors relative">
                <div className="space-y-1 text-center">
                  {formData.fileName ? (
                    <div className="flex flex-col items-center">
                      <FileDown className="mx-auto h-12 w-12 text-blue-500" />
                      <span className="mt-2 text-sm font-medium text-slate-900">{formData.fileName}</span>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 mt-2">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 px-1">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} required />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
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