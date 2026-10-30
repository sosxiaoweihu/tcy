function closeLocalStoreModal() {
  localStoreModal.classList.remove("open");
  localStoreModal.setAttribute("aria-hidden", "true");
}

function syncLocalStoreValidateButton() {
  const selectedChannel = document.querySelector("input[name='localStoreChannel']:checked")?.value;
  document.querySelector("#validateLocalStoreButton").hidden = selectedChannel !== "支付宝";
}

document.querySelector("#openLocalStoreModal").addEventListener("click", () => {
  syncLocalStoreValidateButton();
  localStoreModal.classList.add("open");
  localStoreModal.setAttribute("aria-hidden", "false");
});

document.querySelector("#closeLocalStoreModal").addEventListener("click", closeLocalStoreModal);
document.querySelector("#cancelLocalStoreModal").addEventListener("click", closeLocalStoreModal);
document.querySelector("#confirmLocalStoreModal").addEventListener("click", () => {
  closeLocalStoreModal();
  showToast("已新增门店");
});

document.querySelectorAll("input[name='localStoreChannel']").forEach((input) => {
  input.addEventListener("change", syncLocalStoreValidateButton);
});

document.querySelector("#validateLocalStoreButton").addEventListener("click", () => {
  showToast("门店校验完成");
});

document.querySelectorAll("input[name='localLifeShop']").forEach((input) => {
  input.addEventListener("change", syncLocalLifeShopDetail);
});

localStoreModal.addEventListener("click", (event) => {
  if (event.target === localStoreModal) {
    closeLocalStoreModal();
  }
});

document.querySelector("#closeVerifyDetailModal").addEventListener("click", closeVerifyDetailModal);

verifyDetailModal.addEventListener("click", (event) => {
  if (event.target === verifyDetailModal) {
    closeVerifyDetailModal();
  }
});

document.querySelector("#closeAfterSaleModal").addEventListener("click", closeAfterSaleModal);
document.querySelector("#cancelAfterSaleModal").addEventListener("click", closeAfterSaleModal);
document.querySelector("#submitAfterSaleModal").addEventListener("click", () => {
  closeAfterSaleModal();
  showToast("售后已提交");
});

afterSaleModal.addEventListener("click", (event) => {
  if (event.target === afterSaleModal) {
    closeAfterSaleModal();
  }
});

function showCouponRuleCreate(show) {
  document.querySelector("#couponRuleList").hidden = show;
  document.querySelector("#couponRuleCreate").hidden = !show;
}

document.querySelector("#openCouponRuleCreate").addEventListener("click", () => {
  syncCouponProductButton();
  showCouponRuleCreate(true);
});

document.querySelector("#cancelCouponRuleCreate").addEventListener("click", () => {
  showCouponRuleCreate(false);
});

document.querySelector("#confirmCouponRuleCreate").addEventListener("click", () => {
  showCouponRuleCreate(false);
  showToast("已保存同城券规则");
});

function syncCouponProductButton() {
  const selectedChannel = document.querySelector("input[name='couponChannel']:checked")?.value;
  document.querySelector("#checkCouponProductButton").hidden = selectedChannel !== "支付宝";
  document.querySelector("#couponPromotionPriceRow").hidden = selectedChannel !== "抖音";
  document.querySelector("#couponDiscountLimitRow").hidden = !["抖音", "美团"].includes(selectedChannel);
}

document.querySelectorAll("input[name='couponChannel']").forEach((input) => {
  input.addEventListener("change", syncCouponProductButton);
});

document.querySelector("#checkCouponProductButton").addEventListener("click", () => {
  showToast("商品检查完成");
});


// 品类数据用于原型展示；父级勾选联动其全部末级品类。
(() => {
  const groups = [
    ["水果鲜花", [["草莓/蓝莓", ["草莓", "蓝莓", "车厘子"]], ["葡提/猕猴桃", ["葡萄", "提子", "猕猴桃"]], ["西梅/桃李枣", ["西梅", "桃", "李", "枣"]], ["柑橘橙柚柠", ["柑橘", "橙", "柚", "柠檬"]], ["榴莲/热带", ["榴莲", "芒果"]], ["苹果梨蕉", ["苹果", "梨", "香蕉"]]]],
    ["蔬菜豆制品", [["新鲜蔬菜", ["叶菜", "根茎菜"]], ["豆制品", ["豆腐", "豆干"]]]],
    ["肉禽蛋品", [["鲜肉", ["猪肉", "牛肉"]], ["禽蛋", ["鸡肉", "鸡蛋"]]]],
    ["海鲜水产", [["鲜活水产", ["鱼", "虾", "蟹"]]]],
    ["乳品烘焙", [["乳品", ["牛奶", "酸奶"]], ["烘焙", ["面包", "蛋糕"]]]],
    ["餐饮熟食", [["熟食", ["卤味", "凉菜"]]]]
  ];
  const tree = groups.map(([name, children], i) => ({ name, children: children.map(([name, leaves], j) => ({ name, children: leaves.map((name, k) => ({ name, id: `${i}-${j}-${k}` })) })) }));
  const selected = new Set();
  let activeGroup = 0, activeSubgroup = 0;
  const picker = document.querySelector("#couponExcludeCategoryPicker");
  const trigger = document.querySelector("#couponExcludeCategoryTrigger");
  const panel = document.querySelector("#couponExcludeCategoryPanel");
  const text = document.querySelector("#couponExcludeCategoryText");
  const leaves = node => node.children ? node.children.flatMap(leaves) : [node];
  function close() { panel.hidden = true; trigger.setAttribute("aria-expanded", "false"); }
  function render() {
    panel.replaceChildren();
    const levels = [tree, tree[activeGroup].children, tree[activeGroup].children[activeSubgroup].children];
    levels.forEach((nodes, level) => {
      const column = document.createElement("div");
      column.className = "coupon-category-column";
      nodes.forEach((node, index) => {
        const row = document.createElement("div");
        row.className = "coupon-category-option";
        if ((level === 0 && index === activeGroup) || (level === 1 && index === activeSubgroup)) row.classList.add("active");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("aria-label", node.name);
        const items = leaves(node);
        checkbox.checked = items.every(item => selected.has(item.id));
        checkbox.indeterminate = !checkbox.checked && items.some(item => selected.has(item.id));
        checkbox.addEventListener("change", () => {
          items.forEach(item => checkbox.checked ? selected.add(item.id) : selected.delete(item.id));
          render();
          const replacement = panel.children[level].children[index].querySelector("input");
          replacement.focus();
        });
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = node.name;
        if (node.children) {
          const arrow = document.createElement("span");
          arrow.textContent = "›";
          button.append(arrow);
        }
        button.addEventListener("click", () => {
          if (level === 0) { activeGroup = index; activeSubgroup = 0; render(); }
          else if (level === 1) { activeSubgroup = index; render(); }
          else checkbox.click();
        });
        row.append(checkbox, button);
        column.append(row);
      });
      panel.append(column);
    });
    const names = tree.flatMap(leaves).filter(item => selected.has(item.id)).map(item => item.name);
    text.textContent = names.length ? names.join("、") : "请选择";
    trigger.classList.toggle("has-selection", names.length > 0);
  }
  trigger.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    trigger.setAttribute("aria-expanded", String(!panel.hidden));
  });
  document.addEventListener("click", event => { if (!event.composedPath().includes(picker)) close(); });
  picker.addEventListener("keydown", event => { if (event.key === "Escape") { close(); trigger.focus(); } });
  function syncProductSettings() {
    const join = document.querySelector("input[name='joinProduct']:checked")?.value;
    const exclude = document.querySelector("input[name='excludeProduct']:checked")?.value;
    document.querySelector("#couponJoinProductRow").hidden = join !== "product";
    document.querySelector("#couponJoinCategoryRow").hidden = join !== "category";
    document.querySelector("#couponJoinBrandRow").hidden = join !== "brand";
    document.querySelector("#couponExcludeOptionsRow").hidden = join === "product";
    document.querySelector("#couponExcludeProductRow").hidden = join === "product" || exclude !== "product";
    document.querySelector("#couponExcludeCategoryRow").hidden = join === "product" || exclude !== "category";
    close();
  }
  document.querySelectorAll("input[name='joinProduct'], input[name='excludeProduct']").forEach(input => {
    input.addEventListener("change", syncProductSettings);
  });
  syncProductSettings();
  render();
})();
