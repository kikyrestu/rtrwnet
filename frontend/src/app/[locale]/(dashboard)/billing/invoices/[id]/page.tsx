'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Printer, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.get(`/invoices/${params.id}`)
        .then(res => {
          setInvoice(res);
          setLoading(false);
        })
        .catch(err => {
          // err logged
          Swal.fire({text: 'Gagal mengambil data tagihan',   icon: 'info'});
          setLoading(false);
        });
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleWA = async () => {
    if (!confirm('Kirim reminder tagihan via WhatsApp?')) return;
    try {
      await api.post(`/invoices/${params.id}/remind`, {});
      Swal.fire({text: 'Reminder berhasil dikirim!',   icon: 'info'});
    } catch (err: any) {
      Swal.fire({text: err.response?.data?.message || 'Gagal mengirim WA',   icon: 'info'});
    }
  };

  const handlePay = async () => {
    if (!confirm('Tandai lunas manual?')) return;
    try {
      await api.post(`/invoices/${params.id}/pay`, {});
      Swal.fire({text: 'Berhasil menandai lunas!',   icon: 'info'});
      window.location.reload();
    } catch (err: any) {
      Swal.fire({text: err.response?.data?.message || 'Gagal',   icon: 'info'});
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center text-red-400">Invoice tidak ditemukan</div>;
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="space-y-6">
      {/* Action Bar - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-slate-900/50 p-4 rounded-xl border border-white/5 print:hidden">
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </button>
        <div className="flex flex-wrap gap-2">
          {!isPaid && (
            <>
              <button onClick={handlePay} className="flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors border border-emerald-500/20 font-medium">
                <CheckCircle2 size={16} className="mr-2" />
                Tandai Lunas
              </button>
              <button onClick={handleWA} className="flex items-center px-4 py-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 rounded-lg transition-colors border border-emerald-600/20 font-medium">
                <MessageSquare size={16} className="mr-2" />
                Kirim WA
              </button>
            </>
          )}
          <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-slate-700/50 text-white hover:bg-slate-700 rounded-lg transition-colors font-medium border border-white/10">
            <Printer size={16} className="mr-2" />
            Cetak
          </button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:bg-transparent">
        {/* Header */}
        <div className="bg-slate-50 p-8 sm:p-12 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-8 items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">INVOICE</h1>
            <p className="text-slate-500 mt-2 font-medium">#{invoice.invoice_number || `INV-${invoice.id.toString().padStart(6, '0')}`}</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-xl font-bold">RT-RW Net PAKAAM</h2>
            <p className="text-slate-500 text-sm mt-1">Jl. Contoh Alamat No. 123<br/>Bandung, Jawa Barat</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-12 border-b border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tagihan Kepada:</p>
            <h3 className="text-lg font-bold text-slate-800">{invoice.customer?.name || 'Unknown'}</h3>
            <p className="text-slate-600 text-sm mt-1">{invoice.customer?.address || 'Alamat tidak tersedia'}</p>
            <p className="text-slate-600 text-sm mt-1">{invoice.customer?.phone || '-'}</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-400 uppercase">Status:</span>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                {isPaid ? 'LUNAS' : 'BELUM DIBAYAR'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-bold text-slate-400 uppercase">Periode:</span>
              <span className="text-sm font-bold text-slate-800">{invoice.billing_period}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-bold text-slate-400 uppercase">Tgl Terbit:</span>
              <span className="text-sm font-bold text-slate-800">{new Date(invoice.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-8 sm:p-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 text-sm font-bold text-slate-400 uppercase tracking-wider">Deskripsi Layanan</th>
                <th className="py-3 text-sm text-right font-bold text-slate-400 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-5">
                  <p className="font-bold text-slate-800">Paket Internet - {invoice.customer?.package?.name || 'Paket Default'}</p>
                  <p className="text-sm text-slate-500 mt-1">Biaya langganan bulan {invoice.billing_period}</p>
                </td>
                <td className="py-5 text-right font-bold text-slate-800">
                  Rp {parseInt(invoice.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-5 text-right font-bold text-slate-400 uppercase tracking-wider pr-8">
                  Total Tagihan
                </td>
                <td className="py-5 text-right text-2xl font-black text-blue-600">
                  Rp {parseInt(invoice.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-8 sm:p-12 text-center border-t border-slate-200">
          <p className="text-slate-500 font-medium">Terima kasih atas pembayaran Anda.</p>
          <p className="text-slate-400 text-sm mt-1">Jika ada pertanyaan mengenai tagihan ini, silakan hubungi admin.</p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; background: white; }
          main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
        }
      `}} />
    </div>
  );
}