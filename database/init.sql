-- สร้าง Database (ถ้ายังไม่มี)
CREATE DATABASE IF NOT EXISTS it_fund_vr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_fund_vr;
-- 1. ตารางสมาชิก (Members)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar_color VARCHAR(50) DEFAULT 'bg-gray-400',
    -- เก็บ class สี เช่น 'bg-blue-400' (ใช้ชั่วคราวก่อนมีรูปจริง)
    role ENUM('admin', 'member') DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. ตารางการจ่ายเงินค่าห้อง (Payments / Inflow)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    target_month INT NOT NULL,
    -- เดือนที่จ่าย (1-12)
    target_year INT NOT NULL,
    -- ปีที่จ่าย (เช่น 2026)
    amount DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    slip_image VARCHAR(255),
    -- ชื่อไฟล์รูปสลีป
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    -- รอตรวจ, จ่ายแล้ว, สลิปปลอม
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
-- 3. ตารางรายจ่ายกองกลาง (Expenses / Outflow)
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    -- ซื้ออะไร
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    receipt_image VARCHAR(255),
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    -- ใครเป็นคนบันทึก
    FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE
    SET NULL
);
-- 1. สร้างตารางเก็บรายรับอื่นๆ
CREATE TABLE IF NOT EXISTS other_incomes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    -- เช่น "เงินยกยอดมา", "ขายเม้าส์เก่า"
    amount DECIMAL(10, 2) NOT NULL,
    note TEXT,
    receive_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. ใส่เงินก้อนแรกลงไป (สมมติว่ามีเงินติดบัญชีอยู่ 5,000 บาท)
INSERT INTO other_incomes (title, amount, note)
VALUES (
        'เงินยกยอดจากปี 2025',
        5000.00,
        'ยอดเงินคงเหลือก่อนเริ่มใช้ระบบ'
    );