import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import { ArrowDownLeft, ArrowUpRight, FileText, Search, Loader, Filter } from 'lucide-react';
import api from '../services/api';

const TransactionLog = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter ข้อมูลตามคำค้นหา
    const filteredData = transactions.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">รายการเดินบัญชี</h1>
                        <p className="text-gray-500">ประวัติรายรับ-รายจ่าย (Statement)</p>
                    </div>

                    {/* Search Box */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหารายการ..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white focus:ring-2 focus:ring-blue-300 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Transaction List */}
                <GlassCard className="min-h-[500px] p-0 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader className="animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100/50">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 bg-blue-50/50 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-2">วันที่ / เวลา</div>
                                <div className="col-span-6">รายการ</div>
                                <div className="col-span-4 text-right">จำนวนเงิน</div>
                            </div>

                            {/* Table Rows */}
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <div key={`${item.type}-${item.id}-${index}`} className="grid grid-cols-12 p-4 items-center hover:bg-white/40 transition duration-150 group">

                                        {/* Date Column */}
                                        <div className="col-span-2 text-sm text-gray-500">
                                            <div className="font-bold text-gray-700">
                                                {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-xs">
                                                {new Date(item.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </div>
                                        </div>

                                        {/* Title Column */}
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {item.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{item.title}</p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {item.category === 'payment' ? 'เงินเข้า (ค่าสมาชิก)' :
                                                        item.category === 'expense' ? 'เงินออก (ซื้อของ/เบิก)' : 'รายรับอื่นๆ'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount Column */}
                                        <div className="col-span-4 text-right">
                                            <span className={`text-lg font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.type === 'income' ? '+' : '-'} {Number(item.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                                    <FileText size={48} className="mb-2 opacity-50" />
                                    <p>ไม่พบรายการบัญชี</p>
                                </div>
                            )}
                        </div>
                    )}
                </GlassCard>

            </div>
        </MainLayout>
    );
};

export default TransactionLog;