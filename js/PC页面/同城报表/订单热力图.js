function setMapZoom(nextZoom) {
  mapZoom = Math.max(0.78, Math.min(1.48, nextZoom));
  const stage = document.querySelector("#heatmapStage");
  const mapCanvas = document.querySelector("#mapCanvas");
  document.querySelector("#zoomThumb").style.height = `${Math.round((mapZoom - 0.78) / 0.7 * 100)}%`;
  stage.classList.toggle("heatmap-zoom-in", mapZoom > 1.16);
  stage.classList.toggle("heatmap-zoom-out", mapZoom < 0.92);
  stage.classList.toggle("heatmap-zoom-default", mapZoom >= 0.92 && mapZoom <= 1.16);

  if (mapZoom > 1.16) {
    mapCanvas.style.transform = "translate(-80px, -20px) scale(1.1)";
  } else if (mapZoom < 0.92) {
    mapCanvas.style.transform = "translate(-10px, 18px) scale(0.86)";
  } else {
    mapCanvas.style.transform = "translate(-150px, -46px) scale(1.22)";
  }
}

document.querySelector("#zoomIn").addEventListener("click", () => setMapZoom(1.32));
document.querySelector("#zoomOut").addEventListener("click", () => setMapZoom(0.82));
document.querySelector("#heatmapStage").addEventListener("wheel", (event) => {
  event.preventDefault();
  setMapZoom(mapZoom + (event.deltaY < 0 ? 0.18 : -0.18));
});
