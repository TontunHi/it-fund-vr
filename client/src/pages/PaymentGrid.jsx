import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import SlipUploadModal from '../components/SlipUploadModal';
import AdminPaymentModal from '../components/AdminPaymentModal';
import MemberModal from '../components/MemberModal';
import { Check, Clock, Loader, Trash2, UserPlus, Settings, FileImage, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const PaymentGrid = () => {
    // เริ่มต้นปีปัจจุบัน
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [members, setMembers] = useState([]);
    const [paymentMap, setPaymentMap] = useState({});
    const [loading, setLoading] = useState(true);

    // State ควบคุม Modal และ Mode
    const [selectedCell, setSelectedCell] = useState(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showAdminPaymentModal, setShowAdminPaymentModal] = useState(false);

    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    // ฟังก์ชันโหลดข้อมูล
    const fetchData = async () => {
        try {
            // ส่ง year ไปด้วยเสมอ
            const response = await api.get(`/grid-data?year=${currentYear}`);
            setMembers(response.data.members);

            const map = {};
            response.data.payments.forEach(p => {
                // Key เก็บเป็น memberID_monthIndex
                const key = `${p.member_id}_${p.target_month - 1}`;
                map[key] = {
                    status: p.status,
                    slipImage: p.slip_image
                };
            });
            setPaymentMap(map);
        } catch (error) {
            console.error("Error fetching grid data:", error);
        } finally {
            setLoading(false);
        }
    };

    // โหลดข้อมูลใหม่เมื่อเปิดหน้า หรือเปลี่ยนปี
    useEffect(() => {
        fetchData();
    }, [currentYear]);

    // ฟังก์ชันลบสมาชิก
    const handleDeleteMember = async (id, name) => {
        if (window.confirm(`ต้องการลบสมาชิก "${name}" และประวัติการจ่ายเงินทั้งหมดใช่ไหม?`)) {
            try {
                await api.delete(`/members/${id}`);
                fetchData();
            } catch (err) { alert('ลบไม่สำเร็จ: ' + err.message); }
        }
    };

    // กำหนดสีตามสถานะ
    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-400/20 border-green-400/30 text-green-600 shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:bg-green-400/30';
            case 'pending': return 'bg-yellow-400/20 border-yellow-400/30 text-yellow-600 hover:bg-yellow-400/30';
            default: return 'bg-white/10 border-white/20 text-gray-400 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 hover:bg-white/30';
        }
    };

    // กำหนดไอคอน
    const getStatusIcon = (status, hasSlip) => {
        switch (status) {
            case 'approved': return <Check size={16} strokeWidth={3} />;
            // ถ้าเป็น pending แล้วมีรูป ให้โชว์รูปไฟล์
            case 'pending': return hasSlip ? <FileImage size={16} /> : <Clock size={16} />;
            default: return <div className="w-2 h-2 rounded-full bg-gray-300/50" />;
        }
    };

    // เมื่อคลิกที่ช่องตาราง
    const handleCellClick = (member, monthIndex, cellData) => {
        const data = {
            memberId: member.id,
            memberName: member.name,
            month: monthIndex + 1,
            year: currentYear,  // <--- จุดสำคัญ: ส่งปีปัจจุบันไปด้วย
            status: cellData.status,
            slipImage: cellData.slipImage
        };
        setSelectedCell(data);

        if (isAdminMode) {
            setShowAdminPaymentModal(true);
        } else {
            // ถ้าเป็น User ธรรมดา ให้เปิด Modal อัปโหลด โดยใช้ state selectedCell เดียวกัน
            // (SlipUploadModal จะเช็คเองว่าถ้า selectedCell ไม่ null ก็จะแสดงผล)
        }
    };

    // Handler เมื่อปิด Modal แล้วต้องการให้รีโหลดข้อมูล
    const handleModalClose = () => {
        setSelectedCell(null);
        setShowAdminPaymentModal(false);
        // รีโหลดข้อมูลเพื่อให้สถานะล่าสุดแสดงขึ้นมา
        fetchData();
    };

    if (loading && members.length === 0) return <MainLayout><div className="flex justify-center pt-20"><Loader className="animate-spin text-white" /></div></MainLayout>;

    return (
        <MainLayout>
            <div className="relative">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-gray-800 drop-shadow-sm">
                                ตารางจ่ายเงิน
                            </h1>

                            {/* Year Selector */}
                            <div className="flex items-center bg-white/50 rounded-xl px-2 py-1 shadow-sm border border-white/60 ml-2">
                                <button onClick={() => setCurrentYear(prev => prev - 1)} className="p-1 hover:bg-white rounded-lg transition text-gray-600"><ChevronLeft size={20} /></button>
                                <span className="text-xl font-bold text-blue-600 px-3 min-w-[4rem] text-center">{currentYear}</span>
                                <button onClick={() => setCurrentYear(prev => prev + 1)} className="p-1 hover:bg-white rounded-lg transition text-gray-600"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <p className="text-gray-500 mt-1">จัดการข้อมูลและตรวจสอบสถานะประจำปี</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Admin Toggle */}
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition border ${isAdminMode ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30' : 'bg-white/50 text-gray-600 border-white/40 hover:bg-white/80'}`}
                        >
                            <Settings size={18} /> {isAdminMode ? 'Admin Mode: ON' : 'User View'}
                        </button>

                        {/* Add Member Button */}
                        {isAdminMode && (
                            <button
                                onClick={() => setShowMemberModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl shadow-lg shadow-blue-400/30 transition hover:-translate-y-0.5"
                            >
                                <UserPlus size={18} /> เพิ่มสมาชิก
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Table */}
                <GlassCard className="overflow-x-auto pb-4">
                    <div className="min-w-[900px]">
                        {/* Header Months */}
                        <div className="grid grid-cols-[220px_repeat(12,1fr)] gap-2 mb-4">
                            <div className="font-bold text-gray-400 pl-2">รายชื่อสมาชิก</div>
                            {months.map((m, i) => (
                                <div key={i} className="text-center text-xs font-bold text-blue-600 bg-blue-50/50 rounded-lg py-1 border border-blue-100">{m}</div>
                            ))}
                        </div>

                        {/* Rows */}
                        <div className="space-y-2">
                            {members.map((member) => (
                                <div key={member.id} className="grid grid-cols-[220px_repeat(12,1fr)] gap-2 items-center group/row hover:bg-white/20 p-2 rounded-xl transition duration-200">

                                    {/* Member Column */}
                                    <div className="flex items-center justify-between pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full ${member.avatar_color} flex items-center justify-center text-white text-sm shadow-md border-2 border-white/50`}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 truncate w-24">{member.name}</div>
                                                {member.nickname && <div className="text-xs text-gray-400">({member.nickname})</div>}
                                            </div>
                                        </div>

                                        {isAdminMode && (
                                            <button
                                                onClick={() => handleDeleteMember(member.id, member.name)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition p-1 hover:bg-red-50 rounded-full"
                                                title="ลบสมาชิก"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Month Cells */}
                                    {months.map((_, index) => {
                                        const statusKey = `${member.id}_${index}`;
                                        const cellData = paymentMap[statusKey] || { status: 'unpaid', slipImage: null };

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleCellClick(member, index, cellData)}
                                                className={`
                            h-10 rounded-lg border flex items-center justify-center transition-all active:scale-95 
                            ${getStatusStyle(cellData.status)}
                        `}
                                                title={cellData.status === 'unpaid' ? 'ยังไม่จ่าย' : cellData.status}
                                            >
                                                {getStatusIcon(cellData.status, !!cellData.slipImage)}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* --- Modals --- */}

                {/* User: Upload Modal */}
                {!isAdminMode && (
                    <SlipUploadModal
                        isOpen={!!selectedCell}
                        onClose={handleModalClose} // ใช้ handleModalClose เพื่อรีโหลดข้อมูล
                        data={selectedCell}
                    />
                )}

                {/* Admin: Manage Status Modal */}
                <AdminPaymentModal
                    isOpen={showAdminPaymentModal}
                    onClose={handleModalClose} // ใช้ handleModalClose เพื่อรีโหลดข้อมูล
                    data={selectedCell}
                    onRefresh={fetchData}
                />

                {/* Admin: Add Member Modal */}
                <MemberModal
                    isOpen={showMemberModal}
                    onClose={() => setShowMemberModal(false)}
                    onRefresh={fetchData}
                />

            </div>
        </MainLayout>
    );
};

export default PaymentGrid;