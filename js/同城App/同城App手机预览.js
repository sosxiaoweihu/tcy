function leaveTongchengAppPage() {
  document.body.classList.remove("tongcheng-app-mode");
  tongchengAppPage.hidden = true;
}

function leaveCustomTaskPage() {
  customTaskPage.hidden = true;
}

function openTongchengAppPage() {
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  document.body.classList.add("tongcheng-app-mode");
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  constructionPage.hidden = true;
  cityOrderPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  productStockoutReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  pageTabs.hidden = true;
  cityShelfPlanPage.hidden = true;
  tongchengAppPage.hidden = false;
  // 先显示容器，再恢复功能页，确保滚动位置按可见手机尺寸还原。
  if (typeof window.tongchengAppTabs?.resume === "function") window.tongchengAppTabs.resume();
  else setRetailUnionAppOpen(true);
}

function setRetailUnionAppOpen() {
  // 手机桌面已移除，旧的返回调用也统一回到全部工具。
  tongchengAppScreen.src = "./assets/retail-union-tools.png";
  tongchengAppScreen.alt = "零售共场App全部工具页面";
  tongchengAppScreen.closest(".tongcheng-app-screen").classList.add("retail-union-open");
  tongchengAppScreen.hidden = false;
  document.getElementById("orderReviewsPage").hidden = true;
  document.getElementById("openOrderReviews").hidden = false;
  thirdPartyOrderPage.hidden = true;
  thirdPartyPhotoPage.hidden = true;
  imAppPage.hidden = true;
  productRecordPage.hidden = true;
  document.getElementById("cityProductsPage").hidden = true;
  document.getElementById("openCityProducts").hidden = false;
  openRetailUnionApp.hidden = true;
  closeRetailUnionApp.hidden = true;
  openThirdPartyOrder.hidden = false;
  openImMessage.hidden = false;
  openProductRecord.hidden = false;
}

openRetailUnionApp.addEventListener("click", () => setRetailUnionAppOpen(true));
closeRetailUnionApp.addEventListener("click", () => setRetailUnionAppOpen(true));

function downloadTongchengAppScreenshot(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "同城App截图.png";
  link.click();
  // 等待浏览器开始读取下载内容后再释放对象 URL。
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadTongchengAppSourceImage() {
  const link = document.createElement("a");
  link.href = tongchengAppScreen.currentSrc || tongchengAppScreen.src;
  link.download = "同城App截图.png";
  link.click();
}

async function copyTongchengAppImage(blobPromise) {
  if (!window.isSecureContext || typeof navigator.clipboard?.write !== "function" || typeof ClipboardItem === "undefined") return false;
  try {
    // 在点击事件中立即申请写入，再异步生成图片，避免 Safari 丢失用户激活状态。
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blobPromise })]);
    return true;
  } catch (error) {
    return false;
  }
}

async function copyTongchengAppStaticImage() {
  try {
    const blobPromise = fetch(tongchengAppScreen.currentSrc || tongchengAppScreen.src).then((response) => {
      if (!response.ok) throw new Error("图片读取失败");
      return response.blob();
    });
    const copyPromise = copyTongchengAppImage(blobPromise);
    const [blob, copied] = await Promise.all([blobPromise, copyPromise]);
    if (copied) {
      showToast("App 截图已复制，可直接粘贴使用");
    } else {
      downloadTongchengAppScreenshot(blob);
      showToast("当前环境不支持复制图片，已下载截图");
    }
  } catch (error) {
    downloadTongchengAppSourceImage();
    showToast("当前环境不支持复制图片，已下载 App 原图");
  }
}

function getTongchengAppScreenshotTarget() {
  // 功能页均覆盖整个手机屏幕。只绘制当前页，避免背后已被遮挡的本地
  // 工具页背景进入画布，导致 file:// 模式下 PNG 导出触发 SecurityError。
  return [document.getElementById("orderReviewsPage"), document.getElementById("cityProductsPage"), thirdPartyPhotoPage, productRecordPage, imAppPage, thirdPartyOrderPage]
    .find((page) => page && !page.hidden) || tongchengAppScreen.closest(".tongcheng-app-screen");
}

function sanitizeTongchengScreenshotStyleValue(property, value, backgroundColor = "transparent") {
  if (!value || !value.includes("file:")) return value;
  if (property === "background") return backgroundColor;
  if (property.includes("image") || property.includes("source")) return "none";
  return "initial";
}

function normalizeTongchengScreenshotControl(element, clonedDocument) {
  // html2canvas 把 ::before/::after 变成子节点，但 INPUT 是空元素，
  // 插入其中的伪元素替身没有计算样式，会触发空背景色的 EOF 解析异常。
  // 只在截图克隆中将自绘选择框换成可容纳子节点的 SPAN，保留已冻结样式。
  const replacement = clonedDocument.createElement("span");
  replacement.className = element.className;
  if (element.id) replacement.id = element.id;
  replacement.style.cssText = element.style.cssText;
  while (element.firstChild) replacement.appendChild(element.firstChild);
  element.replaceWith(replacement);
  // 将圆点的纯位移合并进定位，避免截图库再次叠加 transform。
  Array.from(replacement.children).forEach(child => {
    const match = /^matrix\(1,\s*0,\s*0,\s*1,\s*([^,]+),\s*([^)]+)\)$/.exec(child.style.getPropertyValue("transform"));
    const left = parseFloat(child.style.getPropertyValue("left"));
    const top = parseFloat(child.style.getPropertyValue("top"));
    if (match && Number.isFinite(left) && Number.isFinite(top)) {
      child.style.setProperty("left", `${left + Number(match[1])}px`, "important");
      child.style.setProperty("top", `${top + Number(match[2])}px`, "important");
      child.style.setProperty("transform", "none", "important");
    }
  });
  return replacement;
}

async function createTongchengAppScreenshot(target) {
  if (typeof window.html2canvas !== "function") {
    throw new Error("截图服务加载失败，请检查网络后重试");
  }
  // 克隆文档可能无法及时加载多层 @import 样式。冻结当前页的计算样式和
  // 滚动位置，确保截图仍按手机尺寸排版，而不是导出无样式的整页内容。
  const snapshots = [target, ...target.querySelectorAll("*")].map((element) => {
    const style = window.getComputedStyle(element);
    return {
      styles: Array.from(style)
        .filter((property) => !property.startsWith("--") && !["all", "d", "content"].includes(property))
        .map((property) => [property, sanitizeTongchengScreenshotStyleValue(
          property,
          style.getPropertyValue(property),
          style.getPropertyValue("background-color")
        )]),
      unsafeImageSource: String(element.currentSrc || element.getAttribute?.("src") || "").startsWith("file:"),
      customControl: element.tagName === "INPUT" && ["checkbox", "radio"].includes(element.type)
        && [style.getPropertyValue("appearance"), style.getPropertyValue("-webkit-appearance")].includes("none"),
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft
    };
  });
  const canvas = await window.html2canvas(target, {
    backgroundColor: null,
    logging: false,
    scale: 2,
    useCORS: true,
    allowTaint: false,
    onclone: (clonedDocument, clonedTarget) => {
      // html2canvas 会插入伪元素替身；它们已有计算样式，不占原始节点序号。
      const elements = [clonedTarget, ...clonedTarget.querySelectorAll("*")]
        .filter((element) => !element.closest("html2canvaspseudoelement"));
      if (elements.length !== snapshots.length) throw new Error("页面内容已变化，请重新截图");
      elements.forEach((element, index) => {
        snapshots[index].styles.forEach(([property, value]) => element.style.setProperty(property, value));
        if (snapshots[index].unsafeImageSource && element.tagName === "IMG") {
          element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAAAAACw=");
          element.removeAttribute("srcset");
        }
        element.style.setProperty("transition", "none", "important");
        element.style.setProperty("animation", "none", "important");
      });
      elements.forEach((element, index) => {
        element.scrollTop = snapshots[index].scrollTop;
        element.scrollLeft = snapshots[index].scrollLeft;
        if (snapshots[index].customControl) normalizeTongchengScreenshotControl(element, clonedDocument);
      });
    }
  });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("截图生成失败，请重试");
  return blob;
}

async function copyTongchengAppScreenshotToClipboard() {
  if (copyTongchengAppScreenshot.disabled) return;
  const buttonText = copyTongchengAppScreenshot.textContent;
  copyTongchengAppScreenshot.disabled = true;
  copyTongchengAppScreenshot.textContent = "正在生成…";

  try {
    const appScreen = tongchengAppScreen.closest(".tongcheng-app-screen");
    const target = getTongchengAppScreenshotTarget();
    if (target === appScreen && !appScreen.classList.contains("retail-union-open")) {
      await copyTongchengAppStaticImage();
      return;
    }

    const blobPromise = createTongchengAppScreenshot(target);
    const copyPromise = copyTongchengAppImage(blobPromise);
    const [blob, copied] = await Promise.all([blobPromise, copyPromise]);
    if (copied) {
      showToast("App 截图已复制，可直接粘贴使用");
    } else {
      downloadTongchengAppScreenshot(blob);
      showToast("当前环境不支持复制图片，已下载截图");
    }
  } catch (error) {
    console.error("同城 App 截图生成失败", error);
    showToast(error.name === "SecurityError"
      ? "截图中的图片受浏览器安全限制，请通过本地预览服务打开页面后重试"
      : error.message || "截图生成失败，请重试");
  } finally {
    copyTongchengAppScreenshot.disabled = false;
    copyTongchengAppScreenshot.textContent = buttonText;
  }
}

copyTongchengAppScreenshot.addEventListener("click", copyTongchengAppScreenshotToClipboard);
