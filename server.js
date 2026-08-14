require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let dbType = 'unknown';
let mysqlPool = null;
let sqliteDb = null;

// Initialize Database connection 
async function initDatabase() {
    try {
        // Try MySQL first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`ladub_adventure\`;`);
        await connection.end();

        mysqlPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ladub_adventure',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Initialize MySQL tables
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                phone VARCHAR(30) DEFAULT '',
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'member',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await mysqlPool.query(`
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
        `);

        // Seed demo users if empty
        const [users] = await mysqlPool.query(`SELECT COUNT(*) as count FROM users`);
        if (users[0].count === 0) {
            await mysqlPool.query(`
                INSERT INTO users (name, email, phone, password, role) VALUES 
                ('Ladub Admin', 'ladubadventure@mail.com', '+6281234567890', 'admin123', 'admin'),
                ('VIP Member', 'vip@ladubadventure.com', '+6281987654321', 'vip123', 'vip');
            `);
        }

        // Seed demo contacts if empty
        const [contacts] = await mysqlPool.query(`SELECT COUNT(*) as count FROM contacts`);
        if (contacts[0].count === 0) {
            await mysqlPool.query(`
                INSERT INTO contacts (ref_id, name, email, phone, month, budget, message, status) VALUES 
                ('LA-ADV-102938', 'Alexander Vance', 'alexander@example.com', '+6281122334455', 'Oktober 2026', 'Rp 15.000.000 - Rp 30.000.000', 'Berminat ekspedisi privat ke Raja Ampat.', 'Contacted'),
                ('LA-ADV-583920', 'Karen Yue', 'karen@example.com', '+6287766554433', 'Desember 2026', 'Di atas Rp 50.000.000', 'Konsultasi paket liburan keluarga ke Bali & Sumba.', 'Pending');
            `);
        }

        dbType = 'mysql';
        console.log(' Connected to MySQL Database (ladub_adventure)');
    } catch (err) {
        console.warn(' MySQL connection not available, falling back to SQLite:', err.message);
        initSqlite();
    }
}

function initSqlite() {
    const dbPath = path.join(__dirname, 'ladub_adventure.db');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ SQLite connection error:', err.message);
            return;
        }
        dbType = 'sqlite';
        console.log(' Connected to SQLite Database (ladub_adventure.db)');

        sqliteDb.serialize(() => {
            sqliteDb.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT DEFAULT '',
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'member',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            sqliteDb.run(`
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ref_id TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT DEFAULT '',
                    month TEXT DEFAULT '',
                    budget TEXT DEFAULT '',
                    message TEXT,
                    status TEXT DEFAULT 'Pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Check & seed users
            sqliteDb.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
                if (!err && row.count === 0) {
                    sqliteDb.run(`
                        INSERT INTO users (name, email, phone, password, role) VALUES 
                        ('Ladub Admin', 'ladubadventure@mail.com', '+6281234567890', 'admin123', 'admin'),
                        ('VIP Member', 'vip@ladubadventure.com', '+6281987654321', 'vip123', 'vip');
                    `);
                }
            });

            // Check & seed contacts
            sqliteDb.get(`SELECT COUNT(*) as count FROM contacts`, (err, row) => {
                if (!err && row.count === 0) {
                    sqliteDb.run(`
                        INSERT INTO contacts (ref_id, name, email, phone, month, budget, message, status) VALUES 
                        ('LA-ADV-102938', 'Alexander Vance', 'alexander@example.com', '+6281122334455', 'Oktober 2026', 'Rp 15.000.000 - Rp 30.000.000', 'Berminat ekspedisi privat ke Raja Ampat.', 'Contacted'),
                        ('LA-ADV-583920', 'Karen Yue', 'karen@example.com', '+6287766554433', 'Desember 2026', 'Di atas Rp 50.000.000', 'Konsultasi paket liburan keluarga ke Bali & Sumba.', 'Pending');
                    `);
                }
            });
        });
    });
}

// Database Query Helpers
async function runQuery(sql, params = []) {
    if (dbType === 'mysql') {
        const [rows] = await mysqlPool.query(sql, params);
        return rows;
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

async function runExec(sql, params = []) {
    if (dbType === 'mysql') {
        const [result] = await mysqlPool.query(sql, params);
        return { insertId: result.insertId, affectedRows: result.affectedRows };
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ insertId: this.lastID, affectedRows: this.changes });
            });
        });
    }
}

// =========================================================
// API ENDPOINTS - AUTH & USERS (LOGIN / REGISTER CRUD)
// =========================================================

// 1. REGISTER (CREATE USER)
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Harap lengkapi Nama, Email, dan Password.' });
        }

        // Check if user exists
        const existing = await runQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Gunakan email lain.' });
        }

        const result = await runExec(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || '', password, 'member']
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil!',
            user: { id: result.insertId, name, email, phone, role: 'member' }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Gagal melakukan registrasi server: ' + err.message });
    }
});

// 2. LOGIN (READ USER AUTHENTICATION)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Masukkan Email dan Password.' });
        }

        const users = await runQuery('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email atau Kata Sandi salah.' });
        }

        const user = users[0];
        res.json({
            success: true,
            message: 'Login Berhasil!',
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Gagal verifikasi login server.' });
    }
});

// 3. GET ALL USERS (READ ALL USERS)
app.get('/api/users', async (req, res) => {
    try {
        const users = await runQuery('SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC');
        res.json({ success: true, dbType, users });
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data user.' });
    }
});


// API ENDPOINTS - CONTACT FORM 

// 1. CREATE CONTACT INQUIRY
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, phone, month, budget, message } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Nama dan Email wajib diisi.' });
        }

        const refId = "LA-ADV-" + Math.floor(100000 + Math.random() * 900000);

        const result = await runExec(
            'INSERT INTO contacts (ref_id, name, email, phone, month, budget, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [refId, name, email, phone || '', month || '', budget || '', message || '', 'Pending']
        );

        res.status(201).json({
            success: true,
            message: 'Permintaan konsultasi berhasil disimpan ke database!',
            contact: { id: result.insertId, ref_id: refId, name, email, phone, month, budget, message, status: 'Pending' }
        });
    } catch (err) {
        console.error('Create contact error:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan kontak.' });
    }
});

// 2. READ ALL CONTACTS
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await runQuery('SELECT * FROM contacts ORDER BY id DESC');
        res.json({ success: true, dbType, contacts });
    } catch (err) {
        console.error('Fetch contacts error:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data kontak.' });
    }
});

// Start Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(` Ladub Adventure Backend Server listening on http://localhost:${PORT}`);
    });
});
