function getSelectedMainRecommendations() {
  return Array.from(document.querySelectorAll(".recommend-image-option.selected")).map((option) => ({
    id: option.dataset.recommendId,
    src: option.dataset.imageSrc,
    alt: option.dataset.imageAlt
  }));
}

function createMainImage(item) {
  const image = document.createElement("div");
  image.className = "upload-thumb";
  image.dataset.imageId = item.id;
  image.innerHTML = `<img src="${item.src}" alt="${item.alt}" /><button type="button" aria-label="删除主图">×</button>`;
  return image;
}

function createDetailImage(item = {}) {
  const image = document.createElement("div");
  image.className = "detail-image";
  image.dataset.imageId = item.id || "ele-recommended-detail";
  image.innerHTML = `<img src="${item.src || "./assets/rejoice-detail-recommended.svg"}" alt="${item.alt || "饿了么推荐详情图"}" /><button type="button" aria-label="删除图片">×</button>`;
  return image;
}

function syncImageRecommendationState() {
  const mainImageCount = mainImageList.querySelectorAll(".upload-thumb").length;
  const detailImageCount = detailImageList.querySelectorAll(".detail-image").length;
  mainImageWarning.hidden = mainImageCount >= 2;
  detailImageWarning.hidden = detailImageCount > 0;

  document.querySelectorAll(".recommend-image-option").forEach((option) => {
    const isUsed = Boolean(mainImageList.querySelector(`[data-image-id="${option.dataset.recommendId}"]`));
    option.classList.toggle("used", isUsed);
  });
}

function clearMainRecommendationSelection() {
  document.querySelectorAll(".recommend-image-option.selected").forEach((option) => {
    option.classList.remove("selected");
    option.setAttribute("aria-pressed", "false");
  });
  syncImageRecommendationState();
}

function openImageReplaceConfirm(message, action) {
  imageReplaceConfirmMessage.textContent = message;
  pendingImageReplaceAction = action;
  imageReplaceConfirmModal.classList.add("open");
  imageReplaceConfirmModal.setAttribute("aria-hidden", "false");
}

function closeImageReplaceConfirm() {
  imageReplaceConfirmModal.classList.remove("open");
  imageReplaceConfirmModal.setAttribute("aria-hidden", "true");
  pendingImageReplaceAction = null;
}

document.querySelectorAll(".recommend-image-option").forEach((option) => {
  option.addEventListener("click", () => {
    const selected = option.classList.toggle("selected");
    option.setAttribute("aria-pressed", String(selected));
    syncImageRecommendationState();
  });
});

document.querySelector("#appendRecommendedMain").addEventListener("click", () => {
  const recommendations = getSelectedMainRecommendations();
  if (!recommendations.length) {
    showToast("请先选择饿了么推荐主图");
    return;
  }

  const newRecommendations = recommendations.filter((item) => !mainImageList.querySelector(`[data-image-id="${item.id}"]`));
  newRecommendations.forEach((item) => mainImageList.appendChild(createMainImage(item)));
  clearMainRecommendationSelection();
  showToast(newRecommendations.length ? `已追加 ${newRecommendations.length} 张推荐主图` : "选中的图片已在主图中");
});

document.querySelector("#replaceRecommendedMain").addEventListener("click", () => {
  const recommendations = getSelectedMainRecommendations();
  if (!recommendations.length) {
    showToast("请先选择饿了么推荐主图");
    return;
  }

  const currentCount = mainImageList.querySelectorAll(".upload-thumb").length;
  openImageReplaceConfirm(`将使用已选择的 ${recommendations.length} 张推荐图覆盖当前 ${currentCount} 张主图。`, () => {
    mainImageList.replaceChildren(...recommendations.map(createMainImage));
    clearMainRecommendationSelection();
    showToast("已覆盖现有主图");
  });
});

document.querySelector("#replaceRecommendedDetail").addEventListener("click", () => {
  const currentCount = detailImageList.querySelectorAll(".detail-image").length;
  openImageReplaceConfirm(`将使用饿了么推荐详情覆盖当前 ${currentCount} 张详情图。`, () => {
    detailImageList.querySelectorAll(".detail-image").forEach((image) => image.remove());
    detailImageList.insertBefore(createDetailImage(), detailImageList.querySelector(".large-upload"));
    syncImageRecommendationState();
    showToast("已覆盖现有详情图");
  });
});

mainImageList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".upload-thumb button");
  if (!removeButton) return;
  removeButton.closest(".upload-thumb").remove();
  syncImageRecommendationState();
});

detailImageList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".detail-image button");
  if (!removeButton) return;
  removeButton.closest(".detail-image").remove();
  syncImageRecommendationState();
});

document.querySelector("#closeImageReplaceConfirm").addEventListener("click", closeImageReplaceConfirm);
document.querySelector("#cancelImageReplaceConfirm").addEventListener("click", closeImageReplaceConfirm);
document.querySelector("#confirmImageReplace").addEventListener("click", () => {
  const action = pendingImageReplaceAction;
  closeImageReplaceConfirm();
  action?.();
});

imageReplaceConfirmModal.addEventListener("click", (event) => {
  if (event.target === imageReplaceConfirmModal) closeImageReplaceConfirm();
});

function getImageLibraryConfig(target) {
  if (target === "main") return { title: "选择主图图片库素材", subtitle: "选中后将追加到当前商品主图", assets: imageLibraryAssets.main };
  if (target === "detail") return { title: "选择详情图片库素材", subtitle: "选中后将添加到图文详情", assets: imageLibraryAssets.detail };
  const platform = target === "ele-special" ? "饿了么" : "美团";
  return { title: `选择${platform}特殊图片素材`, subtitle: "请选择包含包装或背签信息的清晰图片", assets: imageLibraryAssets.special };
}

function openImageLibrary(target) {
  const config = getImageLibraryConfig(target);
  activeImageLibraryTarget = target;
  selectedLibraryImage = null;
  document.querySelector("#imageLibraryTitle").textContent = config.title;
  document.querySelector("#imageLibrarySubtitle").textContent = config.subtitle;
  imageLibrarySelection.textContent = "请选择图片";
  imageLibraryOptions.innerHTML = config.assets.map((asset) => `
    <button class="image-library-option" type="button" data-library-image="${asset.id}" data-library-src="${asset.src}" data-library-name="${asset.name}">
      <img src="${asset.src}" alt="${asset.name}" />
      <span>${asset.name}</span>
      <i>✓</i>
    </button>
  `).join("");
  imageLibraryModal.classList.add("open");
  imageLibraryModal.setAttribute("aria-hidden", "false");
}

function closeImageLibrary() {
  imageLibraryModal.classList.remove("open");
  imageLibraryModal.setAttribute("aria-hidden", "true");
  activeImageLibraryTarget = null;
  selectedLibraryImage = null;
}

document.querySelectorAll("[data-image-library-target]").forEach((button) => {
  button.addEventListener("click", () => openImageLibrary(button.dataset.imageLibraryTarget));
});

imageLibraryOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-library-image]");
  if (!option) return;
  imageLibraryOptions.querySelectorAll(".image-library-option").forEach((item) => item.classList.toggle("selected", item === option));
  selectedLibraryImage = {
    id: option.dataset.libraryImage,
    src: option.dataset.librarySrc,
    name: option.dataset.libraryName
  };
  imageLibrarySelection.textContent = `已选择：${selectedLibraryImage.name}`;
});

document.querySelector("#confirmImageLibrary").addEventListener("click", () => {
  if (!selectedLibraryImage) {
    showToast("请先选择一张图片");
    return;
  }

  const target = activeImageLibraryTarget;
  const itemId = `library-${target}-${selectedLibraryImage.id}`;
  if (target === "main") {
    if (mainImageList.querySelector(`[data-image-id="${itemId}"]`)) {
      closeImageLibrary();
      showToast("该图片已在主图中");
      return;
    }
    mainImageList.appendChild(createMainImage({ id: itemId, src: selectedLibraryImage.src, alt: selectedLibraryImage.name }));
  } else if (target === "detail") {
    detailImageList.insertBefore(createDetailImage({ id: itemId, src: selectedLibraryImage.src, alt: selectedLibraryImage.name }), detailImageList.querySelector(".large-upload"));
  } else {
    const specialImageList = document.querySelector(`[data-special-image-list="${target}"]`);
    specialImageList.querySelectorAll(".detail-image").forEach((image) => image.remove());
    specialImageList.insertBefore(createDetailImage({ id: itemId, src: selectedLibraryImage.src, alt: selectedLibraryImage.name }), specialImageList.querySelector(".large-upload"));
  }
  closeImageLibrary();
  syncImageRecommendationState();
  showToast("已使用图片库素材");
});

document.querySelectorAll(".special-image-list").forEach((list) => {
  list.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".detail-image button");
    if (removeButton) removeButton.closest(".detail-image").remove();
  });
});

document.querySelector("#closeImageLibrary").addEventListener("click", closeImageLibrary);
document.querySelector("#cancelImageLibrary").addEventListener("click", closeImageLibrary);
imageLibraryModal.addEventListener("click", (event) => {
  if (event.target === imageLibraryModal) closeImageLibrary();
});

document.querySelector(".image-library-toolbar button").addEventListener("click", () => showToast("已按关键词筛选图片库"));

function setCategoryAttributePanelExpanded(panel, expanded) {
  panel.classList.toggle("expanded", expanded);
  panel.querySelectorAll(".attribute-extra").forEach((field) => {
    field.hidden = !expanded;
  });
  const toggle = panel.querySelector("[data-attribute-toggle]");
  if (toggle) toggle.textContent = expanded ? "收起" : "全部展开";
}

const jdIngredients = document.querySelector("#jdIngredients");
const jdNutritionToggle = document.querySelector("[data-jd-nutrition-toggle]");
jdNutritionToggle.addEventListener("click", () => {
  const expanded = jdNutritionToggle.getAttribute("aria-expanded") !== "true";
  document.querySelectorAll("[data-jd-nutrient-extra]").forEach((row) => {
    row.hidden = !expanded;
  });
  jdNutritionToggle.setAttribute("aria-expanded", String(expanded));
  jdNutritionToggle.textContent = expanded ? "收起其他营养成分 ⌃" : "展开其他营养成分 ⌄";
});

jdIngredients.addEventListener("input", () => {
  document.querySelector("[data-jd-ingredients-count]").textContent = `${jdIngredients.value.length}/300`;
});

document.querySelectorAll("[data-category-attribute-visibility]").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    panel.hidden = !panel.hidden;
    toggle.textContent = panel.hidden ? "添加类目属性" : "取消类目属性";
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
  });
});

document.querySelectorAll("[data-attribute-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const panel = toggle.closest("[data-attribute-panel]");
    setCategoryAttributePanelExpanded(panel, !panel.classList.contains("expanded"));
  });
});

document.querySelectorAll("[data-recommend-attributes]").forEach((button) => {
  button.addEventListener("click", () => showToast(`已为${button.dataset.recommendAttributes}推荐类目属性`));
});

function openProductForm(mode) {
  document.querySelector("#createProductTitle").textContent = mode === "edit" ? "编辑商品" : "创建商品";
  tongchengPage.hidden = true;
  constructionPage.hidden = true;
  pageTabs.hidden = false;
  createProductModal.classList.add("open");
  createProductModal.setAttribute("aria-hidden", "false");
  document.querySelectorAll("[data-attribute-panel]").forEach((panel) => setCategoryAttributePanelExpanded(panel, false));
  syncImageRecommendationState();
}

document.querySelector("#createProductButton").addEventListener("click", () => {
  openProductForm("create");
});

document.querySelector("#closeCreateProduct").addEventListener("click", () => {
  createProductModal.classList.remove("open");
  createProductModal.setAttribute("aria-hidden", "true");
  openTongchengProductPage(activePage, false);
});

createProductModal.addEventListener("click", (event) => {
  if (event.target === createProductModal) {
    createProductModal.classList.remove("open");
    createProductModal.setAttribute("aria-hidden", "true");
    openTongchengProductPage(activePage, false);
  }
});
