import { useState } from 'react'; // เพิ่ม useState
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

const SlipUploadModal = ({ isOpen, onClose, data }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Reset state เมื่อเปิด Modal ใหม่ หรือปิด
    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // สร้าง URL จำลองเพื่อแสดงรูปตัวอย่าง
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('กรุณาเลือกไฟล์สลีปก่อน');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // เตรียมข้อมูลสำหรับส่ง (FormData)
            const formData = new FormData();
            formData.append('slipImage', file); // ชื่อ field ต้องตรงกับใน server (upload.single('slipImage'))
            formData.append('memberId', data.memberId);
            formData.append('month', data.month);
            formData.append('year', data.year); // ปีปัจจุบัน (Hardcode ไว้ก่อน หรือรับมาจาก props)
            formData.append('amount', 100); // ยอดเงิน default

            await api.post('/payments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // สำคัญมาก
            });

            setSuccess(true);
            setTimeout(() => {
                onClose(); // ปิด Modal อัตโนมัติ
                window.location.reload(); // รีโหลดหน้าเพื่ออัปเดตสถานะ (ในอนาคตควรใช้ Context หรือ Callback เพื่อไม่ต้องรีโหลด)
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('เกิดข้อผิดพลาดในการอัปโหลด: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 z-10"
                >
                    {success ? (
                        // แสดงหน้าจอสำเร็จ
                        <div className="text-center py-8">
                            <CheckCircle size={64} className="text-green-500 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-gray-800">ส่งสลีปเรียบร้อย!</h3>
                            <p className="text-gray-500">สถานะจะเปลี่ยนเป็น "รอตรวจสอบ"</p>
                        </div>
                    ) : (
                        // แสดงหน้าจออัปโหลดปกติ
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">ส่งสลีปเงินกองกลาง</h3>
                                    <p className="text-sm text-gray-500">เดือน {data?.month} (ของ {data?.memberName})</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full text-gray-500 transition"><X size={20} /></button>
                            </div>

                            {/* Area เลือกไฟล์ */}
                            <label className="cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                                {preview ? (
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-400 max-h-64">
                                        <img src={preview} alt="Preview" className="w-full object-contain bg-gray-100" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white font-medium">
                                            คลิกเพื่อเปลี่ยนรูป
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-100/50 transition h-48">
                                        <Upload size={32} className="text-blue-500 mb-2" />
                                        <p className="text-gray-600">คลิกเพื่อเลือกรูปสลีป</p>
                                    </div>
                                )}
                            </label>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-3 p-3 bg-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="mt-6 flex gap-3">
                                <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:shadow-blue-400/50 hover:-translate-y-0.5 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {uploading ? <Loader size={20} className="animate-spin" /> : 'ยืนยันการส่ง'}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SlipUploadModal;