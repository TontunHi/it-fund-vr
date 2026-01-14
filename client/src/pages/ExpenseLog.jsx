import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import { Plus, Calendar, User, Image as ImageIcon, X, Loader, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ExpenseLog = () => {
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]); // 1. เพิ่ม State เก็บรายชื่อสมาชิก
    const [loading, setLoading] = useState(true);

    // State สำหรับ Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // ฟังก์ชันโหลดข้อมูล (โหลดทั้ง รายจ่าย และ สมาชิก พร้อมกัน)
    const fetchData = async () => {
        try {
            const [expRes, memRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/members') // ดึงรายชื่อสมาชิกมาด้วย
            ]);
            setExpenses(expRes.data);
            setMembers(memRes.data);
        } catch (err) { console.error("Error fetching data:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm('ยืนยันที่จะลบรายการนี้?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchData();
            } catch (err) { alert('ลบไม่สำเร็จ: ' + err.message); }
        }
    };

    const openAddModal = () => { setEditingItem(null); setIsModalOpen(true); };
    const openEditModal = (item) => { setEditingItem(item); setIsModalOpen(true); };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">บันทึกรายจ่าย</h1>
                    <p className="text-gray-500">จัดการการเบิกจ่ายและดูประวัติ</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-2xl shadow-lg transition transform hover:-translate-y-1">
                    <Plus size={20} /> เบิกค่าใช้จ่าย
                </button>
            </div>

            {loading ? <div className="text-center"><Loader className="animate-spin inline" /></div> : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {expenses.map((item, index) => (
                        <GlassCard key={item.id} delay={index * 0.1} className="flex flex-col h-full border-t-4 border-t-red-400 group relative hover:shadow-xl transition-all duration-300">

                            {/* Admin Actions */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200 z-10">
                                <button onClick={() => openEditModal(item)} className="p-2 bg-white/90 backdrop-blur rounded-full text-blue-500 hover:bg-blue-100 shadow-sm border border-blue-100"><Pencil size={14} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-100 shadow-sm border border-red-100"><Trash2 size={14} /></button>
                            </div>

                            <div className="flex justify-between items-start mb-4 pr-10">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar size={12} /> {new Date(item.expense_date).toLocaleDateString('th-TH')}
                                        <span className="mx-1">•</span>
                                        <User size={12} /> {item.buyer_name || 'ไม่ระบุ'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-2xl font-bold text-red-500 mb-3">- ฿{Number(item.amount).toLocaleString()}</p>

                            <div className="bg-white/40 p-3 rounded-xl flex-grow mb-4 border border-white/50">
                                <p className="text-sm text-gray-600 break-words">
                                    {item.description || '- ไม่มีรายละเอียด -'}
                                </p>
                            </div>

                            {item.receipt_image && (
                                <div className="mt-auto">
                                    <a href={`http://localhost:3000/uploads/receipts/${item.receipt_image}`} target="_blank" rel="noreferrer" className="w-full py-2 bg-blue-50/80 text-blue-600 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-blue-100 transition border border-blue-100/50">
                                        <ImageIcon size={16} /> ดูรูปใบเสร็จ <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* 2. ส่ง props members เข้าไปใน Modal */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { fetchData(); setIsModalOpen(false); }}
                editData={editingItem}
                members={members}
            />
        </MainLayout>
    );
};

// Modal ที่ปรับปรุงแล้ว
const ExpenseModal = ({ isOpen, onClose, onSuccess, editData, members }) => {
    const [formData, setFormData] = useState({ title: '', amount: '', description: '', createdBy: '' });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset Form เมื่อเปิด Modal หรือเปลี่ยนโหมด
    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData.title,
                amount: editData.amount,
                description: editData.description || '',
                createdBy: editData.created_by // ใช้ค่าเดิมตอนแก้ไข
            });
        } else {
            // 3. เลือกสมาชิกคนแรกเป็น Default (ป้องกันส่งค่าว่างหรือ ID 1 ที่ไม่มีจริง)
            const defaultMemberId = members && members.length > 0 ? members[0].id : '';
            setFormData({ title: '', amount: '', description: '', createdBy: defaultMemberId });
        }
        setFile(null);
    }, [editData, isOpen, members]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.title || !formData.amount || !formData.createdBy) return alert('กรุณากรอกข้อมูลให้ครบ และเลือกผู้เบิกเงิน');

        setSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('amount', formData.amount);
        data.append('description', formData.description);
        data.append('createdBy', formData.createdBy);
        if (file) data.append('receiptImage', file);

        try {
            if (editData) {
                await api.put(`/expenses/${editData.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/expenses', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSuccess();
        } catch (err) {
            // แสดง Error ชัดเจนขึ้น
            alert('บันทึกไม่สำเร็จ: ' + (err.response?.data?.error || err.message));
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl w-full max-w-md z-10 shadow-2xl border border-white">
                    <div className="flex justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {editData ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-green-500" />}
                            {editData ? 'แก้ไขรายการ' : 'บันทึกรายจ่ายใหม่'}
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                        {/* 4. Dropdown เลือกผู้เบิกเงิน */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 ml-1 mb-1">ผู้เบิกเงิน (ใครจ่าย?)</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3 pl-10 rounded-xl bg-white/60 border border-gray-200 focus:ring-2 focus:ring-blue-300 outline-none appearance-none"
                                    value={formData.createdBy}
                                    onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                >
                                    {members && members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} {m.nickname ? `(${m.nickname})` : ''}</option>
                                    ))}
                                </select>
                                <User size={18} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 ml-1 mb-1">รายการ</label>
                            <input placeholder="เช่น ซื้อขนม, ค่าไฟ" className="w-full p-3 rounded-xl bg-white/60 border border-gray-200 focus:ring-2 focus:ring-blue-300 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 ml-1 mb-1">จำนวนเงิน (บาท)</label>
                            <input type="number" placeholder="0.00" className="w-full p-3 rounded-xl bg-white/60 border border-gray-200 focus:ring-2 focus:ring-blue-300 outline-none text-red-500 font-bold" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 ml-1 mb-1">รายละเอียดเพิ่มเติม</label>
                            <textarea placeholder="..." className="w-full p-3 rounded-xl bg-white/60 border border-gray-200 h-20 focus:ring-2 focus:ring-blue-300 outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center cursor-pointer hover:bg-blue-50/50 bg-white/30 transition group">
                            <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" accept="image/*" />
                            {editData && !file ? (
                                <p className="text-xs text-gray-400 mt-2 group-hover:text-blue-500">ใช้รูปเดิม (อัปโหลดใหม่เพื่อเปลี่ยน)</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-2 group-hover:text-blue-500">แนบรูปใบเสร็จ (ถ้ามี)</p>
                            )}
                        </div>

                        <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5 shadow-red-400/30">
                            {submitting ? 'กำลังบันทึก...' : (editData ? 'บันทึกการแก้ไข' : 'ยืนยันการเบิก')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ExpenseLog;