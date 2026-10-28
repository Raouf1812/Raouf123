/* ==========================================================
   STATE MANAGEMENT & DATA REPOSITORY
   ========================================================== */

const AppState = (function() {
    const STORAGE_KEY = 'luxury_gold_expense_data';

    // Built-in Luxury Financial Categories
    const CATEGORIES = [
        { id: 'food', name: 'طعام ومشروبات', icon: 'fa-utensils', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
        { id: 'shopping', name: 'تسوق ومشتريات', icon: 'fa-bag-shopping', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
        { id: 'bills', name: 'فواتير والتزامات', icon: 'fa-bolt', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
        { id: 'transport', name: 'مواصلات وبنزين', icon: 'fa-car', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
        { id: 'health', name: 'صحة وأدوية', icon: 'fa-heart-pulse', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
        { id: 'entertainment', name: 'ترفيه وخروجات', icon: 'fa-gamepad', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
        { id: 'housing', name: 'سكن وإيجار', icon: 'fa-house', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
        { id: 'education', name: 'تعليم وتطوير', icon: 'fa-graduation-cap', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
        { id: 'charity', name: 'صدقات وهدايا', icon: 'fa-hand-holding-heart', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
        { id: 'work', name: 'عمل واستثمار', icon: 'fa-briefcase', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
        { id: 'other', name: 'مصاريف أخرى', icon: 'fa-receipt', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' }
    ];

    let data = {
        userName: 'userName',
        userAvatar: 'logo.png',
        currency: 'ج.م',
        monthlyBudget: 0,
        items: [],
        debts: [],
        salaryHistory: [],
        archivedMonths: {},
        recurringExpenses: [],
        theme: 'gold',
        snowEffect: 'snow',
        soundEnabled: true,
        privacyMode: false,
        budgetWarningPercent: 80
    };

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    data = Object.assign({}, data, parsed);
                }
            }
        } catch (e) {
            console.error('Error loading localStorage data:', e);
        }

        // Migration & integrity checks
        if (!data.userName) data.userName = 'رؤوف';
        if (!data.userAvatar) data.userAvatar = 'logo.png';
        data.currency = 'ج.م'; // مثبتة على الجنيه المصري فقط
        if (!Array.isArray(data.items)) data.items = [];
        if (!Array.isArray(data.debts)) data.debts = [];
        if (!Array.isArray(data.salaryHistory)) data.salaryHistory = [];
        if (!data.archivedMonths || typeof data.archivedMonths !== 'object') data.archivedMonths = {};
        if (!Array.isArray(data.recurringExpenses)) data.recurringExpenses = [];
        if (!data.theme) data.theme = 'gold';
        data.snowEffect = 'snow'; // تساقط دائم
        if (data.soundEnabled === undefined) data.soundEnabled = true;

        // Restore any archived items into data.items so all items are kept together
        if (data.archivedMonths && typeof data.archivedMonths === 'object') {
            Object.values(data.archivedMonths).forEach(monthItems => {
                if (Array.isArray(monthItems)) {
                    monthItems.forEach(archItem => {
                        if (!data.items.some(i => i.id == archItem.id)) {
                            data.items.push(archItem);
                        }
                    });
                }
            });
        }

        // Ensure each item has category
        data.items.forEach(item => {
            if (!item.category) {
                item.category = detectCategory(item.name);
            }
        });

        const sEngine = typeof SoundEngine !== 'undefined' ? SoundEngine : (typeof window !== 'undefined' ? window.SoundEngine : null);
        if (sEngine) {
            sEngine.setEnabled(data.soundEnabled);
        }
        saveData();
    }

    function playSound(action) {
        const s = typeof SoundEngine !== 'undefined' ? SoundEngine : (typeof window !== 'undefined' ? window.SoundEngine : null);
        if (s && typeof s[action] === 'function') {
            s[action]();
        }
    }

    function detectCategory(name) {
        if (!name) return 'other';
        const str = name.toLowerCase();
        if (/طعام|اكل|غدا|عشا|فطار|مطعم|وجبة|قهوة|كافيه|شاي|كولا|شيبسي|سندوتش|لحوم|فراخ/.test(str)) return 'food';
        if (/كهرباء|غاز|مياه|نت|انترنت|فاتورة|شحن|رصيد|اشتراك|تليفون/.test(str)) return 'bills';
        if (/مواصلات|اوبر|كريم|تاكسي|مترو|بنزين|سولار|عربية|صيانة/.test(str)) return 'transport';
        if (/شراء|سوبرماركت|ماركت|تسوق|هدوم|ملابس|احذية|مشتريات/.test(str)) return 'shopping';
        if (/علاج|دواء|صيدلية|دكتور|كشف|تحليل|مستشفى|طبيب/.test(str)) return 'health';
        if (/سينما|فسحة|خروجة|رحلة|العاب|جيم|بلايستيشن/.test(str)) return 'entertainment';
        if (/ايجار|شقة|عقار|سكن|بواب/.test(str)) return 'housing';
        if (/كتاب|كورس|درس|جامعة|مدرسة|ملازم/.test(str)) return 'education';
        if (/صدقة|تبرع|زكاة|هدية|عيدية/.test(str)) return 'charity';
        if (/شغل|بضاعة|استثمار|معدات|ادوات|مكتب/.test(str)) return 'work';
        return 'other';
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Storage full or error:', e);
        }
    }

    function getCurrentMonthKey(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    function getTodayDateString(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatCurrency(amount, withSymbol = true) {
        const num = Number(amount) || 0;
        const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return withSymbol ? `${formatted} ج.م` : formatted;
    }

    // Auto-Archive older months into history (preserves all items in data.items)
    function checkAndArchiveMonths() {
        const currentMonthKey = getCurrentMonthKey();
        if (!data.archivedMonths || typeof data.archivedMonths !== 'object') {
            data.archivedMonths = {};
        }
        let updated = false;

        data.items.forEach(item => {
            const itemDate = new Date(item.timestamp || item.date || Date.now());
            const itemMonthKey = getCurrentMonthKey(itemDate);

            if (itemMonthKey !== currentMonthKey) {
                if (!data.archivedMonths[itemMonthKey]) {
                    data.archivedMonths[itemMonthKey] = [];
                }
                if (!data.archivedMonths[itemMonthKey].some(i => i.id == item.id)) {
                    data.archivedMonths[itemMonthKey].push(item);
                    updated = true;
                }
            }
        });

        if (updated) {
            saveData();
        }
    }

    // Comprehensive Financial Calculations
    function getStats() {
        let monthExpenseTotal = 0;
        let todayExpenseTotal = 0;
        let allExpenseTotal = 0;
        const currentMonthKey = getCurrentMonthKey();
        const todayStr = getTodayDateString();
        const categoryTotals = {};
        const dailyExpenses = {};

        CATEGORIES.forEach(c => categoryTotals[c.id] = 0);

        let todayItems = [];
        let monthItemsWithTotal = [];

        data.items.forEach(item => {
            const total = Number(item.price) * (Number(item.quantity) || 1);
            allExpenseTotal += total;

            const itemSummary = {
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity) || 1,
                total: total,
                date: item.date || todayStr,
                category: item.category || 'other',
                notes: item.notes || ''
            };

            const itemDate = new Date(item.timestamp || item.date || Date.now());
            const itemMonthKey = getCurrentMonthKey(itemDate);

            // Month total should track current month for monthly budget calculations
            if (itemMonthKey === currentMonthKey || (item.date && item.date.startsWith(currentMonthKey))) {
                monthExpenseTotal += total;
                monthItemsWithTotal.push(itemSummary);
            }

            // Today total
            if (item.date === todayStr) {
                todayExpenseTotal += total;
                todayItems.push(itemSummary);
            }

            const cat = item.category || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + total;

            const dayKey = item.date || todayStr;
            dailyExpenses[dayKey] = (dailyExpenses[dayKey] || 0) + total;
        });

        // Today Highest and Lowest
        let todayMaxItem = null;
        let todayMinItem = null;
        if (todayItems.length > 0) {
            todayItems.sort((a, b) => b.total - a.total);
            todayMaxItem = todayItems[0];
            todayMinItem = todayItems[todayItems.length - 1];
        }

        // Month Highest and Lowest
        let monthMaxItem = null;
        let monthMinItem = null;
        if (monthItemsWithTotal.length > 0) {
            monthItemsWithTotal.sort((a, b) => b.total - a.total);
            monthMaxItem = monthItemsWithTotal[0];
            monthMinItem = monthItemsWithTotal[monthItemsWithTotal.length - 1];
        }

        // Average Daily
        const todayDate = new Date();
        const currentDayNumber = Math.max(1, todayDate.getDate());
        const monthAvgDaily = currentDayNumber > 0 ? (monthExpenseTotal / currentDayNumber) : 0;

        // السلم التحليلي للمصاريف (Expense Analysis Ladder)
        // 4 Tiers:
        // الدرجة الرابعة: قمة السلم (أكبر من 1000 ج.م)
        // الدرجة الثالثة: مصاريف مرتفعة (500 إلى 1000 ج.م)
        // الدرجة الثانية: مصاريف متوسطة (100 إلى 500 ج.م)
        // الدرجة الأولى: مصاريف بسيطة (أقل من 100 ج.م)
        const ladder = [
            {
                step: 4,
                title: 'قمة السلم (مصاريف كبرى)',
                badge: 'أكثر من 1,000 ج.م',
                icon: 'fa-gem',
                color: '#f43f5e',
                bg: 'rgba(244, 63, 94, 0.15)',
                filter: (it) => it.total > 1000,
                count: 0,
                total: 0,
                percent: 0,
                items: []
            },
            {
                step: 3,
                title: 'درجة مرتفعة (مصاريف أساسية كبيرة)',
                badge: '500 - 1,000 ج.م',
                icon: 'fa-bolt',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.15)',
                filter: (it) => it.total >= 500 && it.total <= 1000,
                count: 0,
                total: 0,
                percent: 0,
                items: []
            },
            {
                step: 2,
                title: 'درجة متوسطة (المصاريف الدورية)',
                badge: '100 - 500 ج.م',
                icon: 'fa-cart-shopping',
                color: '#3b82f6',
                bg: 'rgba(59, 130, 246, 0.15)',
                filter: (it) => it.total >= 100 && it.total < 500,
                count: 0,
                total: 0,
                percent: 0,
                items: []
            },
            {
                step: 1,
                title: 'قاعدة السلم (مصاريف يومية بسيطة)',
                badge: 'أقل من 100 ج.م',
                icon: 'fa-mug-hot',
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.15)',
                filter: (it) => it.total < 100,
                count: 0,
                total: 0,
                percent: 0,
                items: []
            }
        ];

        ladder.forEach(level => {
            const matches = monthItemsWithTotal.filter(level.filter);
            level.count = matches.length;
            level.total = matches.reduce((sum, it) => sum + it.total, 0);
            level.percent = monthExpenseTotal > 0 ? Math.round((level.total / monthExpenseTotal) * 100) : 0;
            level.items = matches.slice(0, 3);
        });

        let totalSalaryDeposits = data.salaryHistory.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

        // Net Available Balance
        let availableBalance = (Number(data.monthlyBudget) || 0) - monthExpenseTotal;

        // Debts
        let payableTotal = 0;
        let payableRemaining = 0;
        let receivableTotal = 0;
        let receivableRemaining = 0;

        data.debts.forEach(d => {
            const rem = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
            if (d.type === 'payable') {
                payableTotal += Number(d.totalAmount) || 0;
                payableRemaining += rem;
            } else {
                receivableTotal += Number(d.totalAmount) || 0;
                receivableRemaining += rem;
            }
        });

        // Budget utilization
        const budgetLimit = Number(data.monthlyBudget) || 0;
        const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((monthExpenseTotal / budgetLimit) * 100)) : 0;

        return {
            todayExpenseTotal,
            todayItemsCount: todayItems.length,
            todayMaxItem,
            todayMinItem,
            todayItems,
            monthExpenseTotal,
            allExpenseTotal,
            monthMaxItem,
            monthMinItem,
            monthAvgDaily,
            monthItemsCount: monthItemsWithTotal.length,
            ladder,
            availableBalance,
            budgetLimit,
            budgetPercent,
            totalSalaryDeposits,
            payableRemaining,
            receivableRemaining,
            payableTotal,
            receivableTotal,
            categoryTotals,
            dailyExpenses,
            itemsCount: data.items.length
        };
    }

    return {
        init: function() {
            loadData();
            checkAndArchiveMonths();
        },
        getData: function() {
            return data;
        },
        getCategories: function() {
            return CATEGORIES;
        },
        getCategoryById: function(id) {
            return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
        },
        detectCategory,
        getPaymentMethods: function() {
            return [];
        },
        getCurrencies: function() {
            return [{ code: 'ج.م', name: 'جنيه مصري (EGP)' }];
        },
        formatCurrency,
        getCurrentMonthKey,
        getTodayDateString,
        getStats,
        saveData,

        // Expense Item Operations
        addItem: function(item) {
            if (!item.id) item.id = Date.now();
            if (!item.timestamp) item.timestamp = new Date(item.date || Date.now()).getTime();
            if (!item.category || item.category === 'auto') item.category = detectCategory(item.name);
            if (!item.paymentMethod) item.paymentMethod = 'cash';
            data.items.unshift(item);
            checkAndArchiveMonths();
            saveData();
            playSound('playSuccess');
            return item;
        },
        updateItem: function(id, updatedFields) {
            const idx = data.items.findIndex(i => i.id == id);
            if (idx !== -1) {
                if (!updatedFields.category || updatedFields.category === 'auto') {
                    const targetName = updatedFields.name || (data.items[idx] ? data.items[idx].name : '');
                    updatedFields.category = detectCategory(targetName);
                }
                data.items[idx] = Object.assign({}, data.items[idx], updatedFields);
                if (data.archivedMonths && typeof data.archivedMonths === 'object') {
                    Object.keys(data.archivedMonths).forEach(k => {
                        const aIdx = data.archivedMonths[k].findIndex(i => i.id == id);
                        if (aIdx !== -1) {
                            data.archivedMonths[k][aIdx] = Object.assign({}, data.archivedMonths[k][aIdx], updatedFields);
                        }
                    });
                }
                checkAndArchiveMonths();
                saveData();
                playSound('playSuccess');
                return true;
            }
            return false;
        },
        deleteItem: function(id) {
            data.items = data.items.filter(i => i.id != id);
            if (data.archivedMonths && typeof data.archivedMonths === 'object') {
                Object.keys(data.archivedMonths).forEach(k => {
                    data.archivedMonths[k] = data.archivedMonths[k].filter(i => i.id != id);
                    if (data.archivedMonths[k].length === 0) {
                        delete data.archivedMonths[k];
                    }
                });
            }
            saveData();
            playSound('playDelete');
        },
        clearAllItems: function() {
            data.items = [];
            data.archivedMonths = {};
            saveData();
            playSound('playDelete');
        },

        // Budget & Profile
        setUserName: function(name) {
            if (name && name.trim()) {
                data.userName = name.trim();
                saveData();
            }
        },
        setUserAvatar: function(avatarUrl) {
            if (avatarUrl) {
                data.userAvatar = avatarUrl;
                saveData();
            }
        },
        setMonthlyBudget: function(amount) {
            data.monthlyBudget = Math.max(0, parseFloat(amount) || 0);
            saveData();
        },
        setTheme: function(theme) {
            data.theme = theme;
            saveData();
        },
        toggleSound: function() {
            data.soundEnabled = !data.soundEnabled;
            const sEngine = typeof SoundEngine !== 'undefined' ? SoundEngine : (typeof window !== 'undefined' ? window.SoundEngine : null);
            if (sEngine) sEngine.setEnabled(data.soundEnabled);
            saveData();
            return data.soundEnabled;
        },
        togglePrivacyMode: function() {
            data.privacyMode = !data.privacyMode;
            saveData();
            return data.privacyMode;
        },

        // Salary & Income
        addSalary: function(entry) {
            if (!entry.id) entry.id = Date.now();
            data.monthlyBudget = (Number(data.monthlyBudget) || 0) + (Number(entry.amount) || 0);
            data.salaryHistory.unshift(entry);
            saveData();
            playSound('playCoin');
        },
        deleteSalary: function(id) {
            const entry = data.salaryHistory.find(s => s.id == id);
            if (entry) {
                data.monthlyBudget = Math.max(0, (Number(data.monthlyBudget) || 0) - (Number(entry.amount) || 0));
                data.salaryHistory = data.salaryHistory.filter(s => s.id != id);
                saveData();
                playSound('playDelete');
            }
        },

        // Debts
        addDebt: function(debt) {
            if (!debt.id) debt.id = Date.now();
            if (!debt.paidAmount) debt.paidAmount = 0;
            if (!debt.history) debt.history = [];
            data.debts.unshift(debt);
            saveData();
            playSound('playClick');
        },
        payDebt: function(id, amount) {
            const debt = data.debts.find(d => d.id == id);
            if (!debt) return false;
            const payVal = parseFloat(amount);
            if (isNaN(payVal) || payVal <= 0) return false;

            debt.paidAmount = (Number(debt.paidAmount) || 0) + payVal;
            if (!debt.history) debt.history = [];
            debt.history.unshift({
                date: getTodayDateString(),
                amount: payVal
            });

            // If payable (we paid what we owed), our available balance decreases
            // If receivable (someone paid us), our available balance increases
            if (debt.type === 'payable') {
                data.monthlyBudget = Math.max(0, (Number(data.monthlyBudget) || 0) - payVal);
            } else {
                data.monthlyBudget = (Number(data.monthlyBudget) || 0) + payVal;
            }

            saveData();
            if (debt.paidAmount >= debt.totalAmount) {
                playSound('playCelebration');
            } else {
                playSound('playCoin');
            }
            return true;
        },
        deleteDebt: function(id) {
            data.debts = data.debts.filter(d => d.id != id);
            saveData();
            playSound('playDelete');
        },

        // Recurring Subscriptions
        addRecurring: function(rec) {
            if (!rec.id) rec.id = Date.now();
            data.recurringExpenses.push(rec);
            saveData();
            playSound('playSuccess');
        },
        deleteRecurring: function(id) {
            data.recurringExpenses = data.recurringExpenses.filter(r => r.id != id);
            saveData();
            playSound('playDelete');
        },

        // Archive
        deleteArchivedMonth: function(key) {
            if (data.archivedMonths && data.archivedMonths[key]) {
                const deletedIds = new Set(data.archivedMonths[key].map(i => i.id));
                delete data.archivedMonths[key];
                data.items = data.items.filter(i => !deletedIds.has(i.id));
                saveData();
                playSound('playDelete');
                return true;
            }
            return false;
        },

        // Backup & Restore
        exportBackupJSON: function() {
            return JSON.stringify(data, null, 2);
        },
        restoreBackupJSON: function(jsonString) {
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
                    data = Object.assign({}, data, parsed);
                    saveData();
                    playSound('playCelebration');
                    return true;
                }
            } catch (e) {
                console.error(e);
            }
            return false;
        }
    };
})();

if (typeof window !== 'undefined') {
    window.AppState = AppState;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}
