import { Link, useLocation } from 'react-router-dom';
// อย่าลืม import FileText เข้ามาด้วยนะครับ
import { LayoutDashboard, Wallet, Receipt, FileText } from 'lucide-react'; 

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'ภาพรวม (Dashboard)' },
    { path: '/payments', icon: <Wallet size={20} />, label: 'ตารางจ่ายเงิน' },
    { path: '/expenses', icon: <Receipt size={20} />, label: 'บันทึกรายจ่าย' },
    
    // 👇 เมนูใหม่: Transaction / Statement
    { path: '/transactions', icon: <FileText size={20} />, label: 'บัญชีรายรับ-จ่าย' }, 
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 h-screen fixed left-0 top-0 p-6 flex flex-col shadow-lg z-50">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-400/30">
          CM
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Co-Money</h1>
      </div>

      <nav className="space-y-2 flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${isActive(item.path) 
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="text-xs text-gray-400 text-center mt-auto">
        v1.0.0 Beta
      </div>
    </aside>
  );
};

export default Sidebar;