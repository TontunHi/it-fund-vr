const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db'); // ต้องมั่นใจว่าไฟล์ db.js เชื่อมต่อได้ปกติ
const upload = require('./middleware/uploadMiddleware'); // Middleware ที่เราแก้ให้สร้างโฟลเดอร์ปี/เดือน

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// เปิดให้เข้าถึงรูปภาพในโฟลเดอร์ uploads (รวมถึงโฟลเดอร์ย่อย)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 1. หมวด MEMBERS (จัดการสมาชิก)
// ==========================================

// ดึงรายชื่อสมาชิกทั้งหมด
app.get('/api/members', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM members WHERE is_active = 1');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// เพิ่มสมาชิกใหม่
app.post('/api/members', async (req, res) => {
    try {
        const { name, nickname, avatar_color } = req.body;
        await db.query(
            'INSERT INTO members (name, nickname, avatar_color) VALUES (?, ?, ?)',
            [name, nickname, avatar_color || 'bg-gray-400']
        );
        res.json({ message: 'Member added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ลบสมาชิก
app.delete('/api/members/:id', async (req, res) => {
    try {
        // ลบข้อมูลที่เกี่ยวข้องก่อน (Cascade) หรือลบแค่สมาชิกตาม Logic DB
        await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. หมวด GRID & PAYMENTS (ตารางจ่ายเงิน)
// ==========================================

// ดึงข้อมูลสำหรับตาราง Grid (Members + Payment Status)
app.get('/api/grid-data', async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        // 1. ดึงรายชื่อสมาชิก
        const [members] = await db.query('SELECT id, name, nickname, avatar_color FROM members WHERE is_active = 1');

        // 2. ดึงประวัติการจ่ายเงินของปีนั้น
        const [payments] = await db.query(
            'SELECT member_id, target_month, status, slip_image FROM payments WHERE target_year = ?',
            [year]
        );

        res.json({
            members,
            payments
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// อัปโหลดสลีป (POST)
app.post('/api/payments', upload.single('slipImage'), async (req, res) => {
    try {
        console.log("📥 Upload Request Body:", req.body); // เช็คค่าที่ส่งมา
        const { memberId, month, year, amount } = req.body;

        // แปลงค่าเป็นตัวเลขให้แน่ใจ (กันเหนียว)
        const mId = parseInt(memberId);
        const mMonth = parseInt(month);
        const mYear = parseInt(year);

        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const relativePath = req.file ? `${y}/${m}/${req.file.filename}` : null;

        if (!relativePath) return res.status(400).json({ error: 'กรุณาแนบไฟล์สลีป' });

        // 1. เช็คว่ามีข้อมูลเดิมไหม
        const [existing] = await db.query(
            'SELECT id FROM payments WHERE member_id = ? AND target_month = ? AND target_year = ?',
            [mId, mMonth, mYear]
        );

        if (existing.length > 0) {
            // 2. มี -> UPDATE
            console.log("🔄 Updating existing payment ID:", existing[0].id);
            await db.query(
                'UPDATE payments SET slip_image = ?, status = "pending", amount = ?, paid_at = NOW() WHERE id = ?',
                [relativePath, amount, existing[0].id]
            );
        } else {
            // 3. ไม่มี -> INSERT
            console.log("✨ Inserting new payment");
            await db.query(
                'INSERT INTO payments (member_id, target_month, target_year, amount, slip_image, status, paid_at) VALUES (?, ?, ?, ?, ?, "pending", NOW())',
                [mId, mMonth, mYear, amount, relativePath]
            );
        }

        res.json({ message: 'Upload successful' });

    } catch (err) {
        console.error("❌ Error Uploading:", err);
        res.status(500).json({ error: err.message });
    }
});

// แก้ไขสถานะ (PUT) - Admin Mode
app.put('/api/payments/status', async (req, res) => {
    try {
        console.log("📥 Status Update Request:", req.body); // เช็คค่าที่ส่งมา
        const { memberId, month, year, status } = req.body;

        const mId = parseInt(memberId);
        const mMonth = parseInt(month);
        const mYear = parseInt(year);

        const [existing] = await db.query(
            'SELECT id FROM payments WHERE member_id = ? AND target_month = ? AND target_year = ?',
            [mId, mMonth, mYear]
        );

        if (existing.length > 0) {
            // Update Status
            console.log("🔄 Updating status for ID:", existing[0].id);
            await db.query(
                'UPDATE payments SET status = ?, paid_at = NOW() WHERE id = ?',
                [status, existing[0].id]
            );
        } else {
            // Insert New Payment with Status
            console.log("✨ Inserting new payment via Admin");
            await db.query(
                'INSERT INTO payments (member_id, target_month, target_year, amount, status, paid_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [mId, mMonth, mYear, 100, status] // ใส่ 100 บาทเป็นค่า default หรือจะส่งมาจากหน้าบ้านก็ได้
            );
        }
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error("❌ Error Updating Status:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. หมวด DASHBOARD (หน้าแรก)
// ==========================================

// API Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // ----------------------------------------------------
        // 1. คำนวณเรื่องเงิน (Financial Stats)
        // ----------------------------------------------------

        // 1.1 รายรับจากค่าห้อง (เฉพาะที่ Approved แล้ว)
        const [incomeRes] = await db.query("SELECT SUM(amount) as total FROM payments WHERE status = 'approved'");
        const totalMemberIncome = Number(incomeRes[0].total || 0);

        // 1.2 รายรับอื่นๆ (เงินยกยอด, ดอกเบี้ย ฯลฯ)
        // ** ต้องสร้างตาราง other_incomes ก่อนตามขั้นตอนก่อนหน้านี้ **
        // ถ้ายังไม่สร้างตาราง ให้ comment ส่วนนี้แล้ว set totalOtherIncome = 0 ไปก่อน
        let totalOtherIncome = 0;
        try {
            const [otherRes] = await db.query("SELECT SUM(amount) as total FROM other_incomes");
            totalOtherIncome = Number(otherRes[0].total || 0);
        } catch (error) {
            console.warn("⚠️ Warning: Table 'other_incomes' might not exist yet.");
        }

        // 1.3 รวมรายรับทั้งหมด
        const totalIncome = totalMemberIncome + totalOtherIncome;

        // 1.4 รายจ่ายทั้งหมด
        const [expenseRes] = await db.query("SELECT SUM(amount) as total FROM expenses");
        const totalExpense = Number(expenseRes[0].total || 0);

        // 1.5 ยอดคงเหลือสุทธิ
        const balance = totalIncome - totalExpense;


        // ----------------------------------------------------
        // 2. คำนวณเรื่องคนค้างจ่าย (Unpaid Tracking)
        // ----------------------------------------------------

        // 2.1 หาคนค้างจ่าย "เดือนปัจจุบัน"
        // Logic: เอาทุกคนที่ Active มา Left Join กับตารางจ่ายเงินเดือนนี้
        const [currentUnpaid] = await db.query(`
            SELECT m.id, m.name, m.nickname, m.avatar_color, 'current' as type, p.status, p.target_month, p.target_year
            FROM members m
            LEFT JOIN payments p ON m.id = p.member_id AND p.target_month = ? AND p.target_year = ?
            WHERE m.is_active = 1 
            AND (p.status IS NULL OR p.status != 'approved')
        `, [currentMonth, currentYear]);

        // 2.2 หาหนี้ตกค้าง "จากอดีต" (Overdue)
        // Logic: หา Record ใน payments ที่ปี/เดือน น้อยกว่าปัจจุบัน และสถานะยังไม่ approved
        const [pastOverdue] = await db.query(`
            SELECT p.id, m.name, m.nickname, m.avatar_color, p.target_month, p.target_year, 'overdue' as type, p.status
            FROM payments p
            JOIN members m ON p.member_id = m.id
            WHERE p.status != 'approved'
            AND (p.target_year < ? OR (p.target_year = ? AND p.target_month < ?))
        `, [currentYear, currentYear, currentMonth]);

        // 2.3 รวมลิสต์คนค้างทั้งหมด (อดีต + ปัจจุบัน)
        const allUnpaid = [...pastOverdue, ...currentUnpaid];

        // 2.4 คำนวณยอดเงินรอเก็บ (สมมติคนละ 100 บาท)
        // ถ้าอนาคตยอดแต่ละเดือนไม่เท่ากัน อาจต้องปรับ Logic ตรงนี้
        const expectedRevenue = allUnpaid.length * 100;

        // ----------------------------------------------------
        // 3. ส่งข้อมูลกลับ
        // ----------------------------------------------------
        res.json({
            balance,
            totalIncome,
            totalMemberIncome, // ส่งแยกเผื่ออยากใช้
            totalOtherIncome,  // ส่งแยกเผื่ออยากใช้
            totalExpense,
            pendingCount: allUnpaid.length,
            unpaidList: allUnpaid,
            expectedRevenue
        });

    } catch (err) {
        console.error("❌ Dashboard API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. หมวด EXPENSES (รายจ่าย)
// ==========================================

app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, m.name as buyer_name, m.avatar_color 
            FROM expenses e 
            LEFT JOIN members m ON e.created_by = m.id 
            ORDER BY e.expense_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', upload.single('receiptImage'), async (req, res) => {
    try {
        const { title, amount, description, createdBy } = req.body;

        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const relativePath = req.file ? `${y}/${m}/${req.file.filename}` : null;

        await db.query(
            'INSERT INTO expenses (title, amount, description, receipt_image, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, amount, description, relativePath, createdBy]
        );

        res.json({ message: 'Expense saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// แก้ไขรายจ่าย
app.put('/api/expenses/:id', upload.single('receiptImage'), async (req, res) => {
    try {
        const { title, amount, description } = req.body;
        const expenseId = req.params.id;

        // ถ้ามีการอัปรูปใหม่ ให้ใช้รูปใหม่ ถ้าไม่มีให้ใช้รูปเดิม (Logic นี้ต้อง Query ของเก่ามาดู หรือ Handle ใน SQL)
        // เพื่อความง่าย: ถ้ามีไฟล์มาให้อัปเดต ถ้าไม่มีไม่ต้องยุ่งกับ field รูป
        let query = 'UPDATE expenses SET title=?, amount=?, description=? WHERE id=?';
        let params = [title, amount, description, expenseId];

        if (req.file) {
            const now = new Date();
            const relativePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${req.file.filename}`;
            query = 'UPDATE expenses SET title=?, amount=?, description=?, receipt_image=? WHERE id=?';
            params = [title, amount, description, relativePath, expenseId];
        }

        await db.query(query, params);
        res.json({ message: 'Expense updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ลบรายจ่าย
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. หมวด TRANSACTION / STATEMENT
app.get('/api/transactions', async (req, res) => {
    try {
        const query = `
            SELECT * FROM (
                -- 1. รายรับจากสมาชิก (Payments)
                SELECT 
                    p.id,  -- 👈 แก้ตรงนี้ครับ! จาก id เฉยๆ ให้เป็น p.id (ระบุว่าเป็น ID ของตาราง payments)
                    'income' as type,
                    'payment' as category,
                    CONCAT('ค่าส่วนกลาง ', m.name) as title,
                    amount,
                    paid_at as date,
                    NULL as image
                FROM payments p
                JOIN members m ON p.member_id = m.id
                WHERE p.status = 'approved'

                UNION ALL

                -- 2. รายจ่าย (Expenses)
                SELECT 
                    id,
                    'expense' as type,
                    'expense' as category,
                    title,
                    amount,
                    expense_date as date,
                    receipt_image as image
                FROM expenses

                UNION ALL

                -- 3. รายรับอื่นๆ (Other Incomes)
                SELECT 
                    id,
                    'income' as type,
                    'other' as category,
                    title,
                    amount,
                    receive_date as date,
                    NULL as image
                FROM other_incomes
            ) AS combined_transactions
            ORDER BY date DESC
            LIMIT 100;
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});