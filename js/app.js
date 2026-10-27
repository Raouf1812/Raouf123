/* ==========================================================
   MAIN CONTROLLER & ROUTER - LUXURY FINANCIAL SUITE
   ========================================================== */

const AppRouter = (function() {
    const pages = [
        'homePage',
        'addExpensePage',
        'debtsPage',
        'salaryPage',
        'historyPage',
        'adminPage',
        'syncPage',
        'aboutPage'
    ];

    const navMap = {
        home: 'nav-home',
        addExpense: 'nav-addExpense',
        debts: 'nav-debts',
        salary: 'nav-salary',
        history: 'nav-history',
        admin: 'nav-admin',
        sync: 'nav-sync',
        about: 'nav-about'
    };

    let currentPage = 'home';

    function setActiveNav(btnEl) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
    }

    function switchPage(pageKey) {
        if (!pages.includes(`${pageKey}Page`) && pageKey !== 'home') {
            pageKey = 'home';
        }
        currentPage = pageKey;

        pages.forEach(p => {
            const el = document.getElementById(p);
            if (el) el.classList.add('hidden');
        });

        const targetEl = document.getElementById(`${pageKey}Page`);
        if (targetEl) {
            targetEl.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const navBtnId = navMap[pageKey];
        if (navBtnId) {
            const btn = document.getElementById(navBtnId);
            if (btn) setActiveNav(btn);
        }

        // Trigger updates specific to page
        if (pageKey === 'home') {
            UIEngine.refreshAllUI();
        } else if (pageKey === 'addExpense') {
            const dateInput = document.getElementById('itemCustomDate');
            if (dateInput && !dateInput.value) {
                dateInput.value = AppState.getTodayDateString();
            }
        } else if (pageKey === 'salary') {
            const sDate = document.getElementById('salaryDate');
            if (sDate) sDate.value = AppState.getTodayDateString();
            UIEngine.refreshAllUI();
        } else if (pageKey === 'debts') {
            UIEngine.refreshAllUI();
        } else if (pageKey === 'history') {
            UIEngine.refreshAllUI();
        }

        SoundEngine.playClick();
    }

    return {
        switchPage,
        getCurrentPage: () => currentPage
    };
})();

if (typeof window !== 'undefined') {
    window.AppRouter = AppRouter;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppRouter;
}

// Global Event Handlers & Form Actions
function handleFormSubmit(event) {
    event.preventDefault();
    const editingId = document.getElementById('editingItemId').value;
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    const customDate = document.getElementById('itemCustomDate').value || AppState.getTodayDateString();
    const category = document.getElementById('itemCategorySelect').value || 'other';
    const paymentMethod = 'cash'; // طريقة دفع ثابتة (لا يوجد اختيار)
    const notes = (document.getElementById('itemNotes') ? document.getElementById('itemNotes').value.trim() : '');

    if (!name || isNaN(price) || price < 0) {
        UIEngine.showToast('يرجى التأكد من إدخال اسم المصروف وسعر صحيح', 'error');
        return;
    }

    const timestamp = new Date(customDate).getTime() || Date.now();

    if (editingId) {
        AppState.updateItem(editingId, {
            name,
            price,
            quantity,
            date: customDate,
            timestamp,
            category,
            paymentMethod,
            notes
        });
        UIEngine.showToast('تم تحديث بيانات المصروف بنجاح ✏️', 'success');
    } else {
        AppState.addItem({
            name,
            price,
            quantity,
            date: customDate,
            timestamp,
            category,
            paymentMethod,
            notes
        });
        UIEngine.showToast('تمت إضافة المصروف بنجاح ✅', 'success');
    }

    resetForm();
    UIEngine.refreshAllUI();
    AppRouter.switchPage('home');
}

function resetForm() {
    const form = document.getElementById('itemForm');
    if (form) form.reset();
    const editId = document.getElementById('editingItemId');
    if (editId) editId.value = '';
    const qty = document.getElementById('itemQuantity');
    if (qty) qty.value = '1';
    const dateInput = document.getElementById('itemCustomDate');
    if (dateInput) dateInput.value = AppState.getTodayDateString();
    const title = document.getElementById('formTitleText');
    if (title) title.innerHTML = `إضافة صنف أو مصروف جديد ➕`;
    const submitBtn = document.getElementById('submitFormBtn');
    if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> <span>حفظ وإضافة المصروف</span>`;
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

function handleAddSalary(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('salaryAmount').value);
    const date = document.getElementById('salaryDate').value || AppState.getTodayDateString();
    const note = document.getElementById('salaryNote').value.trim() || 'مرتب / دخل إضافي';

    if (isNaN(amount) || amount <= 0) {
        UIEngine.showToast('يرجى إدخال مبلغ إيداع صحيح', 'error');
        return;
    }

    AppState.addSalary({
        amount: amount,
        date: date,
        note: note
    });

    event.target.reset();
    document.getElementById('salaryDate').value = AppState.getTodayDateString();
    UIEngine.refreshAllUI();
    UIEngine.triggerConfetti();
    UIEngine.showToast(`تم إيداع ${AppState.formatCurrency(amount)} في رصيدك بنجاح 💵`, 'success');
}

function handleAddDebt(event) {
    event.preventDefault();
    const type = document.getElementById('debtType').value;
    const personName = document.getElementById('debtPersonName').value.trim();
    const reason = document.getElementById('debtReason').value.trim() || 'بدون سبب مذكور';
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const phone = ''; // تم إزالة حقل الهاتف

    if (!personName || isNaN(amount) || amount <= 0) {
        UIEngine.showToast('يرجى إدخال اسم الشخص والمبلغ بشكل صحيح', 'error');
        return;
    }

    AppState.addDebt({
        type: type,
        personName: personName,
        reason: reason,
        totalAmount: amount,
        paidAmount: 0,
        phone: phone,
        date: AppState.getTodayDateString()
    });

    event.target.reset();
    UIEngine.refreshAllUI();
    UIEngine.showToast('تم تسجيل المعاملة بنجاح 🤝', 'success');
}



function updateUserNameFromSettings() {
    const input = document.getElementById('settingsUserNameInput');
    const name = input.value.trim();
    if (name) {
        AppState.setUserName(name);
        UIEngine.refreshAllUI();
        UIEngine.showToast('تم تحديث الاسم الشخصي بنجاح');
        SoundEngine.playSuccess();
    }
}

function updateMonthlyBudgetFromSettings() {
    const input = document.getElementById('settingsMonthlyBudgetInput');
    const val = parseFloat(input.value) || 0;
    AppState.setMonthlyBudget(val);
    UIEngine.refreshAllUI();
    UIEngine.showToast('تم تحديث الميزانية بنجاح');
    SoundEngine.playSuccess();
}

function handleUserAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            AppState.setUserAvatar(e.target.result);
            UIEngine.refreshAllUI();
            UIEngine.showToast('تم تحديث الصورة الشخصية 📸', 'success');
            SoundEngine.playSuccess();
        };
        reader.readAsDataURL(file);
    }
}

function changeTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    AppState.setTheme(themeName);
    
    // Update theme active button visuals
    document.querySelectorAll('.theme-picker-btn').forEach(btn => {
        if (btn.getAttribute('data-theme-choice') === themeName) {
            btn.classList.add('ring-2', 'ring-white', 'scale-105');
        } else {
            btn.classList.remove('ring-2', 'ring-white', 'scale-105');
        }
    });

    SoundEngine.playClick();
    UIEngine.showToast(`تم تفعيل سمة: ${getThemeArabicName(themeName)} ✨`);
}

function getThemeArabicName(theme) {
    switch (theme) {
        case 'gold': return 'الذهب الملكي';
        case 'emerald': return 'الزمرد المضيء';
        case 'sapphire': return 'الياقوت الأزرق';
        case 'amethyst': return 'الأرجواني الفاخر';
        case 'platinum': return 'الماس الكريستالي';
        case 'pink': return 'الوردي الناعم';
        case 'lavender': return 'اللافندر المخملي';
        case 'ruby': return 'الياقوت الأحمر';
        case 'peach': return 'الخوخي الدافئ';
        case 'cyan': return 'الفيروز البحري';
        case 'amber': return 'الكهرمان النيراني';
        default: return 'الذهب الملكي';
    }
}

function changeCurrency(curr) {
    AppState.setCurrency(curr);
    UIEngine.refreshAllUI();
    UIEngine.showToast(`تم تغيير العملة إلى (${curr})`);
    SoundEngine.playSuccess();
}

function changeSnowEffect(effect) {
    AppState.setSnowEffect(effect);
    UIEngine.showToast('تم تحديث تأثير الخلفية 🌌');
    SoundEngine.playClick();
}

function toggleSound() {
    const isEnabled = AppState.toggleSound();
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
        soundBtn.innerHTML = isEnabled 
            ? `<i class="fa-solid fa-volume-high text-amber-400"></i>` 
            : `<i class="fa-solid fa-volume-xmark text-slate-500"></i>`;
    }
    UIEngine.showToast(isEnabled ? 'تم تشغيل الأصوات التفاعلية 🔔' : 'تم كتم الصوت 🔕');
}

function togglePrivacy() {
    const isPrivacy = AppState.togglePrivacyMode();
    UIEngine.refreshAllUI();
    SoundEngine.playClick();
    UIEngine.showToast(isPrivacy ? 'تم إخفاء الرصيد (وضع الخصوصية) 🔒' : 'تم إظهار الرصيد 👁️');
}

function clearAllCurrentItems() {
    if (confirm('هل أنت متأكد من حذف جميع مصاريف الشهر الحالي بالكامل؟ لا يمكن التراجع!')) {
        AppState.clearAllItems();
        UIEngine.refreshAllUI();
        UIEngine.showToast('تم مسح جميع المصاريف');
    }
}

function deleteArchivedMonth() {
    const selectEl = document.getElementById('historyMonthSelect');
    const selectedMonth = selectEl ? selectEl.value : '';
    if (!selectedMonth) {
        UIEngine.showToast('لا يوجد شهر مأرشف محدد للحذف', 'error');
        return;
    }
    if (confirm(`هل أنت متأكد نهائياً من حذف أرشيف شهر (${selectedMonth})؟`)) {
        AppState.deleteArchivedMonth(selectedMonth);
        UIEngine.refreshAllUI();
        UIEngine.showToast('تم حذف أرشيف الشهر بنجاح');
    }
}

function downloadBackupFile() {
    try {
        const jsonStr = AppState.exportBackupJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const fileName = `Expense_Backup_${AppState.getTodayDateString()}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIEngine.showToast('تم تحميل ملف النسخة الاحتياطية بنجاح! 📥', 'success');
        SoundEngine.playSuccess();
    } catch (e) {
        console.error(e);
        UIEngine.showToast('حدث خطأ أثناء تحميل الملف', 'error');
    }
}

function restoreBackupFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم دمج وتحديث البيانات الحالية بالبيانات المستوردة.')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const success = AppState.restoreBackupJSON(e.target.result);
        if (success) {
            UIEngine.refreshAllUI();
            UIEngine.triggerConfetti();
            UIEngine.showToast('تمت استعادة البيانات بنجاح! 🎉', 'success');
            setTimeout(() => AppRouter.switchPage('home'), 800);
        } else {
            UIEngine.showToast('ملف النسخة الاحتياطية غير صالح أو تالف', 'error');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

function openImageViewer(imgSrc) {
    if (!imgSrc) return;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImageContent');
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.remove('hidden');
    }
}

function closeImageViewer() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.add('hidden');
}

// Populate Category dropdown in forms
function populateFormDropdowns() {
    const catSelect = document.getElementById('itemCategorySelect');
    if (catSelect) {
        const categories = AppState.getCategories();
        catSelect.innerHTML = categories.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join('');
    }
    // ملاحظة: تم إزالة populate للعملة (EGP ثابتة) والثلج (يتساقط دائماً) وطريقة الدفع (محذوفة)
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    if (e.key === '+' || e.key === 'n' || e.key === 'N') {
        AppRouter.switchPage('addExpense');
    } else if (e.key === 'Escape') {
        closeImageViewer();
    }
});

// App Initialization
window.addEventListener('DOMContentLoaded', function() {
    AppState.init();

    // Apply saved Theme
    const savedTheme = AppState.getData().theme || 'gold';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-picker-btn').forEach(btn => {
        if (btn.getAttribute('data-theme-choice') === savedTheme) {
            btn.classList.add('ring-2', 'ring-white', 'scale-105');
        } else {
            btn.classList.remove('ring-2', 'ring-white', 'scale-105');
        }
    });

    // Apply sound icon state
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
        soundBtn.innerHTML = AppState.getData().soundEnabled 
            ? `<i class="fa-solid fa-volume-high text-amber-400"></i>` 
            : `<i class="fa-solid fa-volume-xmark text-slate-500"></i>`;
    }

    populateFormDropdowns();
    UIEngine.init();

    // Default dates
    const dateInput = document.getElementById('itemCustomDate');
    if (dateInput) dateInput.value = AppState.getTodayDateString();

    const sDate = document.getElementById('salaryDate');
    if (sDate) sDate.value = AppState.getTodayDateString();
});
