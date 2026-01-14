import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            className={`
        relative overflow-hidden
        bg-white/60 backdrop-blur-xl 
        border border-white/50 
        rounded-2xl shadow-glass
        p-6
        transition-all duration-300
        hover:shadow-neon hover:-translate-y-1
        ${className}
      `}
        >
            {/* แสงสะท้อนมุมบน (Glossy Highlight) เพื่อให้ดูเป็นกระจกมีความโค้ง */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            {/* เนื้อหาข้างใน */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;