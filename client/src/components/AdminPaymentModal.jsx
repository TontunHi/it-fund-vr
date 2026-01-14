import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import api from '../services/api';

const AdminPaymentModal = ({ isOpen, onClose, data, onRefresh }) => {
    if (!isOpen) return null;

    // URL ของรูปภาพ (ถ้ามี)
    const slipUrl = data?.slipImage ? `http://localhost:3000/uploads/slips/${data.slipImage}` : null;

    const updateStatus = async (status) => {
        try {
            await api.put('/payments/status', {
                memberId: data.memberId,
                month: data.month,
                year: data.year,
                status: status
            });
            onRefresh();
            onClose();
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl w-full max-w-sm relative z-10 border border-white/50">

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">ตรวจสอบการจ่าย</h3>
                            <p className="text-sm text-gray-500">เดือน {data?.month} - {data?.memberName}</p>
                        </div>
                        <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
                    </div>

                    {/* ส่วนแสดงสลีป */}
                    <div className="mb-6 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 min-h-[150px] flex items-center justify-center relative group">
                        {slipUrl ? (
                            <>
                                <img src={slipUrl} alt="Slip" className="w-full h-48 object-cover" />
                                <a href={slipUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white gap-2 font-medium cursor-pointer">
                                    <Eye size={20} /> ดูรูปเต็ม
                                </a>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">ไม่มีรูปสลีปแนบมา</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button onClick={() => updateStatus('approved')} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-400/30 flex items-center justify-center gap-2 font-bold transition transform hover:-translate-y-0.5">
                            <Check size={20} /> อนุมัติ (ยืนยัน)
                        </button>
                        <button onClick={() => updateStatus('pending')} className="w-full py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 flex items-center justify-center gap-2 font-bold transition">
                            <AlertTriangle size={20} /> ยังไม่ผ่าน / รอตรวจ
                        </button>
                        <button onClick={() => updateStatus('pending')} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 font-medium transition">
                            <RefreshCw size={18} /> รีเซ็ต (ยังไม่จ่าย)
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AdminPaymentModal;