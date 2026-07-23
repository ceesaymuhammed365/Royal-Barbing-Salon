const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.querySelector('.page-heading h2');
const pageSubtitle = document.querySelector('.page-heading p');
const sidebar = document.querySelector('.sidebar');
const toggleButton = document.getElementById('sidebarToggle');
const contentArea = document.querySelector('.content-area');

const pageContent = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'View your latest bookings, revenue, and service activity.'
  },
  appointments: {
    title: 'Appointments',
    subtitle: 'Review and manage upcoming client bookings.'
  },
  customers: {
    title: 'Customers',
    subtitle: 'See client profiles, preferences, and booking history.'
  },
  payments: {
    title: 'Payments',
    subtitle: 'Track revenue, invoices, and payment status.'
  },
  services: {
    title: 'Services',
    subtitle: 'Update your service list, pricing, and duration.'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Adjust your salon preferences and notifications.'
  }
};

const bookingRows = document.querySelectorAll('tr[data-booking]');
const bookingCodes = ['RB-001', 'RB-002', 'RB-003', 'RB-004'];

function createScannerPanel() {
  if (!contentArea || !bookingRows.length) return null;

  const panel = document.createElement('section');
  panel.className = 'scanner-panel panel';
  panel.setAttribute('aria-labelledby', 'scannerTitle');
  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <h3 id="scannerTitle">Scan Booking QR Code</h3>
        <p>Scan a customer code to view the matching appointment details.</p>
      </div>
      <span id="scannerStatus" class="scanner-status">Ready to scan</span>
    </div>
    <div class="scanner-layout">
      <div class="scanner-preview">
        <video id="qrVideo" playsinline muted aria-label="QR code camera preview"></video>
        <div id="scannerPlaceholder" class="scanner-placeholder">
          <span class="scanner-frame">QR</span>
          <p>Camera preview will appear here</p>
        </div>
      </div>
      <div class="scanner-controls">
        <button id="startScanner" class="scanner-btn primary" type="button">Start camera</button>
        <button id="stopScanner" class="scanner-btn" type="button" disabled>Stop camera</button>
        <form id="bookingLookupForm" class="lookup-form">
          <label for="bookingCode">Booking code</label>
          <div class="lookup-row">
            <input id="bookingCode" name="bookingCode" type="text" placeholder="Example: RB-001" autocomplete="off" />
            <button class="scanner-btn" type="submit">Find booking</button>
          </div>
        </form>
        <p class="scanner-help">Use the camera or enter a code manually. Demo codes: RB-001 to RB-004.</p>
      </div>
    </div>
    <div id="bookingDetails" class="booking-details" aria-live="polite" hidden></div>
  `;
  contentArea.prepend(panel);
  return panel;
}

function getBookingData(code) {
  const normalizedCode = code.trim().toUpperCase();
  const index = bookingCodes.indexOf(normalizedCode);
  if (index === -1 || !bookingRows[index]) return null;

  const row = bookingRows[index];
  const cells = row.querySelectorAll('td');
  return {
    code: normalizedCode,
    customer: cells[0].querySelector('strong')?.textContent || 'Unknown customer',
    service: cells[0].querySelector('.table-note')?.textContent || 'Service unavailable',
    phone: cells[1]?.textContent.trim() || 'Phone unavailable',
    payment: cells[2]?.textContent.trim() || 'Unknown',
    booking: cells[3]?.textContent.trim() || 'Unknown'
  };
}

function showBookingDetails(code) {
  const details = document.getElementById('bookingDetails');
  const status = document.getElementById('scannerStatus');
  const booking = getBookingData(code);
  if (!details || !status) return;

  if (!booking) {
    status.textContent = 'Booking not found';
    status.className = 'scanner-status error';
    details.hidden = false;
    details.innerHTML = '<strong>No matching booking found.</strong><span>Check the QR code or enter a valid booking code.</span>';
    return;
  }

  status.textContent = `Booking ${booking.code} found`;
  status.className = 'scanner-status success';
  details.hidden = false;
  details.innerHTML = `
    <div>
      <span class="detail-label">Customer</span>
      <strong>${booking.customer}</strong>
    </div>
    <div>
      <span class="detail-label">Service</span>
      <strong>${booking.service}</strong>
    </div>
    <div>
      <span class="detail-label">Phone</span>
      <strong>${booking.phone}</strong>
    </div>
    <div>
      <span class="detail-label">Payment</span>
      <strong>${booking.payment}</strong>
    </div>
    <div>
      <span class="detail-label">Booking status</span>
      <strong>${booking.booking}</strong>
    </div>
  `;
}

function setupScanner() {
  const panel = createScannerPanel();
  if (!panel) return;

  const video = panel.querySelector('#qrVideo');
  const placeholder = panel.querySelector('#scannerPlaceholder');
  const startButton = panel.querySelector('#startScanner');
  const stopButton = panel.querySelector('#stopScanner');
  const lookupForm = panel.querySelector('#bookingLookupForm');
  const codeInput = panel.querySelector('#bookingCode');
  const status = panel.querySelector('#scannerStatus');
  let stream;
  let detector;
  let scanTimer;

  const stopCamera = () => {
    if (scanTimer) window.clearInterval(scanTimer);
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = undefined;
    video.srcObject = null;
    video.classList.remove('visible');
    placeholder.hidden = false;
    startButton.disabled = false;
    stopButton.disabled = true;
  };

  const scanFrame = async () => {
    if (!detector || video.readyState < 2) return;
    const codes = await detector.detect(video);
    if (codes[0]?.rawValue) {
      codeInput.value = codes[0].rawValue;
      showBookingDetails(codes[0].rawValue);
      stopCamera();
    }
  };

  startButton.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'Camera unavailable';
      status.className = 'scanner-status error';
      return;
    }
    if (!('BarcodeDetector' in window)) {
      status.textContent = 'Use booking code lookup';
      status.className = 'scanner-status error';
      return;
    }
    try {
      detector = new BarcodeDetector({ formats: ['qr_code'] });
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      await video.play();
      video.classList.add('visible');
      placeholder.hidden = true;
      startButton.disabled = true;
      stopButton.disabled = false;
      status.textContent = 'Scanning...';
      status.className = 'scanner-status';
      scanTimer = window.setInterval(scanFrame, 300);
    } catch (error) {
      status.textContent = 'Camera permission needed';
      status.className = 'scanner-status error';
    }
  });

  stopButton.addEventListener('click', stopCamera);
  lookupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showBookingDetails(codeInput.value);
  });
}

function updateBookingRow(row, bookingStatus) {
  const bookingLabel = row.querySelector('.booking-status');

  if (bookingLabel) {
    bookingLabel.textContent = bookingStatus;
    bookingLabel.className = `booking-status ${bookingStatus.toLowerCase()}`;
  }
}

function handleActionClick(event) {
  const button = event.target.closest('.action-btn');
  if (!button) return;

  const row = button.closest('tr');
  if (!row) return;

  const statusByAction = {
    confirm: 'Confirmed',
    complete: 'Completed',
    cancel: 'Cancelled'
  };
  const action = Object.keys(statusByAction).find((name) => button.classList.contains(name));

  if (action) {
    updateBookingRow(row, statusByAction[action]);
  }
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');

    const page = item.dataset.page;
    if (pageContent[page]) {
      pageTitle.textContent = pageContent[page].title;
      pageSubtitle.textContent = pageContent[page].subtitle;
    }

    if (window.innerWidth <= 760) {
      sidebar.classList.remove('open');
    }
  });
});

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

const actionButtons = document.querySelectorAll('.action-btn');
actionButtons.forEach((button) => {
  button.addEventListener('click', handleActionClick);
});

setupScanner();

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    sidebar.classList.remove('open');
  }
});
