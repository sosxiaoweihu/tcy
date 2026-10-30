document.querySelector("#expandButton").addEventListener("click", () => {
  const grid = document.querySelector("#filterGrid");
  const isCompact = grid.classList.toggle("compact");
  document.querySelector("#expandButton").textContent = isCompact ? "展开" : "收起";
});

document.querySelector("#queryButton").addEventListener("click", () => {
  showToast("已按当前条件查询");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  document.querySelectorAll(".filter-card input").forEach((input) => {
    if (input.type !== "checkbox") input.value = "";
  });
  categoryTrigger.textContent = "请选择";
  categoryTrigger.style.color = "var(--color-text-placeholder)";
  showToast("已重置筛选条件");
});

document.querySelector("#standardProductQueryButton").addEventListener("click", () => {
  showToast("已按当前条件查询同城商品");
});

document.querySelector("#standardProductResetButton").addEventListener("click", () => {
  document.querySelectorAll("#standardProductFilterGrid input").forEach((input) => {
    input.value = "";
  });
  document.querySelectorAll("#standardProductFilterGrid select").forEach((select) => {
    select.selectedIndex = 0;
  });
  showToast("已重置同城商品筛选条件");
});

document.querySelector("#standardProductFilterToggle").addEventListener("click", (event) => {
  const grid = document.querySelector("#standardProductFilterGrid");
  const collapsed = grid.classList.toggle("collapsed");
  event.currentTarget.textContent = collapsed ? "⌄" : "⌃";
  event.currentTarget.setAttribute("aria-label", collapsed ? "展开筛选" : "收起筛选");
  event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
});

document.querySelectorAll("[data-filter-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.closest(".verify-filters, .product-detail-filters");
    if (!filter) return;
    const collapsed = filter.classList.toggle("collapsed");
    button.textContent = collapsed ? "⌄" : "⌃";
    button.setAttribute("aria-label", collapsed ? "展开筛选" : "收起筛选");
  });
});

localLifeVerifyPage.addEventListener("click", (event) => {
  const detailLink = event.target.closest("[data-verify-detail]");
  if (detailLink && !detailLink.hidden) {
    openVerifyDetailModal();
    return;
  }

  const afterSaleLink = event.target.closest("[data-after-sale]");
  if (!afterSaleLink || afterSaleLink.hidden) return;
  const row = afterSaleLink.closest("tr");
  openAfterSaleModal(row);
});
