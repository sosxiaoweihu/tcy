const backendCategoryData = [
  {
    id: "all-categories",
    code: "0",
    name: "全部",
    children: [
      {
        id: "fresh-department",
        code: "1",
        name: "生鲜处",
        children: [
          {
            id: "fresh-daily-department",
            code: "11",
            name: "生鲜日配部",
            children: [
              {
                id: "fruit-category",
                code: "111",
                name: "水果类",
                children: [
                  {
                    id: "fresh-fruit",
                    code: "1111",
                    name: "实果",
                    children: [
                      { id: "melon-fruit", code: "11111", name: "瓜果" },
                      { id: "berry-fruit", code: "11112", name: "浆果" },
                      { id: "tropical-fruit", code: "11113", name: "热带水果" },
                      { id: "citrus-fruit", code: "11114", name: "柑橘" },
                      { id: "stone-fruit", code: "11115", name: "核果" },
                      { id: "other-fruit", code: "11116", name: "其他水果" }
                    ]
                  },
                  { id: "fruit-gift-basket", code: "1112", name: "礼盒/果篮" },
                  { id: "fruit-consumables", code: "1113", name: "水果耗材" },
                  { id: "joint-fruit", code: "1114", name: "联营水果" }
                ]
              },
              { id: "vegetable-category", code: "112", name: "蔬菜类", children: [
                { id: "leafy-vegetables", code: "1121", name: "叶菜类" },
                { id: "root-vegetables", code: "1122", name: "根茎类" }
              ] },
              { id: "meat-category", code: "113", name: "肉品类", children: [
                { id: "fresh-pork", code: "1131", name: "鲜猪肉" },
                { id: "fresh-beef-mutton", code: "1132", name: "鲜牛羊肉" }
              ] },
              { id: "poultry-category", code: "114", name: "家禽类", children: [
                { id: "fresh-poultry", code: "1141", name: "鲜禽" }
              ] },
              { id: "aquatic-category", code: "115", name: "水产类", children: [
                { id: "freshwater-products", code: "1151", name: "淡水水产" },
                { id: "seafood-products", code: "1152", name: "海鲜水产" }
              ] },
              { id: "egg-category", code: "116", name: "蛋品类", children: [
                { id: "fresh-eggs", code: "1161", name: "鲜蛋" }
              ] },
              { id: "tray-level-category", code: "117", name: "盘级五华类", children: [
                { id: "tray-level-products", code: "1171", name: "盘级五华商品" }
              ] },
              { id: "bulk-dry-category", code: "118", name: "散称干货类", children: [
                { id: "bulk-dry-goods", code: "1181", name: "散称干货" }
              ] }
            ]
          },
          {
            id: "fresh-processing-department",
            code: "12",
            name: "生鲜加工部",
            children: [
              {
                id: "cooked-food-category",
                code: "121",
                name: "熟食类",
                children: [
                  { id: "sauce-braised-products", code: "1211", name: "酱/卤品" },
                  { id: "roasted-products", code: "1212", name: "烧/烤品" },
                  { id: "fried-products", code: "1213", name: "煎/炸品" },
                  { id: "steamed-products", code: "1214", name: "蒸制品" },
                  { id: "joint-cooked-food", code: "1215", name: "联营熟食" }
                ]
              },
              { id: "pickles-category", code: "122", name: "酱菜类", children: [
                { id: "pickled-vegetables", code: "1221", name: "腌制酱菜" }
              ] },
              { id: "bakery-category", code: "123", name: "烘焙类", children: [
                { id: "bread-cake", code: "1231", name: "面包糕点" }
              ] },
              { id: "pastry-category", code: "124", name: "面点类", children: [
                { id: "chinese-pastry", code: "1241", name: "中式面点" }
              ] },
              { id: "cured-meat-category", code: "125", name: "腌腊类", children: [
                { id: "cured-meat", code: "1251", name: "腌腊肉品" }
              ] },
              { id: "soy-category", code: "126", name: "豆制品类", children: [
                { id: "soy-products", code: "1261", name: "豆制品" }
              ] },
              { id: "semi-finished-category", code: "127", name: "半成品类", children: [
                { id: "semi-finished-food", code: "1271", name: "半成品食品" }
              ] },
              { id: "snack-category", code: "128", name: "休闲小吃类", children: [
                { id: "ready-snacks", code: "1281", name: "即食小吃" }
              ] }
            ]
          }
        ]
      },
      {
        id: "nonfood-department",
        code: "2",
        name: "非食处",
        children: [
          {
            id: "textile-department",
            code: "21",
            name: "纺织部",
            children: [
              { id: "household-products", code: "211", name: "家居用品类", children: [
                { id: "bedding", code: "2111", name: "床上用品" }
              ] },
              { id: "personal-products", code: "212", name: "个人用品类", children: [
                { id: "personal-accessories", code: "2121", name: "个人配饰" }
              ] },
              { id: "bags-accessories", code: "213", name: "箱包配饰类", children: [
                { id: "bags", code: "2131", name: "箱包" }
              ] }
            ]
          },
          { id: "cleaning-department", code: "22", name: "洗化部", children: [
            { id: "cleaning-products", code: "221", name: "清洁用品类" }
          ] },
          { id: "general-merchandise-department", code: "23", name: "百货部", children: [
            { id: "daily-goods", code: "231", name: "日用百货类" }
          ] }
        ]
      },
      { id: "food-department", code: "3", name: "食品处", children: [
        { id: "packaged-food", code: "31", name: "包装食品部" }
      ] },
      { id: "materials-department", code: "4", name: "物料处", children: [
        { id: "store-materials", code: "41", name: "门店物料类" }
      ] }
    ]
  }
];

const backendCategorySearch = document.querySelector("#backendCategorySearch");
const backendCategoryTree = document.querySelector("#backendCategoryTree");
const backendCategoryEmpty = document.querySelector("#backendCategoryEmpty");
const backendCategoryCode = document.querySelector("#backendCategoryCode");
const backendCategoryName = document.querySelector("#backendCategoryName");
const backendCategoryForm = document.querySelector("#backendCategoryForm");
const backendCategoryExportButton = document.querySelector("#backendCategoryExportButton");
const backendCategoryPlatformSelects = Array.from(
  document.querySelectorAll("[data-backend-platform]")
);
const backendCategoryExpanded = new Set([
  "all-categories",
  "fresh-department",
  "fresh-daily-department",
  "fruit-category",
  "fresh-fruit",
  "fresh-processing-department",
  "cooked-food-category",
  "nonfood-department",
  "textile-department"
]);
const backendCategoryMappings = new Map();
let activeBackendCategoryId = "textile-department";

function walkBackendCategories(items, visitor, parents = []) {
  items.forEach((item) => {
    visitor(item, parents);
    if (item.children?.length) walkBackendCategories(item.children, visitor, [...parents, item]);
  });
}

function findBackendCategory(categoryId) {
  let result = null;
  walkBackendCategories(backendCategoryData, (item) => {
    if (item.id === categoryId) result = item;
  });
  return result;
}

function backendCategoryMatches(item, query) {
  if (!query) return true;
  if (`${item.name} ${item.code}`.toLowerCase().includes(query)) return true;
  return Boolean(item.children?.some((child) => backendCategoryMatches(child, query)));
}

function createBackendCategoryNode(item, depth, query) {
  if (!backendCategoryMatches(item, query)) return null;
  const node = document.createElement("div");
  const row = document.createElement("button");
  const caret = document.createElement("span");
  const label = document.createElement("span");
  const hasChildren = Boolean(item.children?.length);
  const expanded = hasChildren && (backendCategoryExpanded.has(item.id) || Boolean(query));

  node.className = "backend-category-tree-node";
  row.className = "backend-category-tree-row";
  row.type = "button";
  row.dataset.backendCategoryId = item.id;
  row.style.setProperty("--category-depth", depth);
  row.classList.toggle("expanded", expanded);
  row.classList.toggle("selected", item.id === activeBackendCategoryId);
  row.setAttribute("role", "treeitem");
  row.setAttribute("aria-selected", String(item.id === activeBackendCategoryId));
  if (hasChildren) row.setAttribute("aria-expanded", String(expanded));

  caret.className = `backend-category-tree-caret${hasChildren ? "" : " leaf"}`;
  caret.setAttribute("aria-hidden", "true");
  label.className = "backend-category-tree-label";
  label.textContent = item.name;
  row.append(caret, label);
  node.append(row);

  if (expanded) {
    item.children.forEach((child) => {
      const childNode = createBackendCategoryNode(child, depth + 1, query);
      if (childNode) node.append(childNode);
    });
  }
  return node;
}

function renderBackendCategoryTree() {
  const query = backendCategorySearch.value.trim().toLowerCase();
  backendCategoryTree.replaceChildren();
  backendCategoryData.forEach((item) => {
    const node = createBackendCategoryNode(item, 0, query);
    if (node) backendCategoryTree.append(node);
  });
  backendCategoryEmpty.hidden = backendCategoryTree.childElementCount > 0;
}

function loadBackendCategoryDetail() {
  const category = findBackendCategory(activeBackendCategoryId);
  if (!category) return;
  const mapping = backendCategoryMappings.get(category.id) || {};
  backendCategoryCode.textContent = category.code;
  backendCategoryName.textContent = category.name;
  backendCategoryPlatformSelects.forEach((select) => {
    select.value = mapping[select.dataset.backendPlatform] || "";
  });
}

function openBackendCategoryPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城后台类目");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  document.querySelectorAll(".main > section:not(.page-tabs)").forEach((section) => {
    section.hidden = true;
  });
  backendCategoryPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城后台类目");
  });
  renderBackendCategoryTree();
  loadBackendCategoryDetail();
}

backendCategoryTree.addEventListener("click", (event) => {
  const row = event.target.closest("[data-backend-category-id]");
  if (!row) return;
  const category = findBackendCategory(row.dataset.backendCategoryId);
  if (!category) return;

  if (category.children?.length) {
    if (backendCategoryExpanded.has(category.id)) {
      backendCategoryExpanded.delete(category.id);
    } else {
      backendCategoryExpanded.add(category.id);
    }
  } else {
    activeBackendCategoryId = category.id;
    loadBackendCategoryDetail();
  }
  renderBackendCategoryTree();
});

backendCategorySearch.addEventListener("input", renderBackendCategoryTree);

backendCategoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = findBackendCategory(activeBackendCategoryId);
  const mapping = Object.fromEntries(
    backendCategoryPlatformSelects.map((select) => [select.dataset.backendPlatform, select.value])
  );
  backendCategoryMappings.set(activeBackendCategoryId, mapping);
  showToast(`${category.name}的平台类目关联已保存`);
});

backendCategoryExportButton.addEventListener("click", () => {
  const rows = [["类目编码", "类目名称", ...backendCategoryPlatformSelects.map((select) => select.dataset.backendPlatform)]];
  walkBackendCategories(backendCategoryData, (item) => {
    if (item.children?.length) return;
    const mapping = backendCategoryMappings.get(item.id) || {};
    rows.push([item.code, item.name, ...backendCategoryPlatformSelects.map((select) => mapping[select.dataset.backendPlatform] || "")]);
  });
  const csv = `\ufeff${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")}`;
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.href = objectUrl;
  link.download = "同城后台类目关联.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  showToast("关联平台类目已导出");
});

renderBackendCategoryTree();
loadBackendCategoryDetail();
