function openProductStockoutReportPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城商品缺货报表");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  constructionPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  productStockoutReportPage.hidden = false;
  imReplyRateReportPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城商品缺货报表");
  });
}

function filterStockoutReport() {
  const filters = {
    business: stockoutBusinessFilter.value,
    order: stockoutOrderFilter.value.trim().toLowerCase(),
    refundType: stockoutRefundTypeFilter.value,
    store: stockoutStoreFilter.value,
    channel: stockoutChannelFilter.value,
    product: stockoutProductFilter.value.trim().toLowerCase(),
    reason: stockoutReasonFilter.value
  };
  let visibleCount = 0;

  stockoutReportTableBody.querySelectorAll("tr").forEach((row) => {
    const matches = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return row.dataset[key].toLowerCase().includes(value.toLowerCase());
    });
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  stockoutEmptyState.hidden = visibleCount > 0;
  stockoutResultSummary.textContent = `共 ${visibleCount} 条缺货记录`;
  stockoutPaginationTotal.textContent = `共 ${visibleCount} 条`;
}

const stockoutQuickPeriods = {
  昨天: ["2026-06-21", "2026-06-21"],
  本周: ["2026-06-22", "2026-06-28"],
  上周: ["2026-06-15", "2026-06-21"],
  本月: ["2026-06-01", "2026-06-30"],
  上月: ["2026-05-01", "2026-05-31"],
  本年: ["2026-01-01", "2026-12-31"]
};

function formatStockoutDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderStockoutCalendar() {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const months = [0, 1].map((offset) => {
    const monthDate = new Date(stockoutCalendarMonth.getFullYear(), stockoutCalendarMonth.getMonth() + offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const leadingDays = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayButtons = [];

    for (let index = 0; index < leadingDays; index += 1) {
      dayButtons.push('<button class="outside" type="button" disabled></button>');
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = formatStockoutDate(new Date(year, month, day));
      const classes = [];
      if (pendingStockoutRangeStart && pendingStockoutRangeEnd && dateKey > pendingStockoutRangeStart && dateKey < pendingStockoutRangeEnd) {
        classes.push("in-range");
      }
      if (dateKey === pendingStockoutRangeStart) classes.push("range-start");
      if (dateKey === pendingStockoutRangeEnd) classes.push("range-end");
      dayButtons.push(`<button class="${classes.join(" ")}" type="button" data-stockout-calendar-day="${dateKey}">${day}</button>`);
    }
    while (dayButtons.length < 42) {
      dayButtons.push('<button class="outside" type="button" disabled></button>');
    }

    return `
      <section class="stockout-calendar-month">
        <h3>${year}年 ${month + 1}月</h3>
        <div class="stockout-calendar-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
        <div class="stockout-calendar-days">${dayButtons.join("")}</div>
      </section>
    `;
  });

  stockoutCalendarMonths.innerHTML = months.join("");
  stockoutCalendarSelection.textContent = pendingStockoutRangeEnd
    ? `${pendingStockoutRangeStart} 至 ${pendingStockoutRangeEnd}`
    : `${pendingStockoutRangeStart} 至 请选择结束日期`;
}

function closeStockoutCalendar() {
  stockoutCalendarPopover.hidden = true;
  stockoutDateRangeButton.setAttribute("aria-expanded", "false");
}

function openStockoutCalendar() {
  stockoutPeriodFilter.value = "自定义";
  pendingStockoutRangeStart = stockoutRangeStart;
  pendingStockoutRangeEnd = stockoutRangeEnd;
  renderStockoutCalendar();
  stockoutCalendarPopover.hidden = false;
  stockoutDateRangeButton.setAttribute("aria-expanded", "true");
}

function setStockoutQuickPeriod(period) {
  const range = stockoutQuickPeriods[period];
  if (!range) return;
  stockoutRangeStart = range[0];
  stockoutRangeEnd = range[1];
  stockoutDateRangeText.textContent = `${stockoutRangeStart} - ${stockoutRangeEnd}`;
  closeStockoutCalendar();
}

stockoutPeriodFilter.addEventListener("change", () => {
  if (stockoutPeriodFilter.value === "自定义") {
    openStockoutCalendar();
    return;
  }
  setStockoutQuickPeriod(stockoutPeriodFilter.value);
});
stockoutDateRangeButton.addEventListener("click", openStockoutCalendar);
stockoutCalendarMonths.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-stockout-calendar-day]");
  if (!dayButton) return;
  const selectedDate = dayButton.dataset.stockoutCalendarDay;
  if (pendingStockoutRangeStart && !pendingStockoutRangeEnd) {
    pendingStockoutRangeEnd = selectedDate;
    if (pendingStockoutRangeEnd < pendingStockoutRangeStart) {
      [pendingStockoutRangeStart, pendingStockoutRangeEnd] = [pendingStockoutRangeEnd, pendingStockoutRangeStart];
    }
  } else {
    pendingStockoutRangeStart = selectedDate;
    pendingStockoutRangeEnd = "";
  }
  renderStockoutCalendar();
});
document.querySelector("#stockoutCalendarPrev").addEventListener("click", () => {
  stockoutCalendarMonth = new Date(stockoutCalendarMonth.getFullYear(), stockoutCalendarMonth.getMonth() - 1, 1);
  renderStockoutCalendar();
});
document.querySelector("#stockoutCalendarNext").addEventListener("click", () => {
  stockoutCalendarMonth = new Date(stockoutCalendarMonth.getFullYear(), stockoutCalendarMonth.getMonth() + 1, 1);
  renderStockoutCalendar();
});
document.querySelector("#stockoutCalendarCancel").addEventListener("click", closeStockoutCalendar);
document.querySelector("#stockoutCalendarConfirm").addEventListener("click", () => {
  if (!pendingStockoutRangeEnd) {
    showToast("请选择结束日期");
    return;
  }
  stockoutRangeStart = pendingStockoutRangeStart;
  stockoutRangeEnd = pendingStockoutRangeEnd;
  stockoutDateRangeText.textContent = `${stockoutRangeStart} - ${stockoutRangeEnd}`;
  closeStockoutCalendar();
});
stockoutFilterToggle.addEventListener("click", () => {
  const filters = stockoutFilterToggle.closest(".stockout-report-filters");
  const isCollapsed = filters.classList.toggle("collapsed");
  stockoutFilterToggle.innerHTML = isCollapsed ? "<span>展开</span><i>⌄</i>" : "<span>收起</span><i>⌃</i>";
  stockoutFilterToggle.setAttribute("aria-label", isCollapsed ? "展开筛选" : "收起筛选");
  if (isCollapsed) closeStockoutCalendar();
});

document.querySelector("#stockoutSearchButton").addEventListener("click", filterStockoutReport);
document.querySelector("#stockoutResetButton").addEventListener("click", () => {
  stockoutBusinessFilter.value = "便利店";
  stockoutOrderFilter.value = "";
  stockoutRefundTypeFilter.value = "";
  stockoutStoreFilter.value = "";
  stockoutChannelFilter.value = "";
  stockoutProductFilter.value = "";
  stockoutReasonFilter.value = "";
  stockoutPeriodFilter.value = "昨天";
  setStockoutQuickPeriod("昨天");
  stockoutReportTableBody.querySelectorAll("tr").forEach((row) => {
    row.hidden = false;
  });
  stockoutEmptyState.hidden = true;
  stockoutResultSummary.textContent = "共 238 条缺货记录";
  stockoutPaginationTotal.textContent = "共 238 条";
});
document.querySelector("#stockoutExportButton").addEventListener("click", () => {
  showToast("缺货报表导出任务已创建");
});
