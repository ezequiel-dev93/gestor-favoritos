chrome.action.onClicked.addListener(async () => {
  try {
    await chrome.sidePanel.setOptions({
      path: "index.html",
      enabled: true
    });
    await chrome.sidePanel.open();
  } catch (error) {
    console.error("Error al abrir el panel lateral:", error);
  }
});
