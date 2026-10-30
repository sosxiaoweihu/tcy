document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    document.querySelector("#moreMenu").classList.remove("open");
  }
  if (!event.target.closest(".category-field")) {
    categoryPanel.classList.remove("open");
  }
  if (!event.target.closest("#tongchengMenu") && !event.target.closest("[data-nav='同城']")) {
    tongchengMenu.hidden = true;
  }
  if (!event.target.closest("#interfaceMenu") && !event.target.closest("[data-nav='接口']")) {
    interfaceMenu.hidden = true;
  }
});

document.querySelectorAll("input[name='business']").forEach((input) => {
  input.addEventListener("change", () => showToast(`已切换业态：${input.value}`));
});

renderCategories();
renderTable();
syncVerifyActions();
syncLocalLifeShopDetail();
renderUnifiedCategoryTree();
enableColumnResize();
document.querySelector(".main").appendChild(createProductModal);
openTongchengProductPage("同城商品管理(统一分类)", false);
renderPageTabs();
setMapZoom(1);
