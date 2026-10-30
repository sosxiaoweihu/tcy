document.querySelector("#productTabs").addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  activeTab = target.dataset.tab;
  document.querySelectorAll("#productTabs button").forEach((button) => button.classList.toggle("active", button === target));
  renderTable();
});

document.querySelector("#moreButton").addEventListener("click", () => {
  document.querySelector("#moreMenu").classList.toggle("open");
});

document.querySelector("#moreMenu").addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  document.querySelector("#moreMenu").classList.remove("open");
  if (target.dataset.action === "batch-upload-special-image") {
    openBatchSpecialImageModal();
    return;
  }
  showToast(`已选择：${target.textContent}`);
});

categoryTrigger.addEventListener("click", () => {
  categoryPanel.classList.toggle("open");
});

document.querySelector("#levelOne").addEventListener("click", (event) => {
  const target = event.target.closest("[data-level-one]");
  if (!target) return;
  activeCategory = target.dataset.levelOne;
  renderCategories();
});

document.querySelector("#levelTwo").addEventListener("change", () => {
  const checked = [...document.querySelectorAll("[data-level-two]:checked")].map((item) => `${activeCategory} / ${item.dataset.levelTwo}`);
  categoryTrigger.textContent = checked.length ? checked.join("、") : "请选择";
  categoryTrigger.style.color = checked.length ? "var(--color-text-primary)" : "var(--color-text-placeholder)";
});

tableBody.addEventListener("click", (event) => {
  const publishButton = event.target.closest("[data-publish-channel]");
  if (publishButton) {
    selectedCode = publishButton.dataset.publishChannel;
    renderTable();
    openPublishChannelModal();
    return;
  }

  const editButton = event.target.closest("[data-edit-product]");
  if (editButton) {
    selectedCode = editButton.dataset.editProduct;
    renderTable();
    openProductForm("edit");
    return;
  }

  const row = event.target.closest("[data-row]");
  if (row) {
    selectedCode = row.dataset.row;
    renderTable();
  }

  const exceptionButton = event.target.closest("[data-exception]");
  if (exceptionButton) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  const actionButton = event.target.closest(".row-actions button, .status");
  if (actionButton) {
    showToast(`已点击：${actionButton.textContent}`);
  }
});

standardProductTableBody.addEventListener("click", (event) => {
  const exceptionButton = event.target.closest("[data-standard-exception]");
  if (exceptionButton) {
    selectedCode = exceptionButton.dataset.standardException;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    return;
  }

  const actionButton = event.target.closest("[data-standard-action]");
  if (actionButton) {
    selectedCode = actionButton.dataset.standardCode;
    if (actionButton.dataset.standardAction === "编辑") {
      openProductForm("edit");
    } else {
      showToast(`已点击：${actionButton.dataset.standardAction}`);
    }
  }
});

function closePublishChannelModal() {
  publishChannelModal.classList.remove("open");
  publishChannelModal.setAttribute("aria-hidden", "true");
}

function resetBatchSpecialImageFile() {
  batchSpecialImageFileInput.value = "";
  batchSpecialImageFileName.textContent = "";
  batchSpecialImageFileName.hidden = true;
}

const batchSpecialImageTabs = [...batchSpecialImageModal.querySelectorAll("[data-special-image-tab]")];
const batchSpecialImageExcelInput = document.querySelector("#batchSpecialImageExcelInput");
const batchSpecialImageExcelFileName = document.querySelector("#batchSpecialImageExcelFileName");
const batchSpecialImageUploadChannels = [...batchSpecialImageModal.querySelectorAll("input[name='batchSpecialImageReferenceChannel']")];
const batchSpecialImageCopyChannels = [...batchSpecialImageModal.querySelectorAll("input[name='batchSpecialImageCopyChannel']")];
const batchSpecialImageCopyField = document.querySelector("#batchSpecialImageCopyField");

function updateBatchSpecialImageCopyChannels() {
  const uploadChannel = batchSpecialImageUploadChannels.find((input) => input.checked)?.value;
  batchSpecialImageCopyField.hidden = !uploadChannel;
  batchSpecialImageCopyChannels.forEach((input) => {
    const excluded = !uploadChannel || input.value === uploadChannel;
    input.disabled = excluded;
    input.closest("label").hidden = excluded;
    if (excluded) input.checked = false;
  });
}


function setBatchSpecialImageTab(mode) {
  batchSpecialImageModal.dataset.uploadMode = mode;
  batchSpecialImageTabs.forEach((tab) => {
    const selected = tab.dataset.specialImageTab === mode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
  });
  batchSpecialImageModal.querySelector(".batch-special-image-body").scrollTop = 0;
}

function resetBatchSpecialImageExcelFile() {
  batchSpecialImageExcelInput.value = "";
  batchSpecialImageExcelFileName.textContent = "";
  batchSpecialImageExcelFileName.hidden = true;
}

function openBatchSpecialImageModal() {
  resetBatchSpecialImageFile();
  resetBatchSpecialImageExcelFile();
  setBatchSpecialImageTab("zip");
  [...batchSpecialImageUploadChannels, ...batchSpecialImageCopyChannels].forEach((input) => { input.checked = false; });
  updateBatchSpecialImageCopyChannels();
  document.querySelector("input[name='batchSpecialImageChannel'][value='meituan']").checked = true;
  batchSpecialImageModal.classList.add("open");
  batchSpecialImageModal.setAttribute("aria-hidden", "false");
}

function closeBatchSpecialImageModal() {
  batchSpecialImageModal.classList.remove("open");
  batchSpecialImageModal.setAttribute("aria-hidden", "true");
}

function updatePublishStoreSettings() {
  const mode = document.querySelector("input[name='publishStoreSync']:checked")?.value;
  publishStoreDefaultInfo.hidden = mode !== "store";
  publishStoreSettings.hidden = mode !== "custom";
}

function openPublishChannelModal() {
  const product = products.find((item) => item.code === selectedCode);
  publishProductCode.textContent = product?.code || "-";
  publishProductName.textContent = product?.name || "-";
  publishChannelModal.classList.add("open");
  publishChannelModal.setAttribute("aria-hidden", "false");
  updatePublishStoreSettings();
}

document.querySelector("#closeModal").addEventListener("click", () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
});

document.querySelector("#handleException").addEventListener("click", () => {
  showToast("已模拟进入异常处理流程");
});

document.querySelector("#closePublishChannelModal").addEventListener("click", closePublishChannelModal);
document.querySelector("#cancelPublishChannelModal").addEventListener("click", closePublishChannelModal);
document.querySelector("#confirmPublishChannelModal").addEventListener("click", () => {
  closePublishChannelModal();
  showToast("已确认发品到渠道");
});
publishChannelModal.addEventListener("click", (event) => {
  if (event.target === publishChannelModal) closePublishChannelModal();
});
document.querySelectorAll("input[name='publishStoreSync']").forEach((input) => {
  input.addEventListener("change", updatePublishStoreSettings);
});
publishChannelAll.addEventListener("change", () => {
  document.querySelectorAll("input[name='publishChannel']").forEach((input) => {
    input.checked = publishChannelAll.checked;
  });
});
document.querySelectorAll("input[name='publishChannel']").forEach((input) => {
  input.addEventListener("change", () => {
    const channels = [...document.querySelectorAll("input[name='publishChannel']")];
    publishChannelAll.checked = channels.every((item) => item.checked);
  });
});

batchSpecialImageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setBatchSpecialImageTab(tab.dataset.specialImageTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? batchSpecialImageTabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + batchSpecialImageTabs.length) % batchSpecialImageTabs.length;
    const nextTab = batchSpecialImageTabs[nextIndex];
    setBatchSpecialImageTab(nextTab.dataset.specialImageTab);
    nextTab.focus();
  });
});
batchSpecialImageUploadChannels.forEach((input) => {
  input.addEventListener("change", updateBatchSpecialImageCopyChannels);
});

document.querySelector("#batchSpecialImageExcelButton").addEventListener("click", () => batchSpecialImageExcelInput.click());
batchSpecialImageExcelInput.addEventListener("change", () => {
  const file = batchSpecialImageExcelInput.files[0];
  if (!file) {
    resetBatchSpecialImageExcelFile();
    return;
  }
  if (!/\.(xls|xlsx)$/i.test(file.name)) {
    resetBatchSpecialImageExcelFile();
    showToast("仅支持导入Excel文件（.xls、.xlsx）");
    return;
  }
  batchSpecialImageExcelFileName.textContent = file.name;
  batchSpecialImageExcelFileName.hidden = false;
});

document.querySelector("#closeBatchSpecialImageModal").addEventListener("click", closeBatchSpecialImageModal);
document.querySelector("#cancelBatchSpecialImageModal").addEventListener("click", closeBatchSpecialImageModal);
batchSpecialImageModal.addEventListener("click", (event) => {
  if (event.target === batchSpecialImageModal) closeBatchSpecialImageModal();
});
batchSpecialImageUploadButton.addEventListener("click", () => batchSpecialImageFileInput.click());
batchSpecialImageFileInput.addEventListener("change", () => {
  const file = batchSpecialImageFileInput.files[0];
  if (!file) {
    resetBatchSpecialImageFile();
    return;
  }
  if (!/\.zip$/i.test(file.name)) {
    resetBatchSpecialImageFile();
    showToast("仅支持上传ZIP格式文件");
    return;
  }
  if (file.size > 100 * 1024 * 1024) {
    resetBatchSpecialImageFile();
    showToast("ZIP文件总大小不能超过100M");
    return;
  }
  batchSpecialImageFileName.textContent = file.name;
  batchSpecialImageFileName.hidden = false;
});
document.querySelector("#confirmBatchSpecialImageModal").addEventListener("click", () => {
  if (batchSpecialImageModal.dataset.uploadMode === "reference") {
    if (!batchSpecialImageExcelInput.files.length) {
      showToast("请先导入商品Excel文件");
      return;
    }
    const channel = batchSpecialImageModal.querySelector("input[name='batchSpecialImageReferenceChannel']:checked");
    if (!channel) {
      showToast("请选择上传渠道");
      return;
    }
    const copyChannel = batchSpecialImageCopyChannels.find((input) => input.checked && !input.disabled);
    if (!copyChannel || copyChannel.value === channel.value) {
      showToast("请选择与上传渠道不同的复制渠道");
      return;
    }
    closeBatchSpecialImageModal();
    showToast(`已模拟提交：上传渠道为${channel.parentElement.textContent.trim()}，复制渠道为${copyChannel.parentElement.textContent.trim()}`);
    return;
  }
  if (!batchSpecialImageFileInput.files.length) {
    showToast("请先选择ZIP文件");
    return;
  }
  closeBatchSpecialImageModal();
  showToast("批量特殊图片上传任务已提交");
});
