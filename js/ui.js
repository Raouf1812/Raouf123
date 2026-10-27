/* ==========================================================
   UI ENGINE & RENDERING CONTROLLER
   ========================================================== */

const UIEngine = (function() {
    let currentCategoryFilter = 'all';
    let currentSearchQuery = '';
    let currentDateFilter = 'all'; // 'all', 'today', 'week', 'month'
    let currentSortOrder = 'newest'; // 'newest', 'oldest', 'price-desc', 'price-asc'

    // Particle / Snow Canvas Engine
    let canvas, ctx, animFrameId;
    let width, height;
    let particles = [];
    const NUM_PARTICLES = 65;

    function initCanvas() {
        canvas = document.getElementById('snowCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        particles = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push(createParticle());
        }

        renderParticles();
    }

    function createParticle() {
        return {
            x: Math.random() * (width || window.innerWidth),
            y: Math.random() * (height || window.innerHeight),
            radius: Math.random() * 3 + 1,
            density: Math.random() * 0.9 + 0.4,
            opacity: Math.random() * 0.6 + 0.25,
            isGlowing: Math.random() > 0.65,
            swing: Math.random() * Math.PI * 2
        };
    }

    function renderParticles() {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, width, height);
        const theme = AppState.getData().theme || 'gold';
        let glowColor = '#facc15';
        if (theme === 'pink') glowColor = '#f472b6';
        else if (theme === 'lavender' || theme === 'amethyst') glowColor = '#c084fc';
        else if (theme === 'ruby') glowColor = '#fb7185';
        else if (theme === 'peach') glowColor = '#fb923c';
        else if (theme === 'emerald') glowColor = '#34d399';
        else if (theme === 'sapphire') glowColor = '#38bdf8';
        else if (theme === 'cyan') glowColor = '#22d3ee';
        else if (theme === 'dark' || theme === 'platinum') glowColor = '#cbd5e1';
        else if (theme === 'amber') glowColor = '#fb923c';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);

            if (p.isGlowing) {
                ctx.fillStyle = glowColor;
                ctx.globalAlpha = p.opacity;
                ctx.shadowBlur = 10;
                ctx.shadowColor = glowColor;
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = p.opacity * 0.7;
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#ffffff';
            }

            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            p.swing += 0.02;
            p.x += Math.sin(p.swing) * 0.4;
            p.y += p.density + 0.5; // تساقط دائم للكرات التفاعلية

            if (p.y > height + 10) {
                particles[i] = createParticle();
                particles[i].y = -10;
            } else if (p.y < -10) {
                particles[i] = createParticle();
                particles[i].y = height + 10;
            }
        }

        animFrameId = requestAnimationFrame(renderParticles);
    }

    // Live Clock & Date
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('liveClock');
        const dateEl = document.getElementById('liveDate');
        
        if (clockEl) {
            clockEl.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateEl) {
            dateEl.innerText = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // Toast Notifications
    function showToast(message, type = 'info') {
        const existing = document.querySelectorAll('.app-toast');
        existing.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'app-toast fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl font-black text-xs shadow-2xl transition-all animate-pop border flex items-center gap-2 max-w-[90vw] text-center';
        
        if (type === 'error') {
            toast.className += ' bg-rose-500/90 text-white border-rose-400 backdrop-blur-md';
            toast.innerHTML = `<i class="fa-solid fa-circle-exclamation text-sm"></i> <span>${message}</span>`;
        } else if (type === 'success') {
            toast.className += ' bg-emerald-500/90 text-white border-emerald-400 backdrop-blur-md';
            toast.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i> <span>${message}</span>`;
        } else {
            toast.className += ' bg-slate-900/95 text-amber-300 border-amber-500/40 backdrop-blur-md shadow-amber-500/10';
            toast.innerHTML = `<i class="fa-solid fa-bell text-sm text-amber-400"></i> <span>${message}</span>`;
        }

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -10px)';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }

    // Confetti Fireworks
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    // Refresh Header and Overview Stats
    function updateHeaderAndStats() {
        const data = AppState.getData();
        const stats = AppState.getStats();

        // Profile
        const nameEl = document.getElementById('headerUserName');
        if (nameEl) nameEl.innerText = data.userName || 'رؤوف';

        const avatarImg = document.getElementById('headerUserAvatar');
        if (avatarImg) {
            avatarImg.src = data.userAvatar || 'logo.png';
            avatarImg.onerror = () => { avatarImg.src = 'https://placehold.co/150x150/1e1435/facc15?text=رؤوف'; };
        }

        const settingsAvatar = document.getElementById('settingsAvatarPreview');
        if (settingsAvatar) {
            settingsAvatar.src = data.userAvatar || 'logo.png';
            settingsAvatar.onerror = () => { settingsAvatar.src = 'https://placehold.co/150x150/1e1435/facc15?text=رؤوف'; };
        }

        const settingsName = document.getElementById('settingsUserNameInput');
        if (settingsName && !settingsName.matches(':focus')) {
            settingsName.value = data.userName || '';
        }

        const settingsBudget = document.getElementById('settingsMonthlyBudgetInput');
        if (settingsBudget && !settingsBudget.matches(':focus')) {
            settingsBudget.value = data.monthlyBudget || '';
        }

        // Privacy Mode Class
        if (data.privacyMode) {
            document.body.classList.add('privacy-active');
            const privacyIcon = document.getElementById('privacyToggleIcon');
            if (privacyIcon) privacyIcon.className = 'fa-solid fa-eye-slash text-amber-400';
        } else {
            document.body.classList.remove('privacy-active');
            const privacyIcon = document.getElementById('privacyToggleIcon');
            if (privacyIcon) privacyIcon.className = 'fa-solid fa-eye text-slate-400';
        }

        // Amounts
        const headerAvailable = document.getElementById('headerTotalExpense');
        if (headerAvailable) {
            headerAvailable.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.availableBalance);
        }

        const overviewAvailable = document.getElementById('overviewAvailable');
        if (overviewAvailable) {
            overviewAvailable.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.availableBalance);
        }

        const todayTotalEl = document.getElementById('todayTotalExpense');
        if (todayTotalEl) {
            todayTotalEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.todayExpenseTotal);
        }

        const monthTotalEl = document.getElementById('monthTotalExpense');
        if (monthTotalEl) {
            monthTotalEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.monthExpenseTotal);
        }

        // Budget utilization bar & percent
        const budgetPercentEl = document.getElementById('overviewBudgetPercent');
        const budgetBarEl = document.getElementById('overviewBudgetBar');
        if (budgetPercentEl && budgetBarEl) {
            budgetPercentEl.innerText = `${stats.budgetPercent}%`;
            budgetBarEl.style.width = `${Math.min(100, stats.budgetPercent)}%`;

            if (stats.budgetPercent >= 90) {
                budgetBarEl.className = 'h-2 rounded-full transition-all duration-700 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]';
                budgetPercentEl.className = 'text-xs font-black text-rose-400';
            } else if (stats.budgetPercent >= 70) {
                budgetBarEl.className = 'h-2 rounded-full transition-all duration-700 bg-amber-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]';
                budgetPercentEl.className = 'text-xs font-black text-amber-400';
            } else {
                budgetBarEl.className = 'h-2 rounded-full transition-all duration-700 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]';
                budgetPercentEl.className = 'text-xs font-black text-emerald-400';
            }
        }

        // Debts quick summary card
        const quickDebtsReceivable = document.getElementById('quickDebtsReceivable');
        if (quickDebtsReceivable) {
            quickDebtsReceivable.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.receivableRemaining);
        }
        const quickDebtsPayable = document.getElementById('quickDebtsPayable');
        if (quickDebtsPayable) {
            quickDebtsPayable.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.payableRemaining);
        }
    }

    // Render Category Pills on Home Page
    function renderCategoryPills() {
        const container = document.getElementById('homeCategoryPills');
        if (!container) return;
        container.innerHTML = '';
    }

    function setCategoryFilter(catId) {
        currentCategoryFilter = catId;
        renderHomeItems();
        SoundEngine.playClick();
    }

    function setDateFilter(filterType) {
        currentDateFilter = filterType;
        renderHomeItems();
        SoundEngine.playClick();
    }

    function setSortOrder(order) {
        currentSortOrder = order;
        renderHomeItems();
        SoundEngine.playClick();
    }

    function setSearchQuery(query) {
        currentSearchQuery = (query || '').trim().toLowerCase();
        renderHomeItems();
    }

    // Filter & Sort Items (فقط ترتيب أحدث، أقدم، أرخص، أغلى)
    function getFilteredItems() {
        const data = AppState.getData();
        let items = [...data.items];

        // ترتيب فقط
        if (currentSortOrder === 'newest') {
            items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        } else if (currentSortOrder === 'oldest') {
            items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        } else if (currentSortOrder === 'price-desc') {
            items.sort((a, b) => ((b.price * (b.quantity || 1)) - (a.price * (a.quantity || 1))));
        } else if (currentSortOrder === 'price-asc') {
            items.sort((a, b) => ((a.price * (a.quantity || 1)) - (b.price * (b.quantity || 1))));
        }

        return items;
    }

    // Render Home Expenses List
    function renderHomeItems() {
        const container = document.getElementById('homeItemsList');
        const badge = document.getElementById('homeItemsBadge');
        if (!container) return;

        const filtered = getFilteredItems();
        if (badge) badge.innerText = `${filtered.length} عنصر`;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="py-12 text-center space-y-3">
                    <div class="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-lg border border-amber-500/20 shadow-lg">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <h4 class="text-xs font-bold text-white">لا توجد مصاريف مسجلة</h4>
                    <p class="text-[11px] text-slate-400">أضف أول مصروف في الشهر لبدء التتبع السريع.</p>
                </div>
            `;
            return;
        }

        // Group by Date
        const grouped = {};
        filtered.forEach(item => {
            const dateKey = item.date || AppState.getTodayDateString();
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(item);
        });

        const sortedDateKeys = Object.keys(grouped).sort().reverse();
        let html = '';

        sortedDateKeys.forEach(dateKey => {
            const dayItems = grouped[dateKey];
            const dayTotal = dayItems.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);

            html += `
                <div class="mt-4 mb-2 flex items-center justify-between gap-2">
                    <span class="text-[11px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                        <i class="fa-regular fa-calendar-days text-[10px]"></i> ${dateKey}
                    </span>
                    <span class="text-[11px] font-bold text-slate-400">
                        مجموع اليوم: <strong class="text-amber-400 font-black">${AppState.formatCurrency(dayTotal)}</strong>
                    </span>
                </div>
            `;

            dayItems.forEach(item => {
                const total = Number(item.price) * (Number(item.quantity) || 1);
                const cat = AppState.getCategoryById(item.category);

                html += `
                    <div class="glass-card p-3 sm:p-3.5 flex items-center justify-between gap-3 mb-2.5 group">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-sm shrink-0 border border-white/10 shadow-md" style="background:${cat.bg}; color:${cat.color}">
                                <i class="fa-solid ${cat.icon}"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <h4 class="text-xs sm:text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">${item.name}</h4>
                                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-300">
                                        ${cat.name}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                    <span>العدد: <strong class="text-slate-200">${item.quantity}</strong></span>
                                    <span class="text-slate-600">•</span>
                                    <span>السعر: <strong class="text-slate-200">${AppState.formatCurrency(item.price)}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 shrink-0">
                            <div class="text-left">
                                <span class="text-[9px] text-slate-400 block font-semibold">الإجمالي</span>
                                <span class="text-xs sm:text-sm font-black gold-text">${AppState.formatCurrency(total)}</span>
                            </div>
                            <!-- تم إلغاء زر التعديل من القائمة الرئيسية مع الإبقاء فقط على الحذف -->
                            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                <button onclick="UIEngine.deleteExpense(${item.id})" title="حذف المصروف" class="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 flex items-center justify-center text-[10px] transition">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    }

    // Render Admin Manage Items List
    function renderAdminItems() {
        const container = document.getElementById('adminItemsList');
        if (!container) return;

        const data = AppState.getData();
        if (data.items.length === 0) {
            container.innerHTML = `<div class="py-8 text-center text-xs text-slate-400">القائمة فارغة حالياً.</div>`;
            return;
        }

        let html = '';
        data.items.forEach(item => {
            const total = Number(item.price) * (Number(item.quantity) || 1);
            const cat = AppState.getCategoryById(item.category);

            html += `
                <div class="bg-slate-900/80 border border-amber-500/15 rounded-2xl p-2.5 flex items-center justify-between gap-2.5">
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full" style="background:${cat.color}"></span>
                            <h4 class="text-xs font-bold text-white truncate">${item.name}</h4>
                        </div>
                        <span class="text-[10px] text-slate-400 block truncate mt-0.5">
                            ${item.date || ''} | ${item.quantity} × ${AppState.formatCurrency(item.price)} = <strong class="text-amber-400">${AppState.formatCurrency(total)}</strong>
                        </span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button onclick="UIEngine.openEditModal(${item.id})" class="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition text-[11px] font-bold flex items-center gap-1">
                            <i class="fa-solid fa-pen text-[9px]"></i><span>تعديل</span>
                        </button>
                        <button onclick="UIEngine.deleteExpense(${item.id})" class="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition flex items-center justify-center text-xs">
                            <i class="fa-solid fa-trash text-[10px]"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Render Debts
    function renderDebts() {
        const payableList = document.getElementById('payableDebtsList');
        const receivableList = document.getElementById('receivableDebtsList');
        if (!payableList || !receivableList) return;

        const debts = AppState.getData().debts || [];
        const payables = debts.filter(d => d.type === 'payable');
        const receivables = debts.filter(d => d.type === 'receivable');

        function generateDebtHtml(d, isPayable) {
            const remaining = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
            const isFullyPaid = remaining <= 0;
            const pct = Math.min(100, Math.round(((d.paidAmount || 0) / d.totalAmount) * 100));

            return `
                <div class="glass-card p-3.5 space-y-2.5 mb-2.5">
                    <div class="flex items-center justify-between gap-2">
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="text-xs font-extrabold text-white">${d.personName}</h4>
                                ${isFullyPaid ? '<span class="text-[9px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">مسدد بالكامل ✅</span>' : ''}
                            </div>
                            <span class="text-[10px] text-amber-300/80 font-medium block mt-0.5">السبب: ${d.reason || 'غير محدد'}</span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button onclick="UIEngine.deleteDebtItem(${d.id})" class="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white flex items-center justify-center text-xs transition" title="حذف">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="space-y-1">
                        <div class="flex items-center justify-between text-[10px] font-bold">
                            <span class="text-slate-400">مسدد: <strong class="text-emerald-400">${AppState.formatCurrency(d.paidAmount || 0)}</strong></span>
                            <span class="text-slate-400">الإجمالي: <strong class="text-slate-200">${AppState.formatCurrency(d.totalAmount)}</strong></span>
                        </div>
                        <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full rounded-full transition-all duration-500 ${isFullyPaid ? 'bg-emerald-400' : 'bg-amber-400'}" style="width: ${pct}%"></div>
                        </div>
                        <div class="flex items-center justify-between text-[10px] font-bold">
                            <span class="${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}">المتبقي: ${AppState.formatCurrency(remaining)}</span>
                            <span class="text-slate-500">${pct}%</span>
                        </div>
                    </div>

                    ${!isFullyPaid ? `
                        <div class="pt-1.5 border-t border-white/5 flex justify-end">
                            <button onclick="UIEngine.openPayDebtModal(${d.id})" class="px-3 py-1.5 gold-btn rounded-xl text-xs font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-hand-holding-dollar"></i>
                                <span>${isPayable ? 'سداد جزء / الكل' : 'تحصيل جزء / الكل'}</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        payableList.innerHTML = payables.length === 0 ? 
            `<div class="text-[11px] text-slate-400 text-center py-6">لا توجد ديون عليك حالياً 🎉</div>` :
            payables.map(d => generateDebtHtml(d, true)).join('');

        receivableList.innerHTML = receivables.length === 0 ?
            `<div class="text-[11px] text-slate-400 text-center py-6">لا توجد مبالغ لك عند أحد حالياً.</div>` :
            receivables.map(d => generateDebtHtml(d, false)).join('');
    }

    // Render Savings Goals (الحصالة الذكية)
    function renderSavingsGoals() {
        const container = document.getElementById('savingsGoalsList');
        if (!container) return;

        const goals = AppState.getData().savingsGoals || [];
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="py-8 text-center space-y-2 col-span-full">
                    <div class="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-lg border border-amber-500/20">
                        <i class="fa-solid fa-piggy-bank"></i>
                    </div>
                    <h4 class="text-xs font-bold text-white">لا توجد أهداف ادخار أو حصالات مسجلة</h4>
                    <p class="text-[11px] text-slate-400">ابدأ بتحديد هدف مالي جديد كشراء سيارة، سفرية، أو صندوق طوارئ!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(g => {
            const current = Number(g.currentAmount) || 0;
            const target = Number(g.targetAmount) || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            return `
                <div class="glass-card p-4 space-y-3 relative overflow-hidden group">
                    ${isCompleted ? `
                        <div class="absolute -top-3 -right-3 w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 rotate-12">
                            <i class="fa-solid fa-trophy text-sm"></i>
                        </div>
                    ` : ''}

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-sm shadow-md">
                                <i class="fa-solid ${g.icon || 'fa-piggy-bank'}"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-black text-white">${g.title}</h4>
                                <span class="text-[10px] text-slate-400 block">${g.targetDate ? `تاريخ الهدف: ${g.targetDate}` : 'هدف مفتوح'}</span>
                            </div>
                        </div>
                        <button onclick="UIEngine.deleteSavingsGoalItem(${g.id})" class="text-slate-500 hover:text-rose-400 text-xs transition">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>

                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs font-black">
                            <span class="gold-text">${AppState.formatCurrency(current)}</span>
                            <span class="text-slate-400">الهدف: ${AppState.formatCurrency(target)}</span>
                        </div>
                        <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-300'}" style="width: ${pct}%"></div>
                        </div>
                        <div class="flex items-center justify-between text-[10px] font-bold">
                            <span class="${isCompleted ? 'text-emerald-400' : 'text-amber-400'}">${isCompleted ? '🎉 مبروك! حققت الهدف بالكامل' : `متبقي: ${AppState.formatCurrency(Math.max(0, target - current))}`}</span>
                            <span class="text-slate-400">${pct}%</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <button onclick="UIEngine.openGoalDepositModal(${g.id})" class="py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                            <i class="fa-solid fa-plus text-[10px]"></i> <span>إيداع في الحصالة</span>
                        </button>
                        <button onclick="UIEngine.openGoalWithdrawModal(${g.id})" class="py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                            <i class="fa-solid fa-minus text-[10px]"></i> <span>سحب للمحفظة</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render Salary History
    function renderSalaryHistory() {
        const container = document.getElementById('salaryHistoryList');
        if (!container) return;

        const list = AppState.getData().salaryHistory || [];
        if (list.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-400 text-center py-8">لا يوجد سجل إيداعات مضافة بعد.</div>`;
            return;
        }

        container.innerHTML = list.map(item => `
            <div class="glass-card p-3 flex items-center justify-between gap-3 mb-2">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <i class="fa-solid fa-arrow-down text-xs"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-white truncate">${item.note || 'إيداع رصيد'}</h4>
                        <span class="text-[10px] text-slate-400 block">${item.date || ''}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <span class="text-xs font-black text-emerald-400">+ ${AppState.formatCurrency(item.amount)}</span>
                    <button onclick="UIEngine.deleteSalaryItem(${item.id})" class="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition flex items-center justify-center text-xs" title="حذف الإيداع">
                        <i class="fa-solid fa-trash text-[10px]"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render Archive Page
    function renderArchiveOptions() {
        const selectEl = document.getElementById('historyMonthSelect');
        if (!selectEl) return;
        const archivedKeys = Object.keys(AppState.getData().archivedMonths || {}).sort().reverse();

        if (archivedKeys.length === 0) {
            selectEl.innerHTML = `<option value="">لا توجد شهور مأرشفة بعد</option>`;
            renderArchiveItems();
            return;
        }

        let optionsHtml = '';
        archivedKeys.forEach(key => {
            optionsHtml += `<option value="${key}">شهر ${key}</option>`;
        });
        selectEl.innerHTML = optionsHtml;
        renderArchiveItems();
    }

    function renderArchiveItems() {
        const selectEl = document.getElementById('historyMonthSelect');
        const container = document.getElementById('historyItemsList');
        const totalEl = document.getElementById('historyMonthTotal');
        if (!selectEl || !container) return;

        const val = selectEl.value;
        const archivedMonths = AppState.getData().archivedMonths || {};

        if (!val || !archivedMonths[val]) {
            container.innerHTML = `<div class="py-8 text-center text-xs text-slate-400">لا توجد بيانات متاحة لهذا الشهر.</div>`;
            if (totalEl) totalEl.innerText = AppState.formatCurrency(0);
            return;
        }

        const items = archivedMonths[val];
        let total = 0;
        let html = '';

        items.forEach(item => {
            const itemTotal = Number(item.price) * (Number(item.quantity) || 1);
            total += itemTotal;
            const cat = AppState.getCategoryById(item.category);

            html += `
                <div class="glass-card p-2.5 flex items-center justify-between gap-2.5 mb-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0" style="background:${cat.bg}; color:${cat.color}">
                            <i class="fa-solid ${cat.icon}"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs font-bold text-white truncate">${item.name}</h4>
                            <span class="text-[10px] text-slate-400 block mt-0.5">تاريخ: ${item.date || val} | الكمية: ${item.quantity}</span>
                        </div>
                    </div>
                    <div class="text-left shrink-0">
                        <span class="text-xs font-black gold-text">${AppState.formatCurrency(itemTotal)}</span>
                    </div>
                </div>
            `;
        });

        if (totalEl) totalEl.innerText = AppState.formatCurrency(total);
        container.innerHTML = html;
    }

    // Export to Excel (CSV with UTF-8 BOM for Arabic compatibility)
    function exportToCSV() {
        const items = AppState.getData().items || [];
        if (items.length === 0) {
            showToast('لا توجد مصاريف لتصديرها في الشهر الحالي', 'error');
            return;
        }

        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
        csvContent += 'التاريخ,اسم المصروف,التصنيف,السعر الفردي,العدد,المجموع,الملاحظات\n';

        items.forEach(it => {
            const cat = AppState.getCategoryById(it.category).name;
            const total = Number(it.price) * (Number(it.quantity) || 1);
            const notes = (it.notes || '').replace(/,/g, ' ');
            csvContent += `"${it.date || ''}","${it.name}","${cat}",${it.price},${it.quantity || 1},${total},"${notes}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير_المصاريف_${AppState.getCurrentMonthKey()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('تم تصدير ملف الإكسيل بنجاح 📊', 'success');
        SoundEngine.playSuccess();
    }

    // Print Financial PDF Report
    function printFinancialReport() {
        window.print();
    }

    // Actions
    function deleteExpense(id) {
        if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            AppState.deleteItem(id);
            refreshAllUI();
            showToast('تم حذف المصروف بنجاح');
        }
    }

    function deleteDebtItem(id) {
        if (confirm('هل أنت متأكد من حذف هذا الدين/السلفة؟')) {
            AppState.deleteDebt(id);
            refreshAllUI();
            showToast('تم حذف المعاملة');
        }
    }

    function deleteSalaryItem(id) {
        if (confirm('هل أنت متأكد من حذف هذا الإيداع وتعديل الرصيد؟')) {
            AppState.deleteSalary(id);
            refreshAllUI();
            showToast('تم حذف الإيداع');
        }
    }

    function deleteSavingsGoalItem(id) {
        if (confirm('هل أنت متأكد من حذف الحصالة؟ سيتم إعادة أي مبالغ متبقية فيها إلى رصيدك المتوفر.')) {
            AppState.deleteSavingsGoal(id);
            refreshAllUI();
            showToast('تم حذف الحصالة وإرجاع رصيدها');
        }
    }

    function openEditModal(id) {
        const item = AppState.getData().items.find(i => i.id == id);
        if (!item) return;

        document.getElementById('editingItemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemQuantity').value = item.quantity || 1;
        document.getElementById('itemCustomDate').value = item.date || AppState.getTodayDateString();
        const catEl = document.getElementById('itemCategorySelect');
        if (catEl) catEl.value = item.category || 'other';
        const payEl = document.getElementById('itemPaymentMethodSelect');
        if (payEl) payEl.value = item.paymentMethod || 'cash';

        document.getElementById('formTitleText').innerHTML = `تعديل صنف: ${item.name} ✏️`;
        document.getElementById('submitFormBtn').innerHTML = `<i class="fa-solid fa-check"></i> <span>تحديث البيانات</span>`;
        document.getElementById('cancelEditBtn').classList.remove('hidden');

        AppRouter.switchPage('addExpense');
    }

    function openPayDebtModal(id) {
        const debt = AppState.getData().debts.find(d => d.id == id);
        if (!debt) return;

        const remaining = Math.max(0, debt.totalAmount - (debt.paidAmount || 0));
        const promptMsg = debt.type === 'payable' 
            ? `سداد دين لـ (${debt.personName})\nالمبلغ المتبقي: ${remaining} ${AppState.getData().currency}\nأدخل المبلغ المراد دفعه:`
            : `تحصيل مبلغ من (${debt.personName})\nالمبلغ المتبقي: ${remaining} ${AppState.getData().currency}\nأدخل المبلغ المحصّل:`;

        const val = prompt(promptMsg, remaining);
        if (val === null) return;
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
            showToast('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }
        if (num > remaining) {
            showToast('المبلغ المدخل أكبر من المتبقي!', 'error');
            return;
        }

        const success = AppState.payDebt(id, num);
        if (success) {
            refreshAllUI();
            triggerConfetti();
            showToast('تم تسجيل الدفعة وتحديث الرصيد بنجاح 🎉', 'success');
        }
    }

    function openGoalDepositModal(id) {
        const goal = AppState.getData().savingsGoals.find(g => g.id == id);
        if (!goal) return;

        const stats = AppState.getStats();
        const maxAvailable = Math.max(0, stats.availableBalance);

        const val = prompt(`إيداع في حصالة (${goal.title})\nالمتوفر لديك حالياً: ${AppState.formatCurrency(maxAvailable)}\nأدخل المبلغ المراد تحويله للحصالة:`);
        if (val === null) return;
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
            showToast('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }
        if (num > maxAvailable) {
            showToast('عفواً، المبلغ أكبر من رصيدك المتوفر حالياً!', 'error');
            return;
        }

        const success = AppState.depositToGoal(id, num);
        if (success) {
            refreshAllUI();
            triggerConfetti();
            showToast(`تم إيداع ${AppState.formatCurrency(num)} في حصالة (${goal.title}) بنجاح 🎉`, 'success');
        }
    }

    function openGoalWithdrawModal(id) {
        const goal = AppState.getData().savingsGoals.find(g => g.id == id);
        if (!goal) return;

        const saved = goal.currentAmount || 0;
        if (saved <= 0) {
            showToast('الحصالة فارغة حالياً', 'error');
            return;
        }

        const val = prompt(`سحب من حصالة (${goal.title})\nالرصيد المدخر في الحصالة: ${AppState.formatCurrency(saved)}\nأدخل المبلغ المراد استرجاعه للمحفظة:`, saved);
        if (val === null) return;
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0 || num > saved) {
            showToast('المبلغ غير صالح أو أكبر من الموجود في الحصالة', 'error');
            return;
        }

        const success = AppState.withdrawFromGoal(id, num);
        if (success) {
            refreshAllUI();
            showToast(`تم استرجاع ${AppState.formatCurrency(num)} إلى رصيدك المتوفر بنجاح`, 'success');
        }
    }

    function refreshAllUI() {
        updateHeaderAndStats();
        renderHomeItems();
        renderAdminItems();
        renderDebts();
        renderSalaryHistory();
        renderArchiveOptions();
    }

    return {
        init: function() {
            initCanvas();
            refreshAllUI();
            setInterval(updateClock, 1000);
            updateClock();
        },
        refreshAllUI,
        showToast,
        triggerConfetti,
        setCategoryFilter,
        setDateFilter,
        setSortOrder,
        setSearchQuery,
        exportToCSV,
        printFinancialReport,
        deleteExpense,
        deleteDebtItem,
        deleteSalaryItem,
        openEditModal,
        openPayDebtModal
    };
})();

if (typeof window !== 'undefined') {
    window.UIEngine = UIEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIEngine;
}
