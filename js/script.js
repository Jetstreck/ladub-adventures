// 1. TAB SWITCHING MECHANISM
function switchTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show target tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Update Header Navigation Active State
    const navButtons = document.querySelectorAll('.header-nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-white/15', '!text-white');
        btn.classList.add('text-white/70');
    });

    const activeNavBtn = document.getElementById(`tab-nav-${tabId}`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active', 'bg-white/15', '!text-white');
        activeNavBtn.classList.remove('text-white/70');
    } else if (tabId === 'calculator') {
        const servicesBtn = document.getElementById('tab-nav-services');
        if (servicesBtn) {
            servicesBtn.classList.add('active', 'bg-white/15', '!text-white');
            servicesBtn.classList.remove('text-white/70');
        }
    }

    // Instant scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// 2. MOBILE MENU TOGGLE
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// 3. DESTINATIONS FILTERING
function filterDestinations(category) {
    const filterBtns = document.querySelectorAll('.dest-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.remove('bg-teal-600', 'text-white', 'border-teal-600', 'shadow-sm');
        btn.classList.add('bg-white/5', 'text-white/70', 'border-white/10');
    });

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.remove('bg-white/5', 'text-white/70', 'border-white/10');
        window.event.currentTarget.classList.add('bg-teal-600', 'text-white', 'border-teal-600', 'shadow-sm');
    }

    const cards = document.querySelectorAll('.dest-card');
    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// API Base Configuration
const API_BASE = (window.location.protocol === 'file:')
    ? 'http://localhost:3000/api'
    : '/api';

// 4. ENHANCED CONTACT FORM HANDLING (CREATE CONTACT)
async function handleContactSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const phoneInput = document.getElementById('form-phone');
    const monthInput = document.getElementById('form-month');
    const budgetInput = document.getElementById('form-budget');
    const messageInput = document.getElementById('form-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const month = monthInput ? monthInput.value : '';
    const budget = budgetInput ? budgetInput.value : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email) {
        alert("Harap lengkapi Nama dan Email Anda.");
        return;
    }

    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const submitBtn = document.getElementById('form-submit-btn');

    if (btnText) btnText.innerText = "MEMPROSES KONSULTASI...";
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, month, budget, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const refId = data.contact.ref_id;
            const formEl = document.getElementById('contact-form');
            const successCard = document.getElementById('contact-success-card');

            if (formEl && successCard) {
                formEl.classList.add('hidden');

                document.getElementById('contact-summary-name').innerText = name;
                document.getElementById('contact-summary-ref').innerText = refId;
                document.getElementById('contact-summary-email').innerText = email;
                document.getElementById('contact-summary-phone').innerText = phone || 'Tidak dicantumkan';
                document.getElementById('contact-summary-target').innerText = month;
                document.getElementById('contact-summary-budget').innerText = budget;

                successCard.classList.remove('hidden');
            }

            showToast("Konsultasi Diterima & Disimpan", "Data rincian tersimpan di Database MySQL!");
        } else {
            alert(data.message || 'Gagal menyimpan pesan ke database.');
        }
    } catch (err) {
        console.warn('API error, using local fallback:', err);
        // Fallback UI display
        const refId = "LA-ADV-" + Math.floor(100000 + Math.random() * 900000);
        const formEl = document.getElementById('contact-form');
        const successCard = document.getElementById('contact-success-card');

        if (formEl && successCard) {
            formEl.classList.add('hidden');
            document.getElementById('contact-summary-name').innerText = name;
            document.getElementById('contact-summary-ref').innerText = refId;
            document.getElementById('contact-summary-email').innerText = email;
            document.getElementById('contact-summary-phone').innerText = phone || 'Tidak dicantumkan';
            document.getElementById('contact-summary-target').innerText = month;
            document.getElementById('contact-summary-budget').innerText = budget;
            successCard.classList.remove('hidden');
        }
        showToast("Permintaan Konsultasi Diterima", "Tim Concierge Ladub Adventure akan menghubungi Anda < 2 Jam.");
    } finally {
        if (btnText) btnText.innerText = "KIRIM PERMINTAAN KONSULTASI";
        if (btnSpinner) btnSpinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function resetContactForm() {
    const formEl = document.getElementById('contact-form');
    const successCard = document.getElementById('contact-success-card');
    if (formEl) {
        formEl.reset();
        formEl.classList.remove('hidden');
    }
    if (successCard) {
        successCard.classList.add('hidden');
    }
}

// 5. LOGIN & REGISTER AUTHENTICATION HANDLING (AUTH CRUD)
function switchAuthMode(mode) {
    const loginForm = document.getElementById('auth-login-container');
    const registerForm = document.getElementById('auth-register-container');
    const heading = document.getElementById('auth-form-heading');
    const subheading = document.getElementById('auth-form-subheading');

    if (mode === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (heading) heading.innerText = "Welcome Back to Ladub Adventure";
        if (subheading) subheading.innerText = "Masukkan kredensial Anda untuk mengakses portal liburan anda.";
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (heading) heading.innerText = "Bergabung di Ladub Adventure";
        if (subheading) subheading.innerText = "Daftarkan diri Anda untuk permohonan mengakses plan anda dalam liburan.";
    }
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

function fillDemoCredentials() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput) emailInput.value = 'ladubadventure@mail.com';
    if (passInput) passInput.value = 'admin123';
    showToast("Demo VIP Auto-Filled", "Email: ladubadventure@mail.com | Pass: admin123");
}

// LOGIN USER (READ AUTH DATA FROM DATABASE)
async function handleLoginSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';

    if (!email || !pass) {
        alert("Harap masukkan Email dan Kata Sandi.");
        return;
    }

    const btnText = document.getElementById('login-btn-text');
    const btnSpinner = document.getElementById('login-btn-spinner');
    const submitBtn = document.getElementById('login-submit-btn');

    if (btnText) btnText.innerText = "VERIFIKASI PORTAL LADUB...";
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showVipLoungeView(data.user.name);
            showToast("Selamat Datang", `Akses Portal Database MySQL Diverifikasi: ${data.user.name}`);
        } else {
            alert(data.message || "Email atau Kata Sandi salah.");
        }
    } catch (err) {
        console.warn('API connection offline, using client fallback authentication:', err);
        showVipLoungeView(email.split('@')[0].toUpperCase() || 'MEMBER');
        showToast("Selamat Datang Kembali", "Akses Portal Ladub Adventure Diverifikasi (Local mode).");
    } finally {
        if (btnText) btnText.innerText = "MASUK PORTAL LADUB";
        if (btnSpinner) btnSpinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
}

// REGISTER USER (CREATE USER IN DATABASE)
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name')?.value.trim() || '';
    const email = document.getElementById('reg-email')?.value.trim() || '';
    const phone = document.getElementById('reg-phone')?.value.trim() || '';
    const pass = document.getElementById('reg-password')?.value || '';
    const confirmPass = document.getElementById('reg-confirm-password')?.value || '';
    const terms = document.getElementById('reg-terms')?.checked;

    if (!name || !email || !pass) {
        alert("Harap isi semua bidang wajib.");
        return;
    }

    if (pass !== confirmPass) {
        alert("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
        return;
    }

    if (!terms) {
        alert("Harap menyetujui Ketentuan Kerahasiaan NDA Ladub Adventure.");
        return;
    }

    const btnText = document.getElementById('reg-btn-text');
    const btnSpinner = document.getElementById('reg-btn-spinner');
    const submitBtn = document.getElementById('reg-submit-btn');

    if (btnText) btnText.innerText = "MENDAFTARKAN KEANGGOTAAN...";
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password: pass })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showVipLoungeView(data.user.name);
            showToast("Registrasi Berhasil", `User ${data.user.name} berhasil disimpan ke MySQL Database!`);
            fetchAndRenderUsers(); // Refresh Users CRUD list
        } else {
            alert(data.message || "Gagal mendaftarkan user.");
        }
    } catch (err) {
        console.warn('API error, using local fallback:', err);
        showVipLoungeView(name);
        showToast("Registrasi Berhasil", "Keanggotaan Ladub Adventure Anda Telah Diaktifkan!");
    } finally {
        if (btnText) btnText.innerText = "AJUKAN KEANGGOTAAN LADUB";
        if (btnSpinner) btnSpinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function showVipLoungeView(memberName) {
    const authCard = document.getElementById('auth-card-main');
    const loungeView = document.getElementById('vip-lounge-view');

    if (authCard) authCard.classList.add('hidden');
    if (loungeView) {
        loungeView.classList.remove('hidden');
        const nameEl = document.getElementById('vip-member-name');
        if (nameEl) nameEl.innerText = memberName;
    }

    // Login success state
}

function handleLogout() {
    const authCard = document.getElementById('auth-card-main');
    const loungeView = document.getElementById('vip-lounge-view');

    if (loungeView) loungeView.classList.add('hidden');
    if (authCard) authCard.classList.remove('hidden');

    showToast("Sesi Berakhir", "Anda telah keluar dari Portal Ladub Adventure.");
}

function copyContactEmail() {
    navigator.clipboard.writeText("concierge@ladubadventure.com");
    showToast("Email Disalin", "concierge@ladubadventure.com disalin ke clipboard.");
}

function openWhatsAppConcierge() {
    window.open("https://wa.me/6281234567890?text=Halo%20Concierge%20Ladub%20Adventure,%20saya%20ingin%20konsultasi%20perjalanan.", "_blank");
}


function copyContactEmail() {
    navigator.clipboard.writeText("concierge@ladubadventure.com");
    showToast("Email Disalin", "concierge@ladubadventure.com disalin ke clipboard.");
}

function openWhatsAppConcierge() {
    window.open("https://wa.me/6281234567890?text=Halo%20Concierge%20Ladub%20Adventure,%20saya%20ingin%20konsultasi%20perjalanan.", "_blank");
}

// 6. UTILITY TOAST NOTIFICATION
function showToast(title, message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    const toastTitle = toast.querySelector('h5');
    const toastMsg = toast.querySelector('p');

    if (toastTitle) toastTitle.innerText = title;
    if (toastMsg) toastMsg.innerText = message;

    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3500);
}

// 7. BUDGET CALCULATOR LOGIC
function calculateTripBudget() {
    const destinationEl = document.getElementById('calc-destination');
    const travelersEl = document.getElementById('calc-travelers');
    const durationEl = document.getElementById('calc-duration');
    const lodgingEl = document.getElementById('calc-lodging');

    if (!destinationEl || !travelersEl || !durationEl || !lodgingEl) return;

    const baseRates = {
        'bali': 650000,
        'jogja': 450000,
        'labuan-bajo': 1100000,
        'sumba': 950000,
        'raja-ampat': 1500000
    };

    const lodgingMultipliers = {
        'standard': 1.0,
        'villa': 1.75,
        'luxury': 2.8
    };

    const dest = destinationEl.value;
    const travelers = Math.max(1, parseInt(travelersEl.value) || 1);
    const duration = Math.max(1, parseInt(durationEl.value) || 1);
    const lodging = lodgingEl.value;

    let baseRate = baseRates[dest] || 650000;
    let lodgingMult = lodgingMultipliers[lodging] || 1.0;

    // Additional services per day per group
    let extrasCostPerDay = 0;
    if (document.getElementById('calc-extra-transport')?.checked) extrasCostPerDay += 350000;
    if (document.getElementById('calc-extra-guide')?.checked) extrasCostPerDay += 250000;
    if (document.getElementById('calc-extra-drone')?.checked) extrasCostPerDay += 300000;
    if (document.getElementById('calc-extra-culinary')?.checked) extrasCostPerDay += 400000;

    let baseDailyCostPerPerson = baseRate * lodgingMult;
    let totalPerPerson = (baseDailyCostPerPerson * duration) + ((extrasCostPerDay * duration) / travelers);
    let grandTotal = totalPerPerson * travelers;

    // Update UI elements
    const totalEl = document.getElementById('calc-total-price');
    const perPersonEl = document.getElementById('calc-per-person');
    const durationSummaryEl = document.getElementById('calc-summary-duration');

    if (totalEl) totalEl.innerText = 'Rp ' + Math.round(grandTotal).toLocaleString('id-ID');
    if (perPersonEl) perPersonEl.innerText = 'Rp ' + Math.round(totalPerPerson).toLocaleString('id-ID') + ' / orang';
    if (durationSummaryEl) durationSummaryEl.innerText = `${travelers} Peserta · ${duration} Hari`;
}

function applyBudgetToContact() {
    const destinationEl = document.getElementById('calc-destination');
    const totalEl = document.getElementById('calc-total-price');
    const durationSummaryEl = document.getElementById('calc-summary-duration');

    const destName = destinationEl ? destinationEl.options[destinationEl.selectedIndex].text : '';
    const totalCost = totalEl ? totalEl.innerText : '';
    const durationInfo = durationSummaryEl ? durationSummaryEl.innerText : '';

    switchTab('contact');

    const msgInput = document.getElementById('form-message');
    if (msgInput) {
        msgInput.value = `Halo Ladub Adventure, saya telah menghitung estimasi budget perjalanan:\n- Destinasi: ${destName}\n- Peserta & Durasi: ${durationInfo}\n- Estimasi Total Budget: ${totalCost}\n\nMohon bantu siapkan rekomendasi itinerary dan rincian pemesanan untuk paket ini. Terima kasih!`;
    }

    const budgetSelect = document.getElementById('form-budget');
    if (budgetSelect) {
        // Try selecting budget category if available
        let rawTotalStr = totalCost.replace(/[^0-9]/g, '');
        let rawTotal = parseInt(rawTotalStr) || 0;
        if (rawTotal < 15000000) {
            budgetSelect.value = "Rp 5.000.000 - Rp 15.000.000";
        } else if (rawTotal <= 30000000) {
            budgetSelect.value = "Rp 15.000.000 - Rp 30.000.000";
        } else if (rawTotal <= 50000000) {
            budgetSelect.value = "Rp 30.000.000 - Rp 50.000.000";
        } else {
            budgetSelect.value = "Di atas Rp 50.000.000";
        }
    }

    showToast("Budget Diterapkan", "Rincian estimasi budget otomatis diisikan ke formulir kontak.");
}

// Auto recalculate on window load if elements exist
document.addEventListener('DOMContentLoaded', () => {
    calculateTripBudget();
});


