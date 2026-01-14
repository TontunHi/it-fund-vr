import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Save, Check } from 'lucide-react';
import api from '../services/api';

const MemberModal = ({ isOpen, onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');

    // 🎨 เพิ่มสีให้ครบ 10 สี (คัดมาให้ดูสดใสและแตกต่างกัน)
    const colors = [
        'bg-red-400',     // 1. แดง
        'bg-orange-400',  // 2. ส้ม
        'bg-yellow-400',  // 3. เหลือง
        'bg-green-400',   // 4. เขียว
        'bg-emerald-400', // 5. เขียวมรกต
        'bg-teal-400',    // 6. เขียวน้ำทะเล
        'bg-cyan-400',    // 7. ฟ้าคราม
        'bg-blue-400',    // 8. น้ำเงิน
        'bg-purple-400',  // 9. ม่วง
        'bg-pink-400'     // 10. ชมพู
    ];

    // สุ่มสีเริ่มต้น
    const [selectedColor, setSelectedColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return alert('กรุณากรอกชื่อจริง');

        try {
            await api.post('/members', { name, nickname, avatar_color: selectedColor });
            onRefresh(); // โหลดตารางใหม่
            onClose();   // ปิด Modal
            setName(''); // Reset Form
            setNickname('');
        } catch (err) {
            alert('Error adding member: ' + err.message);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl z-10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UserPlus size={24} className="text-blue-500" /> เพิ่มสมาชิกใหม่
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-red-100 transition">
                            <X size={20} className="text-gray-400 hover:text-red-500" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Input Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">ชื่อจริง</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm transition"
                                placeholder="ระบุชื่อ..."
                                autoFocus
                            />
                        </div>

                        {/* Input Nickname */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">ชื่อเล่น (ถ้ามี)</label>
                            <input
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm transition"
                                placeholder="ระบุชื่อเล่น..."
                            />
                        </div>

                        {/* Color Selection (Grid Layout) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">เลือกสีประจำตัว</label>
                            <div className="grid grid-cols-5 gap-3">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        className={`
                       w-10 h-10 rounded-full ${c} 
                       flex items-center justify-center transition-all duration-200
                       ${selectedColor === c ? 'ring-4 ring-offset-2 ring-blue-300 scale-110 shadow-lg' : 'hover:scale-105 hover:opacity-80'}
                     `}
                                    >
                                        {selectedColor === c && <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-400/30 flex justify-center items-center gap-2 transition transform hover:-translate-y-0.5"
                        >
                            <Save size={20} /> บันทึกข้อมูล
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MemberModal;