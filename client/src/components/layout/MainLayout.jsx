import React from 'react';
import { NavLink } from 'react-router-dom';

const MainLayout = ({ children }) => {

    // Style: ถ้า Active ให้เรืองแสงสีฟ้า และตัวหนังสือหนาขึ้น
    const getLinkStyle = ({ isActive }) =>
        `transition-all duration-300 px-4 py-2 rounded-full text-sm font-semibold ${isActive
            ? 'text-blue-600 bg-blue-50/80 shadow-[0_0_15px_rgba(59,130,246,0.4)] ring-1 ring-blue-200'
            : 'text-gray-600 hover:text-blue-600 hover:bg-white/40'
        }`;

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#e0eafc] via-[#cfdef3] to-[#e8dbfc] text-gray-700 font-sans">

            {/* Background Blob Animation */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Navbar */}
            <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-full px-8 py-3 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">

                    {/* 1. Logo (เปลี่ยนเป็นชื่อเต็ม) */}
                    <NavLink to="/" className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight hover:opacity-80 transition whitespace-nowrap">
                        IT Fund 
                    </NavLink>

                    {/* Menu Links */}
                    <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                        <NavLink to="/dashboard" className={getLinkStyle}>
                            ภาพรวมระบบ
                        </NavLink>
                        <NavLink to="/payments" className={getLinkStyle}>
                            ตารางการจ่ายเงิน
                        </NavLink>
                        <NavLink to="/expenses" className={getLinkStyle}>
                            บันทึกรายจ่าย
                        </NavLink>
                        <NavLink to="/transactions" className={getLinkStyle}>
                            รายการเดินบัญชี
                        </NavLink>
                    </div>

                    {/* 2. ลบส่วน User Profile ออกไปแล้ว */}

                </div>
            </nav>

            {/* Content Area */}
            <main className="pt-32 pb-10 px-4 max-w-7xl mx-auto relative z-10">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;