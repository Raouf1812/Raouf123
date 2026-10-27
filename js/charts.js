/* ==========================================================
   CHARTS & FINANCIAL ANALYTICS - EXPENSE LADDER & ANALYSIS
   ========================================================== */

const AnalyticsEngine = (function() {
    let ladderChartInstance = null;

    function destroyCharts() {
        if (ladderChartInstance) {
            ladderChartInstance.destroy();
            ladderChartInstance = null;
        }
    }

    // 1. Render Daily Spending Analysis (Highest, Lowest, Total, Count)
    function renderDailyAnalysis() {
        const stats = AppState.getStats();
        const data = AppState.getData();

        // Total
        const totalEl = document.getElementById('dailyTotalAnalytic');
        if (totalEl) {
            totalEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.todayExpenseTotal);
        }

        // Count
        const countBadge = document.getElementById('todayCountBadge');
        if (countBadge) {
            countBadge.innerText = `${stats.todayItemsCount} معاملة`;
        }

        // Highest item today
        const maxNameEl = document.getElementById('todayMaxName');
        const maxAmountEl = document.getElementById('todayMaxAmount');
        if (stats.todayMaxItem) {
            if (maxNameEl) maxNameEl.innerText = stats.todayMaxItem.name;
            if (maxAmountEl) {
                maxAmountEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.todayMaxItem.total);
            }
        } else {
            if (maxNameEl) maxNameEl.innerText = 'لا توجد مصاريف مسجلة اليوم';
            if (maxAmountEl) maxAmountEl.innerText = '0.00 ج.م';
        }

        // Lowest item today
        const minNameEl = document.getElementById('todayMinName');
        const minAmountEl = document.getElementById('todayMinAmount');
        if (stats.todayMinItem) {
            if (minNameEl) minNameEl.innerText = stats.todayMinItem.name;
            if (minAmountEl) {
                minAmountEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.todayMinItem.total);
            }
        } else {
            if (minNameEl) minNameEl.innerText = 'لا توجد مصاريف مسجلة اليوم';
            if (minAmountEl) minAmountEl.innerText = '0.00 ج.م';
        }
    }

    // 2. Render Monthly Spending Analysis (Highest, Lowest, Total, Daily Average)
    function renderMonthlyAnalysis() {
        const stats = AppState.getStats();
        const data = AppState.getData();

        // Total
        const totalEl = document.getElementById('monthlyTotalAnalytic');
        if (totalEl) {
            totalEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.monthExpenseTotal);
        }

        // Highest item this month
        const maxNameEl = document.getElementById('monthMaxName');
        const maxAmountEl = document.getElementById('monthMaxAmount');
        const maxDateEl = document.getElementById('monthMaxDate');
        if (stats.monthMaxItem) {
            if (maxNameEl) maxNameEl.innerText = stats.monthMaxItem.name;
            if (maxAmountEl) {
                maxAmountEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.monthMaxItem.total);
            }
            if (maxDateEl) maxDateEl.innerText = stats.monthMaxItem.date || '';
        } else {
            if (maxNameEl) maxNameEl.innerText = 'لا توجد مصاريف هذا الشهر';
            if (maxAmountEl) maxAmountEl.innerText = '0.00 ج.م';
            if (maxDateEl) maxDateEl.innerText = '---';
        }

        // Lowest item this month
        const minNameEl = document.getElementById('monthMinName');
        const minAmountEl = document.getElementById('monthMinAmount');
        const minDateEl = document.getElementById('monthMinDate');
        if (stats.monthMinItem) {
            if (minNameEl) minNameEl.innerText = stats.monthMinItem.name;
            if (minAmountEl) {
                minAmountEl.innerText = data.privacyMode ? '••••••' : AppState.formatCurrency(stats.monthMinItem.total);
            }
            if (minDateEl) minDateEl.innerText = stats.monthMinItem.date || '';
        } else {
            if (minNameEl) minNameEl.innerText = 'لا توجد مصاريف هذا الشهر';
            if (minAmountEl) minAmountEl.innerText = '0.00 ج.م';
            if (minDateEl) minDateEl.innerText = '---';
        }

        // Average Daily
        const avgDailyEl = document.getElementById('monthAvgDailyAnalytic');
        if (avgDailyEl) {
            avgDailyEl.innerText = data.privacyMode ? '••••••' : `${AppState.formatCurrency(stats.monthAvgDaily)} / يوم`;
        }
    }

    // 3. Render Expense Analysis Ladder (السلم التحليلي للمصاريف)
    function renderExpenseLadder() {
        const container = document.getElementById('expenseLadderContainer');
        if (!container) return;

        const stats = AppState.getStats();
        const ladder = stats.ladder || [];
        const isPrivacy = AppState.getData().privacyMode;

        if (stats.monthExpenseTotal === 0 || stats.monthItemsCount === 0) {
            container.innerHTML = `
                <div class="py-8 text-center space-y-2">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-sm border border-amber-500/20">
                        <i class="fa-solid fa-stairs"></i>
                    </div>
                    <p class="text-xs text-slate-400">لا توجد مصاريف مسجلة في هذا الشهر لبناء السلّم التحليلي.</p>
                </div>
            `;
            return;
        }

        let html = '';
        ladder.forEach(step => {
            const itemsListHtml = step.items.length > 0
                ? step.items.map(it => `
                    <span class="inline-flex items-center gap-1 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/5 text-slate-300">
                        <span>${it.name}</span>
                        <strong class="text-amber-400">${isPrivacy ? '•••' : AppState.formatCurrency(it.total)}</strong>
                    </span>
                  `).join('')
                : '<span class="text-[10px] text-slate-500">لا توجد بنود في هذه الدرجة</span>';

            html += `
                <div class="glass-card p-3.5 space-y-2.5 border transition hover:border-amber-500/30">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-md" style="background:${step.bg}; color:${step.color}; border: 1px solid ${step.color}40;">
                                <i class="fa-solid ${step.icon}"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h5 class="text-xs font-black text-white">${step.title}</h5>
                                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border" style="color:${step.color}; background:${step.bg}; border-color:${step.color}40;">
                                        ${step.badge}
                                    </span>
                                </div>
                                <span class="text-[10px] text-slate-400 block mt-0.5">${step.count} معاملات مسجلة</span>
                            </div>
                        </div>

                        <div class="text-left shrink-0">
                            <span class="text-xs sm:text-sm font-black text-white">${isPrivacy ? '••••••' : AppState.formatCurrency(step.total)}</span>
                            <span class="text-[10px] font-black block" style="color:${step.color}">${step.percent}% من الشهر</span>
                        </div>
                    </div>

                    <!-- Progress Bar for this Ladder Step -->
                    <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full rounded-full transition-all duration-700" style="width: ${step.percent}%; background:${step.color};"></div>
                    </div>

                    <!-- Sample Items in this Ladder Tier -->
                    <div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                        <span class="text-[10px] text-slate-400 font-bold shrink-0">أمثلة:</span>
                        ${itemsListHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // 4. Render Daily Ladder Stepped Bar Chart (Chart.js)
    function renderLadderChart() {
        const canvas = document.getElementById('ladderDailyChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const stats = AppState.getStats();
        const dailyExpenses = stats.dailyExpenses || {};
        const sortedDays = Object.keys(dailyExpenses).sort();

        const labels = [];
        const dataValues = [];
        const backgroundColors = [];
        const borderColors = [];

        let highestDayValue = -1;
        let lowestDayValue = Infinity;

        sortedDays.forEach(dayStr => {
            const val = dailyExpenses[dayStr] || 0;
            if (val > highestDayValue) highestDayValue = val;
            if (val < lowestDayValue && val > 0) lowestDayValue = val;
        });

        const theme = AppState.getData().theme || 'gold';
        let defaultBarColor = 'rgba(250, 204, 21, 0.45)';
        let defaultBorderColor = '#facc15';

        if (theme === 'pink') {
            defaultBarColor = 'rgba(244, 114, 182, 0.5)';
            defaultBorderColor = '#f472b6';
        } else if (theme === 'lavender') {
            defaultBarColor = 'rgba(192, 132, 252, 0.5)';
            defaultBorderColor = '#c084fc';
        } else if (theme === 'ruby') {
            defaultBarColor = 'rgba(251, 113, 133, 0.5)';
            defaultBorderColor = '#fb7185';
        } else if (theme === 'emerald') {
            defaultBarColor = 'rgba(52, 211, 153, 0.5)';
            defaultBorderColor = '#34d399';
        } else if (theme === 'sapphire') {
            defaultBarColor = 'rgba(56, 189, 248, 0.5)';
            defaultBorderColor = '#38bdf8';
        } else if (theme === 'cyan') {
            defaultBarColor = 'rgba(34, 211, 238, 0.5)';
            defaultBorderColor = '#22d3ee';
        } else if (theme === 'peach') {
            defaultBarColor = 'rgba(251, 146, 60, 0.5)';
            defaultBorderColor = '#fb923c';
        }

        sortedDays.forEach(dayStr => {
            const parts = dayStr.split('-');
            const shortLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dayStr;
            labels.push(shortLabel);
            const val = dailyExpenses[dayStr];
            dataValues.push(val);

            // Highlight highest day in rose/crimson and lowest in emerald
            if (val === highestDayValue && sortedDays.length > 1) {
                backgroundColors.push('rgba(244, 63, 94, 0.85)');
                borderColors.push('#f43f5e');
            } else if (val === lowestDayValue && sortedDays.length > 1) {
                backgroundColors.push('rgba(16, 185, 129, 0.85)');
                borderColors.push('#10b981');
            } else {
                backgroundColors.push(defaultBarColor);
                borderColors.push(defaultBorderColor);
            }
        });

        if (ladderChartInstance) {
            ladderChartInstance.destroy();
        }

        const noDataEl = document.getElementById('ladderDailyEmpty');
        if (dataValues.length === 0) {
            canvas.style.display = 'none';
            if (noDataEl) noDataEl.style.display = 'block';
            return;
        } else {
            canvas.style.display = 'block';
            if (noDataEl) noDataEl.style.display = 'none';
        }

        const ctx = canvas.getContext('2d');
        ladderChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'مصروف اليوم',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 10, weight: 'bold' } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Cairo', size: 10 },
                            callback: function(val) {
                                return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        rtl: true,
                        titleFont: { family: 'Cairo', weight: 'bold' },
                        bodyFont: { family: 'Cairo' },
                        callbacks: {
                            label: function(context) {
                                return ` المصروف: ${AppState.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        updateAll: function() {
            renderDailyAnalysis();
            renderMonthlyAnalysis();
            renderExpenseLadder();
            renderLadderChart();
        },
        destroy: destroyCharts
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsEngine = AnalyticsEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
}
