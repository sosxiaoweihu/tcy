let customTaskSelectedStores = [];

function closeCustomTaskStoreDropdown() {
  customTaskStoreDropdown.hidden = true;
  customTaskStoreControl.setAttribute("aria-expanded", "false");
}

function updateCustomTaskStoreControl() {
  customTaskStoreValue.innerHTML = "";
  customTaskStoreValue.className = customTaskSelectedStores.length ? "" : "custom-task-store-placeholder";

  if (!customTaskSelectedStores.length) {
    customTaskStoreValue.textContent = "不选默认全部门店";
  } else {
    const tag = document.createElement("span");
    tag.className = "custom-task-store-tag";
    tag.textContent = customTaskSelectedStores[0];

    const remove = document.createElement("i");
    remove.dataset.removeStore = customTaskSelectedStores[0];
    remove.textContent = "×";
    tag.appendChild(remove);
    customTaskStoreValue.appendChild(tag);

    if (customTaskSelectedStores.length > 1) {
      const summary = document.createElement("span");
      summary.className = "custom-task-store-summary";
      summary.textContent = `+${customTaskSelectedStores.length - 1}`;
      customTaskStoreValue.appendChild(summary);
    }
  }

  customTaskStoreOptions.forEach((option) => {
    option.classList.toggle("active", customTaskSelectedStores.includes(option.dataset.storeName));
  });
  customTaskStoreSelectAll.checked = customTaskSelectedStores.length === customTaskStoreOptions.length;
  customTaskStoreSelectAll.indeterminate = customTaskSelectedStores.length > 0 && customTaskSelectedStores.length < customTaskStoreOptions.length;
}

function openCustomTaskCreateView() {
  customTaskLayout.hidden = true;
  customTaskCreateView.hidden = false;
  closeCustomTaskStoreDropdown();
  customTaskCreateName.focus();
}

function openCustomTaskListView() {
  customTaskCreateView.hidden = true;
  customTaskLayout.hidden = false;
  closeCustomTaskStoreDropdown();
}

function openCustomTaskPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城自定义任务");
  leaveTongchengAppPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  customTaskPage.hidden = false;
  openCustomTaskListView();
  tongchengPage.hidden = true;
  constructionPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  productStockoutReportPage.hidden = true;
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
    button.classList.toggle("active", button.dataset.page === "同城自定义任务");
  });
}

function filterCustomTasks() {
  const filters = {
    name: customTaskNameFilter.value.trim().toLowerCase(),
    status: customTaskStatusFilter.value,
    cycle: customTaskCycleFilter.value
  };
  let visibleCount = 0;

  customTaskTableBody.querySelectorAll("tr").forEach((row) => {
    const matches = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return row.dataset[key].toLowerCase().includes(value.toLowerCase());
    });
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  customTaskEmptyState.hidden = visibleCount > 0;
  customTaskResultSummary.textContent = `共 ${visibleCount} 条任务`;
  customTaskPaginationTotal.textContent = `共 ${visibleCount} 条，${visibleCount > 0 ? "1/1" : "0/0"} 页`;
  showToast(`已查询到 ${visibleCount} 条任务`);
}

function resetCustomTaskFilters() {
  customTaskNameFilter.value = "";
  customTaskStatusFilter.value = "";
  customTaskCycleFilter.value = "";
  customTaskTableBody.querySelectorAll("tr").forEach((row) => {
    row.hidden = false;
  });
  customTaskEmptyState.hidden = true;
  customTaskResultSummary.textContent = "共 6 条任务";
  customTaskPaginationTotal.textContent = "共 6 条，1/1 页";
  showToast("已重置筛选条件");
}

customTaskFilterToggle.addEventListener("click", () => {
  const isCompact = customTaskFilterGrid.classList.toggle("compact");
  customTaskFilterToggle.textContent = isCompact ? "展开" : "收起";
  customTaskFilterToggle.setAttribute("aria-label", isCompact ? "展开筛选" : "收起筛选");
});

document.querySelector("#customTaskSearchButton").addEventListener("click", filterCustomTasks);
document.querySelector("#customTaskResetButton").addEventListener("click", resetCustomTaskFilters);
document.querySelector("#customTaskCreateButton").addEventListener("click", () => {
  openCustomTaskCreateView();
});
customTaskBackButton.addEventListener("click", openCustomTaskListView);
customTaskConfirmButton.addEventListener("click", () => {
  showToast("自定义任务已保存");
  openCustomTaskListView();
});
customTaskCreateName.addEventListener("input", () => {
  customTaskNameCount.textContent = `${customTaskCreateName.value.length} / 20`;
});
customTaskStoreControl.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-store]");
  if (removeButton) {
    customTaskSelectedStores = customTaskSelectedStores.filter((store) => store !== removeButton.dataset.removeStore);
    updateCustomTaskStoreControl();
    event.stopPropagation();
    return;
  }
  const isOpening = customTaskStoreDropdown.hidden;
  customTaskStoreDropdown.hidden = !isOpening;
  customTaskStoreControl.setAttribute("aria-expanded", String(isOpening));
});
customTaskStoreDropdown.addEventListener("click", (event) => {
  const option = event.target.closest("[data-store-name]");
  if (!option) return;
  const storeName = option.dataset.storeName;
  if (customTaskSelectedStores.includes(storeName)) {
    customTaskSelectedStores = customTaskSelectedStores.filter((store) => store !== storeName);
  } else {
    customTaskSelectedStores = [...customTaskSelectedStores, storeName];
  }
  updateCustomTaskStoreControl();
});
customTaskStoreSelectAll.addEventListener("change", () => {
  customTaskSelectedStores = customTaskStoreSelectAll.checked
    ? customTaskStoreOptions.map((option) => option.dataset.storeName)
    : [];
  updateCustomTaskStoreControl();
});
document.addEventListener("click", (event) => {
  if (!customTaskStorePicker.contains(event.target)) {
    closeCustomTaskStoreDropdown();
  }
});
document.querySelectorAll("input[name='customTaskBusiness']").forEach((input) => {
  input.addEventListener("change", () => showToast(`已切换业态：${input.value}`));
});
document.querySelectorAll(".custom-task-date").forEach((button) => {
  button.addEventListener("click", () => showToast("请选择时间范围"));
});
customTaskSubnav.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-custom-task-tab]");
  if (!tab) return;
  customTaskSubnav.querySelectorAll("[data-custom-task-tab]").forEach((button) => {
    button.classList.toggle("active", button === tab);
  });
  if (tab.dataset.customTaskTab === "price") {
    showToast("调价任务内容待补充");
  }
});
customTaskTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-custom-task-action]");
  if (!button) return;
  const row = button.closest("tr");
  const taskName = row.children[1].textContent.trim();
  showToast(`${button.dataset.customTaskAction}：${taskName}`);
});
