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

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    sidebar.classList.remove('open');
  }
});
