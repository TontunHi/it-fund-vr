import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import { Wallet, TrendingUp, ShoppingBag, Users, Loader, AlertCircle, Clock, Check, Calendar } from 'lucide-react'; // เพิ่ม icon Calendar
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        balance: 0, totalIncome: 0, totalExpense: 0, pendingCount: 0,
        unpaidList: [], expectedRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    // ชื่อเดือนภาษาไทย
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const currentMonthName = monthNames[new Date().getMonth()];

    // Helper แปลงเลขเดือนเป็นชื่อย่อ
    const getMonthName = (monthIndex) => {
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        return months[monthIndex - 1] || "";
    };

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <MainLayout><div className="flex justify-center pt-20"><Loader className="animate-spin text-white" /></div></MainLayout>;

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 drop-shadow-sm">Dashboard</h1>
                    <p className="text-gray-500">ภาพรวมการเงิน</p>
                </div>

                {/* 1. Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: ยอดคงเหลือ */}
                    <GlassCard className="flex items-center gap-4 border-l-4 border-l-blue-400">
                        <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600"><Wallet size={28} /></div>
                        <div><p className="text-xs text-gray-500">เงินกองกลางคงเหลือ</p><h2 className="text-2xl font-bold text-gray-800">฿ {stats.balance.toLocaleString()}</h2></div>
                    </GlassCard>

                    {/* Card 2: รายรับ */}
                    <GlassCard className="flex items-center gap-4 border-l-4 border-l-green-400">
                        <div className="p-3 bg-green-100/50 rounded-xl text-green-600"><TrendingUp size={28} /></div>
                        <div><p className="text-xs text-gray-500">รายรับรวม</p><h2 className="text-2xl font-bold text-gray-800 text-green-600">+ {stats.totalIncome.toLocaleString()}</h2></div>
                    </GlassCard>

                    {/* Card 3: รายจ่าย */}
                    <GlassCard className="flex items-center gap-4 border-l-4 border-l-red-400">
                        <div className="p-3 bg-red-100/50 rounded-xl text-red-500"><ShoppingBag size={28} /></div>
                        <div><p className="text-xs text-gray-500">รายจ่ายรวม</p><h2 className="text-2xl font-bold text-gray-800 text-red-500">- {stats.totalExpense.toLocaleString()}</h2></div>
                    </GlassCard>

                    {/* Card 4: ยอดรอเก็บ (รวมทั้งหมด) */}
                    <GlassCard className="flex items-center gap-4 border-l-4 border-l-orange-400">
                        <div className="p-3 bg-orange-100/50 rounded-xl text-orange-500"><AlertCircle size={28} /></div>
                        <div>
                            <p className="text-xs text-gray-500">ยอดรอเก็บทั้งหมด</p>
                            <h2 className="text-2xl font-bold text-gray-800 text-orange-500">฿ {stats.expectedRevenue.toLocaleString()}</h2>
                        </div>
                    </GlassCard>
                </div>

                {/* 2. Unpaid List Section */}
                <GlassCard className="flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                {/* เปลี่ยนหัวข้อ: ไม่ระบุเดือนแล้ว เพราะรวมหลายเดือน */}
                                <h3 className="text-xl font-bold text-gray-700">รายการค้างชำระ / รอตรวจสอบ</h3>
                                <p className="text-sm text-gray-500">รวมยอดค้างเก่าและปัจจุบัน</p>
                            </div>
                        </div>

                        {stats.pendingCount > 0 ? (
                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold animate-pulse">
                                รวม {stats.pendingCount} รายการ
                            </span>
                        ) : (
                            <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <Check size={16} /> จ่ายครบทุกคนแล้ว
                            </span>
                        )}
                    </div>

                    <div className="flex-grow">
                        {stats.unpaidList && stats.unpaidList.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.unpaidList.map((item, index) => (
                                    // เพิ่ม Key ที่ unique ขึ้น เพราะ id คนอาจซ้ำกันได้ถ้าค้างหลายเดือน
                                    <div key={`${item.id}-${item.target_month}-${item.target_year}`} className={`flex items-center justify-between p-4 rounded-2xl transition border shadow-sm group ${item.type === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-white/40 border-white/40'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${item.avatar_color} flex items-center justify-center text-white text-lg font-bold shadow-md ring-2 ring-white`}>
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-700">{item.name}</p>

                                                {/* === ส่วนสำคัญที่เพิ่มเข้ามา: แสดงเดือนและปี === */}
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Calendar size={12} className={item.type === 'overdue' ? 'text-red-500' : 'text-gray-400'} />
                                                    {item.type === 'overdue' ? (
                                                        <span className="text-xs font-bold text-red-500">
                                                            ของ {getMonthName(item.target_month)} {item.target_year}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">
                                                            รอบปัจจุบัน ({currentMonthName})
                                                        </span>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            {item.status === 'pending' ? (
                                                <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-200">
                                                    <Clock size={14} /> รอตรวจ
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500 bg-white px-3 py-1 rounded-lg text-xs font-bold border border-red-200">
                                                    <AlertCircle size={14} /> ค้างจ่าย
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Check size={40} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600">ยอดเยี่ยมมาก!</h3>
                                <p>ไม่มีรายการค้างชำระ</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

            </div>
        </MainLayout>
    );
};

export default Dashboard;