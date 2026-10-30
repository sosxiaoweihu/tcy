function renderThirdPartyOrders() {
  const activeTab = document.querySelector("[data-third-party-order-tab].active")?.dataset.thirdPartyOrderTab || "全部";
  const keyword = thirdPartyOrderSearch.value.trim().toLowerCase();
  const photoPendingCount = Array.from(document.querySelectorAll("[data-photo-review-status]"))
    .filter((reminder) => reminder.dataset.photoReviewStatus === "未提交").length;
  thirdPartyPhotoPendingCount.textContent = photoPendingCount;
  let visibleCount = 0;

  document.querySelectorAll("[data-third-party-order-card]").forEach((card) => {
    const photoReminder = card.querySelector("[data-photo-review-status]");
    const matchesStatus = activeTab === "全部"
      || (activeTab === "待返图" && photoReminder?.dataset.photoReviewStatus === "未提交")
      || card.dataset.orderStatus === activeTab;
    const matchesKeyword = !keyword || card.dataset.orderSearch.toLowerCase().includes(keyword);
    card.hidden = !(matchesStatus && matchesKeyword);
    if (!card.hidden) visibleCount += 1;
  });

  thirdPartyOrderEmpty.hidden = visibleCount !== 0;
}

function openThirdPartyOrderPage() {
  tongchengAppScreen.hidden = true;
  openRetailUnionApp.hidden = true;
  closeRetailUnionApp.hidden = true;
  openThirdPartyOrder.hidden = true;
  openImMessage.hidden = true;
  openProductRecord.hidden = true;
  thirdPartyPhotoPage.hidden = true;
  thirdPartyOrderPage.hidden = false;
  thirdPartyOrderList.scrollTop = 0;
  thirdPartyOrderSearch.value = "";
  document.querySelectorAll("[data-third-party-order-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.thirdPartyOrderTab === "全部");
  });
  renderThirdPartyOrders();
}

openThirdPartyOrder.addEventListener("click", openThirdPartyOrderPage);
thirdPartyOrderBack.addEventListener("click", () => setRetailUnionAppOpen(true));
thirdPartyOrderSearch.addEventListener("input", renderThirdPartyOrders);

document.querySelector(".third-party-order-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-third-party-order-tab]");
  if (!tab) return;
  document.querySelectorAll("[data-third-party-order-tab]").forEach((button) => {
    button.classList.toggle("active", button === tab);
  });
  renderThirdPartyOrders();
});

document.querySelector(".third-party-order-scope").addEventListener("click", (event) => {
  const button = event.target.closest("[data-third-party-scope]");
  if (button) showToast(`${button.dataset.thirdPartyScope}选择功能演示`);
});

thirdPartyOrderList.addEventListener("click", async (event) => {
  const photoButton = event.target.closest("[data-open-third-party-photo]");
  if (photoButton) {
    thirdPartyOrderPage.hidden = true;
    thirdPartyPhotoPage.hidden = false;
    renderThirdPartyPhotoProductStatuses(photoButton.textContent.trim() === "查看返图");
    selectThirdPartyPhotoProduct(document.querySelector("[data-third-party-photo-product].selected"));
    document.querySelector(".third-party-photo-main").scrollTop = 0;
    return;
  }

  const copyButton = event.target.closest("[data-copy-order]");
  if (copyButton) {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyOrder);
      showToast("订单号已复制");
    } catch (error) {
      showToast(`订单号：${copyButton.dataset.copyOrder}`);
    }
    return;
  }

  const action = event.target.closest("[data-third-party-action]");
  if (action) showToast(`${action.dataset.thirdPartyAction}功能演示`);
});

function syncThirdPartyPhotoSubmit() {
  const uploads = document.querySelectorAll(".third-party-photo-upload.uploaded").length;
  thirdPartyPhotoSubmit.disabled = uploads < 2;
}

function renderThirdPartyPhotoProductStatuses(isReviewMode) {
  document.querySelectorAll("[data-third-party-photo-product]").forEach((product) => {
    const status = isReviewMode ? product.dataset.reviewStatus : product.dataset.uploadStatus;
    const label = product.querySelector(".third-party-photo-required");
    label.textContent = status;
    label.dataset.displayStatus = status;
  });
}

function selectThirdPartyPhotoProduct(productButton) {
  document.querySelectorAll("[data-third-party-photo-product]").forEach((button) => {
    button.classList.toggle("selected", button === productButton);
  });
  const productList = productButton.closest(".third-party-photo-products");
  productList.scrollTo({
    left: productButton.offsetLeft - (productList.clientWidth - productButton.clientWidth) / 2,
    behavior: "smooth"
  });
}

function handleThirdPartyPhotoUpload(input) {
  const [file] = input.files;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    input.value = "";
    return;
  }

  const upload = input.closest(".third-party-photo-upload");
  const preview = upload.querySelector("img");
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.dataset.objectUrl = objectUrl;
  preview.hidden = false;
  upload.classList.add("uploaded");
  syncThirdPartyPhotoSubmit();
}

thirdPartyPhotoBack.addEventListener("click", () => {
  thirdPartyPhotoPage.hidden = true;
  thirdPartyOrderPage.hidden = false;
});

thirdPartyPhotoExampleToggle.addEventListener("click", () => {
  thirdPartyPhotoExamples.hidden = !thirdPartyPhotoExamples.hidden;
  thirdPartyPhotoExampleToggle.classList.toggle("collapsed", thirdPartyPhotoExamples.hidden);
});

document.querySelector(".third-party-photo-products").addEventListener("click", (event) => {
  const product = event.target.closest("[data-third-party-photo-product]");
  if (product) selectThirdPartyPhotoProduct(product);
});

[thirdPartyTracePhotoInput, thirdPartyCapPhotoInput].forEach((input) => {
  input.addEventListener("change", () => handleThirdPartyPhotoUpload(input));
});

thirdPartyPhotoNext.addEventListener("click", () => {
  const products = Array.from(document.querySelectorAll("[data-third-party-photo-product]"));
  const activeIndex = products.findIndex((button) => button.classList.contains("selected"));
  selectThirdPartyPhotoProduct(products[(activeIndex + 1) % products.length]);
  showToast("已切换到下一件商品");
});

thirdPartyPhotoSubmit.addEventListener("click", () => {
  if (thirdPartyPhotoSubmit.disabled) return;
  showToast("返图已提交");
  thirdPartyPhotoPage.hidden = true;
  thirdPartyOrderPage.hidden = false;
});
