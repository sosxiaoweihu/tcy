// 静态原型数据；正式接入时由微信客服列表和员工查询接口提供。
const merchantServiceAccounts = [
  { id: 'wk_demo_000001', name: '小程序商家客服' },
  { id: 'wk_demo_000002', name: '订单咨询客服' },
  { id: 'wk_demo_000003', name: '售后服务客服' },
  { id: 'wk_demo_000004', name: '门店服务客服' }
];
const merchantServiceEmployees = new Map([
  ['10001', '张敏'], ['10002', '李佳'], ['10003', '王磊'], ['10004', '陈晨']
]);
const merchantServicePage = document.getElementById('merchantServicePage');
const merchantServiceDialog = document.getElementById('merchantServiceDialog');
const merchantServiceDeleteDialog = document.getElementById('merchantServiceDeleteDialog');
let merchantServiceDeleteId = null;
const merchantServiceCode = document.getElementById('merchantServiceEmployeeCode');
const merchantServiceAccountSelect = document.getElementById('merchantServiceAccountSelect');
const merchantServiceError = document.getElementById('merchantServiceError');
const merchantServiceStorageKey = 'ys-merchant-service-mappings:v2';
let merchantServiceFilters = { accountId: '', employeeCode: '' };
// 首次打开默认展示两条员工关联，后续以本标签页保存的新增/删除结果为准。
let merchantServiceMappings = { wk_demo_000001: '10001', wk_demo_000002: '10002' };
try {
  const saved = JSON.parse(sessionStorage.getItem(merchantServiceStorageKey));
  const hasSaved = saved && typeof saved === 'object' && !Array.isArray(saved);
  // 升级样例时保留旧版本已新增的有效关联，不覆盖用户的工号选择。
  const mappings = hasSaved ? saved : JSON.parse(sessionStorage.getItem('ys-merchant-service-mappings:v1'));
  if (hasSaved) merchantServiceMappings = {};
  if (mappings && typeof mappings === 'object' && !Array.isArray(mappings)) {
    merchantServiceAccounts.forEach(account => {
      if (merchantServiceEmployees.has(mappings[account.id])) merchantServiceMappings[account.id] = mappings[account.id];
    });
  }
  if (!hasSaved) sessionStorage.setItem(merchantServiceStorageKey, JSON.stringify(merchantServiceMappings));
} catch { /* 禁用存储时仍可在当前页面完成映射。 */ }

function renderMerchantService() {
  const body = document.getElementById('merchantServiceRows');
  body.replaceChildren();
  const accounts = merchantServiceAccounts.filter(account => {
    const code = merchantServiceMappings[account.id];
    return code && account.id.toLowerCase().includes(merchantServiceFilters.accountId.toLowerCase()) && code.includes(merchantServiceFilters.employeeCode);
  });
  accounts.forEach(account => {
    const row = document.createElement('tr');
    const code = merchantServiceMappings[account.id] || '';
    [account.id, account.name, code, merchantServiceEmployees.get(code) || ''].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    const action = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'merchant-service-link danger';
    button.textContent = '删除';
    button.dataset.merchantServiceDelete = account.id;
    button.setAttribute('aria-label', `${account.name}${button.textContent}`);
    action.append(button);
    row.append(action);
    body.append(row);
  });
  if (!accounts.length) {
    const row = body.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.className = 'merchant-service-empty';
    cell.textContent = merchantServiceFilters.accountId || merchantServiceFilters.employeeCode ? '暂无符合查询条件的员工' : '暂无员工，请点击“新增员工”添加';
  }
  document.getElementById('merchantServiceCount').textContent = `共 ${accounts.length} 条`;
  document.getElementById('merchantServiceTotal').textContent = `共 ${accounts.length} 条`;
}

function openMerchantServicePage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab('小程序商家客服');
  leaveTongchengAppPage();
  leaveCustomTaskPage();
  document.body.classList.remove('unified-category-mode');
  unifiedCategorySidebar.hidden = true;
  [...merchantServicePage.parentElement.children].forEach(element => {
    if (element.tagName === 'SECTION') element.hidden = element !== merchantServicePage;
  });
  merchantServicePage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(button => {
    button.classList.toggle('active', button.dataset.page === '小程序商家客服');
  });
  document.querySelectorAll('.side-nav [data-nav]').forEach(button => {
    button.classList.toggle('active', button.dataset.nav === '同城');
  });
  renderMerchantService();
}

function validateMerchantServiceForm(showRequired = false) {
  const accountId = merchantServiceAccountSelect.value;
  const code = merchantServiceCode.value.trim();
  let error = '';
  if (showRequired && !accountId) error = '请选择微信客服';
  else if (accountId && merchantServiceMappings[accountId]) error = '该微信客服已关联员工，请先删除原关联';
  else if (showRequired && !code) error = '请输入员工工号';
  else if (code && !merchantServiceEmployees.has(code)) error = '未找到该工号对应的员工，请检查后重新输入';
  merchantServiceError.textContent = error;
  merchantServiceAccountSelect.setAttribute('aria-invalid', String(Boolean((showRequired && !accountId) || (accountId && merchantServiceMappings[accountId]))));
  merchantServiceCode.setAttribute('aria-invalid', String(Boolean((showRequired && !code) || (code && !merchantServiceEmployees.has(code)))));
  return !error && accountId && merchantServiceEmployees.has(code);
}

document.getElementById('merchantServiceAdd').addEventListener('click', () => {
  document.getElementById('merchantServiceForm').reset();
  merchantServiceAccountSelect.replaceChildren(new Option('请选择微信客服ID_微信客服名称', ''));
  merchantServiceAccounts.forEach(account => {
    const linked = Boolean(merchantServiceMappings[account.id]);
    const option = new Option(`${account.id}_${account.name}${linked ? '（已关联员工）' : ''}`, account.id);
    option.disabled = linked;
    merchantServiceAccountSelect.append(option);
  });
  merchantServiceError.textContent = '';
  merchantServiceCode.removeAttribute('aria-invalid');
  merchantServiceAccountSelect.removeAttribute('aria-invalid');
  merchantServiceDialog.showModal();
  merchantServiceAccountSelect.focus();
});
merchantServicePage.addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-merchant-service-delete]');
  if (!deleteButton) return;
  const id = deleteButton.dataset.merchantServiceDelete;
  const code = merchantServiceMappings[id];
  if (!code) return;
  merchantServiceDeleteId = id;
  document.getElementById('merchantServiceDeleteMessage').textContent = `确定删除员工 ${merchantServiceEmployees.get(code)}（${code}）的客服关联吗？`;
  merchantServiceDeleteDialog.showModal();
});
merchantServiceDeleteDialog.querySelector('[data-merchant-service-delete-cancel]').addEventListener('click', () => merchantServiceDeleteDialog.close());
document.getElementById('merchantServiceDeleteConfirm').addEventListener('click', () => {
  const id = merchantServiceDeleteId;
  if (!id || !merchantServiceMappings[id]) return;
  delete merchantServiceMappings[id];
  let persisted = true;
  try { sessionStorage.setItem(merchantServiceStorageKey, JSON.stringify(merchantServiceMappings)); }
  catch { persisted = false; }
  renderMerchantService();
  merchantServiceDeleteDialog.close();
  showToast(persisted ? '员工关联已删除' : '员工关联已删除，当前浏览器不支持刷新后保留');
});
merchantServiceDeleteDialog.addEventListener('close', () => {
  const id = merchantServiceDeleteId;
  merchantServiceDeleteId = null;
  const button = merchantServicePage.querySelector(`[data-merchant-service-delete="${id}"]`);
  (button || document.getElementById('merchantServiceAdd')).focus();
});
merchantServiceCode.addEventListener('input', () => validateMerchantServiceForm());
merchantServiceAccountSelect.addEventListener('change', () => validateMerchantServiceForm());
document.getElementById('merchantServiceForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!validateMerchantServiceForm(true)) {
    (merchantServiceAccountSelect.getAttribute('aria-invalid') === 'true' ? merchantServiceAccountSelect : merchantServiceCode).focus();
    return;
  }
  merchantServiceMappings[merchantServiceAccountSelect.value] = merchantServiceCode.value.trim();
  let persisted = true;
  try { sessionStorage.setItem(merchantServiceStorageKey, JSON.stringify(merchantServiceMappings)); }
  catch { persisted = false; }
  renderMerchantService();
  merchantServiceDialog.close();
  showToast(persisted ? '员工新增成功' : '员工已新增，当前浏览器不支持刷新后保留');
});
merchantServiceDialog.querySelectorAll('[data-merchant-service-close]').forEach(button => {
  button.addEventListener('click', () => merchantServiceDialog.close());
});
merchantServiceDialog.addEventListener('close', () => {
  document.getElementById('merchantServiceAdd').focus();
});
document.getElementById('merchantServicePull').addEventListener('click', () => {
  // 原型仅使用本地演示列表；接入接口后在此同步微信客服，保留已有员工关联。
  renderMerchantService();
  showToast(`已拉取 ${merchantServiceAccounts.length} 条客服（演示数据）`);
});
document.getElementById('merchantServiceFilters').addEventListener('submit', event => {
  event.preventDefault();
  merchantServiceFilters = {
    accountId: document.getElementById('merchantServiceFilterAccount').value.trim(),
    employeeCode: document.getElementById('merchantServiceFilterEmployee').value.trim()
  };
  renderMerchantService();
  showToast('查询完成');
});
document.getElementById('merchantServiceReset').addEventListener('click', () => {
  document.getElementById('merchantServiceFilters').reset();
  merchantServiceFilters = { accountId: '', employeeCode: '' };
  renderMerchantService();
  showToast('查询条件已重置');
});
document.getElementById('merchantServiceJump').addEventListener('change', event => {
  if (event.target.value !== '1') showToast('当前仅有 1 页');
  event.target.value = '1';
});
renderMerchantService();
