-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS ladub_adventure;
USE ladub_adventure;

-- 1. USERS TABLE (For Login & Register CRUD)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONTACTS TABLE (For Contact Form CRUD)
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    month VARCHAR(50) DEFAULT '',
    budget VARCHAR(100) DEFAULT '',
    message TEXT,
    status VARCHAR(30) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Demo Users
INSERT INTO users (name, email, phone, password, role) VALUES 
('Ladub Admin', 'ladubadventure@mail.com', '+6281234567890', 'admin123', 'admin'),
('VIP Member', 'vip@ladubadventure.com', '+6281987654321', 'vip123', 'vip')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Default Demo Contact Inquiries
INSERT INTO contacts (ref_id, name, email, phone, month, budget, message, status) VALUES 
('LA-ADV-102938', 'Alexander Vance', 'alexander@example.com', '+6281122334455', 'Oktober 2026', 'Rp 15.000.000 - Rp 30.000.000', 'Berminat ekspedisi privat ke Raja Ampat.', 'Contacted'),
('LA-ADV-583920', 'Karen Yue', 'karen@example.com', '+6287766554433', 'Desember 2026', 'Di atas Rp 50.000.000', 'Konsultasi paket liburan keluarga ke Bali & Sumba.', 'Pending')
ON DUPLICATE KEY UPDATE ref_id=VALUES(ref_id);
