let imSelectedImageUrl = "";

function escapeImText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getVisibleImConversations() {
  return imConversations.filter((conversation) => {
    const matchesTab = activeImTab === "all" || (conversation.date === "今天" && (!imTodayUnrepliedFilter.checked || conversation.pending));
    const matchesChannel = imChannelFilter.value === "全部渠道" || conversation.channel === imChannelFilter.value;
    const matchesStore = conversation.stores.includes(activeImStore);
    return matchesTab && matchesChannel && matchesStore;
  });
}

function syncImStoreAccess() {
  const isHeadquarters = activeImUserRole === "headquarters";
  if (!isHeadquarters) activeImStore = employeeStore;
  imCurrentStore.textContent = activeImStore;
  imOpenStoreSwitcher.disabled = !isHeadquarters;
  imOpenStoreSwitcher.textContent = isHeadquarters ? "切换门店" : "当前门店";
  document.querySelectorAll("[data-im-store]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.imStore === activeImStore);
  });
}

function getImChannelMark(channel) {
  return {
    京东秒送: "京",
    饿了么: "饿",
    美团外卖: "美",
    抖店: "抖"
  }[channel] || "渠";
}

function getImChannelColor(channel) {
  return {
    京东秒送: "#e94c4c",
    饿了么: "#169fe6",
    美团外卖: "#f3a91f",
    抖店: "#303642"
  }[channel] || "#5aa8ff";
}

function renderImConversationList() {
  const visibleConversations = getVisibleImConversations();
  const pendingCount = imConversations.filter((conversation) => conversation.pending).length;
  imPendingBadge.textContent = pendingCount;
  imPendingBadge.hidden = pendingCount === 0;
  const isPendingTab = activeImTab === "pending";
  imTodayUnrepliedFilter.closest("label").hidden = !isPendingTab;
  imConversationCount.textContent = isPendingTab
    ? (imTodayUnrepliedFilter.checked ? `${visibleConversations.length}个会话待回复` : `今日共${visibleConversations.length}个会话`)
    : `近7天共${visibleConversations.length}个会话`;

  document.querySelectorAll("[data-im-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.imTab === activeImTab);
  });

  if (visibleConversations.length === 0) {
    imConversationList.innerHTML = '<div class="im-empty-state">当前筛选下没有待处理消息</div>';
    return;
  }

  imConversationList.innerHTML = visibleConversations.map((conversation) => {
    const state = conversation.pending
      ? `<span class="im-unread-count">${conversation.unread || 1}</span>`
      : '<span class="im-replied-tag">已回复</span>';
    const latestMessage = conversation.messages[conversation.messages.length - 1];
    const previewPrefix = latestMessage.sender === "merchant" ? "商家：" : "用户：";
    return `
      <button class="im-conversation-item" type="button" data-im-conversation="${conversation.id}">
        <span class="im-avatar" style="--avatar-color:${getImChannelColor(conversation.channel)}">${getImChannelMark(conversation.channel)}</span>
        <span class="im-conversation-copy">
          <strong>${escapeImText(conversation.customerName)}${conversation.isPreorder ? '<span class="im-preorder-tag" aria-label="预订单">预</span>' : ""}${conversation.orderShortNo != null ? `<span class="im-order-short-no">#${escapeImText(conversation.orderShortNo)}</span>` : ""}</strong>
          <p>${previewPrefix}${escapeImText(latestMessage.text)}</p>
        </span>
        <span class="im-conversation-meta"><time>${escapeImText(conversation.time)}</time>${state}</span>
      </button>
    `;
  }).join("");
}

function renderImMessageThread(conversation) {
  imMessageThread.innerHTML = conversation.messages.map((message, index) => {
    const time = index === 0 || conversation.messages[index - 1].time !== message.time
      ? `<time class="im-message-time">${escapeImText(message.time)}</time>`
      : "";
    const senderName = message.sender === "merchant" ? "商" : getImChannelMark(conversation.channel);
    const senderStyle = message.sender === "merchant" ? "" : ` style="background:${getImChannelColor(conversation.channel)}"`;
    const messageContent = message.image
      ? `<img class="im-message-image" src="${message.image}" alt="图片消息" />${message.text && message.text !== "[图片]" ? `<span>${escapeImText(message.text)}</span>` : ""}`
      : escapeImText(message.text);
    return `${time}<div class="im-message-row ${message.sender}">
      <span${senderStyle}>${escapeImText(senderName)}</span>
      <div class="im-message-bubble">${messageContent}</div>
    </div>`;
  }).join("");
  imMessageThread.scrollTop = imMessageThread.scrollHeight;
}

function openImConversation(conversationId) {
  const conversation = imConversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  activeImConversationId = conversation.id;
  conversation.unread = 0;
  imHeaderTitle.textContent = conversation.customerName;
  const order = conversation.order;
  imOrderCard.hidden = !order;
  imOrderSummary.innerHTML = order ? `
    <p><span>关联订单</span><strong>${conversation.orderShortNo != null ? `#${escapeImText(conversation.orderShortNo)}&nbsp; ` : ""}${escapeImText(order.orderNo)}</strong></p>
    <p><span>下单时间</span><strong>${escapeImText(order.createdTime)}</strong></p>
    <p><span>实付金额</span><strong>¥${escapeImText(order.paidAmount)}</strong></p>
  ` : "";
  imAppPage.classList.add("im-detail-mode");
  imConversationView.hidden = true;
  imDetailView.hidden = false;
  renderImMessageThread(conversation);
  renderImConversationList();
}

imOrderDetailLink.addEventListener("click", () => {
  const conversation = imConversations.find((item) => item.id === activeImConversationId);
  if (conversation?.order) showToast(`订单详情功能演示：${conversation.order.orderNo}`);
});

function showImConversationList() {
  activeImConversationId = null;
  imHeaderTitle.textContent = "IM消息";
  imAppPage.classList.remove("im-detail-mode");
  imDetailView.hidden = true;
  imConversationView.hidden = false;
  imReplyInput.value = "";
  clearImSelectedImage();
  renderImConversationList();
}

function openImApp() {
  tongchengAppScreen.hidden = true;
  openRetailUnionApp.hidden = true;
  closeRetailUnionApp.hidden = true;
  openImMessage.hidden = true;
  openProductRecord.hidden = true;
  imAppPage.hidden = false;
  activeImTab = "pending";
  activeImUserRole = "headquarters";
  activeImStore = employeeStore;
  imChannelFilter.value = "全部渠道";
  imTodayUnrepliedFilter.checked = true;
  imStoreSwitcher.hidden = true;
  syncImStoreAccess();
  showImConversationList();
}

function closeImApp() {
  setRetailUnionAppOpen(true);
}

openImMessage.addEventListener("click", openImApp);
imBackButton.addEventListener("click", () => {
  if (!imDetailView.hidden) {
    showImConversationList();
    return;
  }
  closeImApp();
});
imCloseButton.addEventListener("click", closeImApp);

document.querySelector(".im-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-im-tab]");
  if (!tab) return;
  activeImTab = tab.dataset.imTab;
  renderImConversationList();
});

imChannelFilter.addEventListener("change", renderImConversationList);
imTodayUnrepliedFilter.addEventListener("change", renderImConversationList);
imOpenStoreSwitcher.addEventListener("click", () => {
  if (activeImUserRole !== "headquarters") return;
  imStoreSwitcher.hidden = false;
});

function closeImStoreSwitcher() {
  imStoreSwitcher.hidden = true;
}

imCloseStoreSwitcher.addEventListener("click", closeImStoreSwitcher);
imStoreSheetClose.addEventListener("click", closeImStoreSwitcher);
document.querySelector(".im-store-options").addEventListener("click", (event) => {
  const store = event.target.closest("[data-im-store]");
  if (!store) return;
  activeImStore = store.dataset.imStore;
  syncImStoreAccess();
  renderImConversationList();
  closeImStoreSwitcher();
  showToast(`已切换至${activeImStore}`);
});

imConversationList.addEventListener("click", (event) => {
  const conversation = event.target.closest("[data-im-conversation]");
  if (!conversation) return;
  openImConversation(conversation.dataset.imConversation);
});

function sendImReply() {
  const text = imReplyInput.value.trim();
  if (!text && !imSelectedImageUrl) {
    showToast("请输入回复内容或添加图片");
    return;
  }
  const conversation = imConversations.find((item) => item.id === activeImConversationId);
  if (!conversation) return;
  conversation.messages.push({ sender: "merchant", text: text || "[图片]", image: imSelectedImageUrl, time: "刚刚" });
  conversation.preview = text || "[图片]";
  conversation.time = "刚刚";
  conversation.pending = false;
  conversation.unread = 0;
  imReplyInput.value = "";
  clearImSelectedImage();
  renderImMessageThread(conversation);
  renderImConversationList();
  showToast("回复已发送");
}

imSendButton.addEventListener("click", sendImReply);
imReplyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendImReply();
});

function clearImSelectedImage() {
  imSelectedImageUrl = "";
  imImageUploadInput.value = "";
  imImagePreviewImage.removeAttribute("src");
  imImagePreview.hidden = true;
}

imImageUploadButton.addEventListener("click", () => imImageUploadInput.click());
imImageUploadInput.addEventListener("change", () => {
  const [file] = imImageUploadInput.files;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    clearImSelectedImage();
    return;
  }
  imSelectedImageUrl = URL.createObjectURL(file);
  imImagePreviewImage.src = imSelectedImageUrl;
  imImagePreview.hidden = false;
});
imImagePreviewRemove.addEventListener("click", clearImSelectedImage);
