/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ชุดสีสำหรับทำกระจกและแสงนีออน
        'glass-surface': 'rgba(255, 255, 255, 0.1)', // พื้นกระจกใส
        'glass-border': 'rgba(255, 255, 255, 0.2)',  // ขอบกระจก
        'neon-blue': '#00f3ff',                      // สีฟ้าโฮโลแกรม
        'neon-purple': '#bc13fe',                    // สีม่วงนีออน
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',    // เงากระจก
        'neon': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)', // เงาแสงฟุ้ง
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite', // อนิเมชันลอยตัว
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }, // ลอยขึ้น 10px
        }
      }
    },
  },
  plugins: [],
}