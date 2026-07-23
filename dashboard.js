const serviceCatalog = {
  'Classic Haircut': { price: 1500, color: '#e7b75b' },
  'Fade & Line-up': { price: 2000, color: '#79b7ad' },
  'Beard Trim & Shape': { price: 1200, color: '#c98a66' },
  'Full Grooming Package': { price: 3500, color: '#9b8bc4' },
  'Hair Spray Service': { price: 400, color: '#db8a9f' },
  'Curly Hair Service': { price: 2500, color: '#7d9ecb' },
  'Kids Haircut': { price: 1000, color: '#d0ad78' }
};
const pageMeta = {
  dashboard: ['Dashboard', 'Here is what is happening at the studio today.'],
  appointments: ['Appointments', 'Confirm, complete, or cancel bookings from the shared booking site.'],
  customers: ['Customers', 'Every client currently stored by the booking site.'],
  payments: ['Payments', 'Revenue is calculated from confirmed and completed bookings.'],
  services: ['Services', 'Current services and their ordinary starting prices.'],
  settings: ['Settings', 'These preferences are saved in this browser.']
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (amount) => `${Number(amount || 0).toLocaleString()} GMD`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const statusLabel = (status) => status === 'confirmed' ? 'Confirmed' : status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending';

function readBookings() {
  const read = (key, type) => {
    try { return (JSON.parse(localStorage.getItem(key)) || []).map((booking) => ({ ...booking, type: booking.type || type })); }
    catch { return []; }
  };
  return [...read('bookings', 'Salon Booking'), ...read('homeServiceBookings', 'Home Service')].sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
}
function bookingAmount(booking) {
  const base = serviceCatalog[booking.service]?.price || 0;
  return base + (booking.treatment === 'VIP' ? Math.round(base * 0.25) : 0) + (booking.location === 'Home Service' ? 500 : 0);
}
function formatDate(value) {
  if (!value) return 'Date not set';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function bookingDate(booking) { return booking.date || booking.bookedAt?.slice(0, 10) || ''; }
function saveBookingStatus(id, status) {
  ['bookings', 'homeServiceBookings'].forEach((key) => {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch { return; }
    const index = list.findIndex((booking) => booking.id === id);
    if (index !== -1) { list[index] = { ...list[index], status, updatedAt: new Date().toISOString() }; localStorage.setItem(key, JSON.stringify(list)); }
  });
}
function renderSummary(bookings) {
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((booking) => bookingDate(booking) === today && booking.status !== 'cancelled');
  const active = bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status));
  const names = bookings.reduce((counts, booking) => { counts[booking.name] = (counts[booking.name] || 0) + 1; return counts; }, {});
  $('#todayCount').textContent = todayBookings.length;
  $('#todayNote').textContent = todayBookings.length ? `${todayBookings.filter((booking) => booking.status === 'confirmed').length} confirmed for today` : 'No bookings yet';
  $('#pendingCount').textContent = bookings.filter((booking) => booking.status === 'pending').length;
  $('#revenueTotal').textContent = money(active.reduce((total, booking) => total + bookingAmount(booking), 0));
  $('#returningCount').textContent = Object.values(names).filter((count) => count > 1).length;
  $('#navAppointmentCount').textContent = bookings.filter((booking) => booking.status === 'pending').length;
}
function renderUpcoming(bookings) {
  const rows = $('#upcomingRows');
  const queue = bookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'completed').slice(0, 5);
  rows.innerHTML = queue.map((booking) => `<tr><td><strong>${escapeHtml(booking.name)}</strong><span class="table-note">${escapeHtml(booking.phone)}</span></td><td>${escapeHtml(booking.service)}<span class="table-note">${escapeHtml(booking.type)}</span></td><td>${escapeHtml(booking.time || 'TBC')}<span class="table-note">${formatDate(bookingDate(booking))}</span></td><td><span class="status ${booking.status}">${statusLabel(booking.status)}</span></td><td><button class="row-action" data-status="confirmed" data-id="${escapeHtml(booking.id)}">Confirm</button></td></tr>`).join('');
  $('#upcomingEmpty').hidden = queue.length > 0;
}
function renderServices(bookings) {
  const counts = bookings.reduce((result, booking) => { result[booking.service] = (result[booking.service] || 0) + 1; return result; }, {});
  const max = Math.max(...Object.values(counts), 1);
  $('#serviceBars').innerHTML = Object.entries(serviceCatalog).map(([name, service]) => `<div class="bar-item"><div><span>${name}</span><strong>${counts[name] || 0}</strong></div><div class="bar-track"><i style="width:${((counts[name] || 0) / max) * 100}%; background:${service.color}"></i></div></div>`).join('');
  $('#servicesGrid').innerHTML = Object.entries(serviceCatalog).map(([name, service]) => `<article class="service-card"><span class="service-mark" style="background:${service.color}"></span><h3>${name}</h3><p>From ${money(service.price)}</p><span>${counts[name] || 0} bookings</span></article>`).join('');
}
function renderAppointments(bookings) {
  const query = $('#appointmentSearch').value.toLowerCase();
  const filter = $('#statusFilter').value;
  const filtered = bookings.filter((booking) => (!query || [booking.name, booking.phone, booking.service].join(' ').toLowerCase().includes(query)) && (filter === 'all' || booking.status === filter));
  $('#appointmentsRows').innerHTML = filtered.map((booking) => `<tr><td><strong>${escapeHtml(booking.name)}</strong><span class="table-note">${escapeHtml(booking.phone)}</span></td><td>${escapeHtml(booking.service)}<span class="table-note">${escapeHtml(booking.treatment)} · ${escapeHtml(booking.type)}</span></td><td>${formatDate(bookingDate(booking))}<span class="table-note">${escapeHtml(booking.time || 'Time not set')}</span></td><td>${escapeHtml(booking.payment || 'Not recorded')}</td><td><span class="status ${booking.status}">${statusLabel(booking.status)}</span></td><td class="action-buttons"><button class="row-action" data-status="confirmed" data-id="${escapeHtml(booking.id)}">Confirm</button><button class="row-action" data-status="completed" data-id="${escapeHtml(booking.id)}">Complete</button><button class="row-action danger" data-status="cancelled" data-id="${escapeHtml(booking.id)}">Cancel</button></td></tr>`).join('');
  $('#appointmentsEmpty').hidden = filtered.length > 0;
}
function renderCustomers(bookings) {
  const customers = Object.values(bookings.reduce((result, booking) => { const key = booking.phone || booking.name; result[key] ||= { ...booking, count: 0, services: new Set() }; result[key].count += 1; result[key].services.add(booking.service); return result; }, {}));
  $('#customerGrid').innerHTML = customers.length ? customers.map((customer) => `<article class="customer-card"><div class="customer-avatar">${escapeHtml(customer.name?.slice(0, 2).toUpperCase())}</div><div><h3>${escapeHtml(customer.name)}</h3><p>${escapeHtml(customer.phone)}</p><span>${customer.count} booking${customer.count === 1 ? '' : 's'} · ${escapeHtml([...customer.services].join(', '))}</span></div></article>`).join('') : '<div class="empty-state">Customers will appear after the first booking.</div>';
}
function renderPayments(bookings) {
  const active = bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status));
  const total = active.reduce((sum, booking) => sum + bookingAmount(booking), 0);
  $('#paymentSummary').innerHTML = `<article class="card card-tertiary"><p>Collected / committed</p><h3>${money(total)}</h3></article><article class="card card-secondary"><p>Paid bookings</p><h3>${active.length}</h3></article><article class="card"><p>Average booking</p><h3>${money(active.length ? total / active.length : 0)}</h3></article>`;
  $('#paymentRows').innerHTML = bookings.slice(0, 12).map((booking) => `<tr><td>${escapeHtml(booking.name)}</td><td>${escapeHtml(booking.payment || 'Not recorded')}</td><td>${escapeHtml(booking.service)}</td><td>${money(bookingAmount(booking))}</td><td><span class="status ${booking.status}">${statusLabel(booking.status)}</span></td></tr>`).join('');
}
function renderAll() { const bookings = readBookings(); renderSummary(bookings); renderUpcoming(bookings); renderAppointments(bookings); renderCustomers(bookings); renderPayments(bookings); renderServices(bookings); }
function showPage(page) { $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page)); $$('.page-view').forEach((view) => view.classList.toggle('active-view', view.id === `${page}Page`)); const meta = pageMeta[page]; if (meta) { $('.page-heading h2').textContent = meta[0]; $('#pageSubtitle').textContent = meta[1]; } $('#sidebar').classList.remove('open'); }
function showBookingDetails(id) { const booking = readBookings().find((item) => item.id === id || item.id?.toLowerCase() === id.toLowerCase()); const details = $('#bookingDetails'); const status = $('#scannerStatus'); if (!booking) { status.textContent = 'Not found'; status.className = 'scanner-status error'; details.hidden = false; details.innerHTML = '<strong>No matching booking found.</strong><span>Check the booking ID and try again.</span>'; return; } status.textContent = 'Booking found'; status.className = 'scanner-status success'; details.hidden = false; details.innerHTML = `<div><span class="detail-label">Customer</span><strong>${escapeHtml(booking.name)}</strong></div><div><span class="detail-label">Service</span><strong>${escapeHtml(booking.service)}</strong></div><div><span class="detail-label">Date</span><strong>${formatDate(bookingDate(booking))} · ${escapeHtml(booking.time)}</strong></div><div><span class="detail-label">Status</span><strong>${statusLabel(booking.status)}</strong></div>`; }
function setupScanner() { let stream; let timer; let detector; const video = $('#qrVideo'); const stop = () => { clearInterval(timer); stream?.getTracks().forEach((track) => track.stop()); stream = null; video.srcObject = null; video.classList.remove('visible'); $('#scannerPlaceholder').hidden = false; $('#startScanner').disabled = false; $('#stopScanner').disabled = true; }; $('#startScanner').addEventListener('click', async () => { if (!navigator.mediaDevices?.getUserMedia || !('BarcodeDetector' in window)) { $('#scannerStatus').textContent = 'Use ID lookup'; $('#scannerStatus').className = 'scanner-status error'; return; } try { detector = new BarcodeDetector({ formats: ['qr_code'] }); stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); video.srcObject = stream; await video.play(); video.classList.add('visible'); $('#scannerPlaceholder').hidden = true; $('#startScanner').disabled = true; $('#stopScanner').disabled = false; $('#scannerStatus').textContent = 'Scanning...'; timer = setInterval(async () => { if (video.readyState < 2) return; const codes = await detector.detect(video); if (codes[0]?.rawValue) { $('#bookingCode').value = codes[0].rawValue; showBookingDetails(codes[0].rawValue); stop(); } }, 400); } catch { $('#scannerStatus').textContent = 'Camera permission needed'; $('#scannerStatus').className = 'scanner-status error'; } }); $('#stopScanner').addEventListener('click', stop); $('#bookingLookupForm').addEventListener('submit', (event) => { event.preventDefault(); showBookingDetails($('#bookingCode').value.trim()); }); }
function exportCsv() { const headings = ['Name', 'Phone', 'Service', 'Date', 'Time', 'Payment', 'Status']; const rows = readBookings().map((booking) => [booking.name, booking.phone, booking.service, bookingDate(booking), booking.time, booking.payment, booking.status]); const csv = [headings, ...rows].map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'royal-barber-bookings.csv'; link.click(); URL.revokeObjectURL(link.href); }

$$('.nav-item').forEach((item) => item.addEventListener('click', () => showPage(item.dataset.page)));
$$('[data-page-link]').forEach((item) => item.addEventListener('click', () => showPage(item.dataset.pageLink)));
$('#sidebarToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#appointmentSearch').addEventListener('input', () => renderAppointments(readBookings()));
$('#statusFilter').addEventListener('change', () => renderAppointments(readBookings()));
$('#exportBookings').addEventListener('click', exportCsv);
document.addEventListener('click', (event) => { const action = event.target.closest('[data-status]'); if (action) { saveBookingStatus(action.dataset.id, action.dataset.status); renderAll(); } });
$('#settingsForm').addEventListener('submit', (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); data.showCompleted = event.currentTarget.showCompleted.checked; localStorage.setItem('dashboardSettings', JSON.stringify(data)); $('#settingsMessage').textContent = 'Preferences saved.'; setTimeout(() => { $('#settingsMessage').textContent = ''; }, 2500); });
try { const settings = JSON.parse(localStorage.getItem('dashboardSettings')); if (settings) { Object.entries(settings).forEach(([key, value]) => { const field = $(`[name="${key}"]`); if (field) field.type === 'checkbox' ? field.checked = value : field.value = value; }); } } catch { /* Use defaults when settings are unavailable. */ }
setupScanner(); renderAll();
