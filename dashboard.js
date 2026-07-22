const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.querySelector('.page-heading h2');
const pageSubtitle = document.querySelector('.page-heading p');
const sidebar = document.querySelector('.sidebar');
const toggleButton = document.getElementById('sidebarToggle');

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

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    sidebar.classList.remove('open');
  }
});
