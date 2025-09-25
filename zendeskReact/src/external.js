window.togglePlatform = function () {
  const zoomPanel = document.getElementById('zoomPanel');
  const zendeskPanel = document.getElementById('zendeskPanel');
  const thumb = document.getElementById('sliderThumb');
  const zoomLogo = document.getElementById('zoomLogo');
  const zendeskLogo = document.getElementById('zendeskLogo');

  if (!zoomPanel || !zendeskPanel || !thumb || !zoomLogo || !zendeskLogo) return;

  const zoomActive = zoomPanel.classList.contains('active');

  if (zoomActive) {
    // Switch to Zendesk
    zoomPanel.classList.remove('active');
    zendeskPanel.classList.add('active');

    zoomLogo.classList.remove('active');
    zendeskLogo.classList.add('active');

    thumb.style.left = '45px';  // Adjust as per your CSS width
  } else {
    // Switch to Zoom
    zendeskPanel.classList.remove('active');
    zoomPanel.classList.add('active');

    zendeskLogo.classList.remove('active');
    zoomLogo.classList.add('active');

    thumb.style.left = '3px';  // Adjust as per your CSS width
  }
};
