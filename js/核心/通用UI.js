function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function closeVerifyDetailModal() {
  verifyDetailModal.classList.remove("open");
  verifyDetailModal.setAttribute("aria-hidden", "true");
}

function openVerifyDetailModal() {
  verifyDetailForm.innerHTML = `
    <table class="verify-detail-table">
      <thead>
        <tr>
          <th>用户券凭证ID</th>
          <th>券状态</th>
          <th>开始生效时间</th>
          <th>过期时间</th>
        </tr>
      </thead>
      <tbody>
        ${verifyCredentialDetails
          .map((item) => `
            <tr>
              <td>${item.userCouponCredentialId}</td>
              <td>${item.couponStatus}</td>
              <td>${item.startEffectiveTime}</td>
              <td>${item.expireTime}</td>
            </tr>
          `)
          .join("")}
      </tbody>
    </table>
  `;
  verifyDetailModal.classList.add("open");
  verifyDetailModal.setAttribute("aria-hidden", "false");
}

function closeAfterSaleModal() {
  afterSaleModal.classList.remove("open");
  afterSaleModal.setAttribute("aria-hidden", "true");
}

function createAfterSaleVoucherField(labelText, value) {
  const label = document.createElement("label");
  const labelSpan = document.createElement("span");
  const input = document.createElement("input");
  labelSpan.textContent = labelText;
  input.value = value;
  input.readOnly = true;
  label.append(labelSpan, input);
  return label;
}

function renderAfterSaleVoucherList(voucherItems, platformOrder) {
  afterSaleVoucherList.replaceChildren();
  voucherItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "after-sale-voucher-row";
    row.append(
      createAfterSaleVoucherField("券码：", item.couponCode),
      createAfterSaleVoucherField("平台订单号：", platformOrder)
    );
    afterSaleVoucherList.append(row);
  });
}

function openAfterSaleModal(row) {
  const couponCode = row.children[0].textContent.trim();
  const platformOrder = row.children[1].textContent.trim();
  const posOrderNo = row.children[2].textContent.trim();
  const voucherItems = afterSaleVoucherDetails[platformOrder] || [{ couponCode, posOrderNo }];
  afterSalePosOrder.value = posOrderNo;
  renderAfterSaleVoucherList(voucherItems, platformOrder);
  afterSaleModal.classList.add("open");
  afterSaleModal.setAttribute("aria-hidden", "false");
}

function syncVerifyActions() {
  document.querySelectorAll(".verify-table tbody tr").forEach((row) => {
    const channel = row.children[3]?.textContent.trim();
    const status = row.children[5]?.textContent.trim();
    const detailLink = row.querySelector("[data-verify-detail]");
    const afterSaleLink = row.querySelector("[data-after-sale]");
    if (detailLink) detailLink.hidden = channel !== "支付宝券";
    if (afterSaleLink) afterSaleLink.hidden = status !== "已核销";
  });
}

function syncLocalLifeShopDetail() {
  const selectedShop = document.querySelector("input[name='localLifeShop']:checked")?.value;
  const detail = localLifeShopDetails[selectedShop];
  if (!detail) return;
  document.querySelector("#localLifeShopIdLabel").textContent = `${detail.channel}-店铺ID：`;
  document.querySelector("#localLifeShopId").value = detail.shopId;
  document.querySelector("#localLifeShopName").value = detail.shopName;
  document.querySelector("#localLifeSettleType").value = detail.settleType;
  document.querySelector("#localLifeSettleAccount").value = detail.settleAccount;
  document.querySelector("#localLifeBrandId").value = detail.brandId;
  document.querySelector("#localLifeBrandName").value = detail.brandName;
  document.querySelector("#localLifePrimaryCategory").value = detail.primaryCategory;
  document.querySelector("#localLifeSubCategories").value = detail.subCategories;
}
