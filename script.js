// Payment App URLs and Opening Functions
const paymentApps = {
    wave: {
        name: 'Wave Mobile Money',
        iosApp: 'wave://',
        androidApp: 'com.wave.personal',
        webUrl: 'https://www.wave.com/en/gm',
        appStoreUrl: 'https://apps.apple.com/gm/app/wave-money-transfer/id1529141062',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wave.personal'
    },
    afrimoney: {
        name: 'Afrimoney',
        iosApp: 'afrimoney://',
        androidApp: 'com.afrimoney.app',
        webUrl: 'https://www.afrimoney.com',
        appStoreUrl: 'https://apps.apple.com/gm/app/afrimoney/id1234567890',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.afrimoney.app'
    },
    qmoney: {
        name: 'Qmoney',
        iosApp: 'qmoney://',
        androidApp: 'com.qmoney.app',
        webUrl: 'https://www.qmoney.gm',
        appStoreUrl: 'https://apps.apple.com/gm/app/qmoney/id1234567890',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.qmoney.app'
    },
    aps: {
        name: 'APS Mobile Money',
        iosApp: 'apsmoney://',
        androidApp: 'com.aps.moneytransfer',
        webUrl: 'https://www.apsmoneytransfer.com',
        appStoreUrl: 'https://apps.apple.com/gm/app/aps-mobile-money/id1234567890',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aps.moneytransfer'
    },
    yonna: {
        name: 'Yonna Wallet',
        iosApp: 'yonna://',
        androidApp: 'com.yonna.wallet',
        webUrl: 'https://www.yonnawallet.com',
        appStoreUrl: 'https://apps.apple.com/gm/app/yonna-wallet/id1234567890',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.yonna.wallet'
    }
};

// Open Payment App
function openPaymentApp(appId) {
    const app = paymentApps[appId];
    if (!app) return;

    // Detect if mobile or desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        if (isIOS) {
            // Try opening iOS app, fallback to App Store
            window.location.href = app.iosApp;
            setTimeout(() => {
                window.location.href = app.appStoreUrl;
            }, 1500);
        } else if (isAndroid) {
            // Try opening Android app, fallback to Play Store
            window.location.href = `intent://launch#Intent;package=${app.androidApp};end`;
            setTimeout(() => {
                window.location.href = app.playStoreUrl;
            }, 1500);
        }
    } else {
        // Desktop - open web version
        window.open(app.webUrl, '_blank');
    }
}

// Select radio button and open app
function selectAndOpenApp(radioId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const radioButton = document.getElementById(radioId);
    if (radioButton) {
        radioButton.checked = true;
        radioButton.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Determine which app to open based on radio ID
        let appId = radioId.replace('hs', '').toLowerCase();
        openPaymentApp(appId);
    }
}

// Set minimum booking date to today
function initializeDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    document.getElementById('hsDate').min = today;
}

// Show/Hide Sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

// Service Prices
const servicePrices = {
    classic: { ordinary: 200, vip: 300 },
    fade: { ordinary: 250, vip: 350 },
    beard: { ordinary: 150, vip: 175 },
    package: { ordinary: 3500, vip: 5000 },
    spray: { ordinary: 400, vip: 500 }
};

const homeServicePrices = {
    classic: { ordinary: 500, vip: 1000 },
    fade: { ordinary: 1000, vip: 1500 },
    beard: { ordinary: 700, vip: 900 },
    package: { ordinary: 3000, vip: 6000 },
    spray: { ordinary: 1000, vip: 1500 }
};

// Get service display names
function getServiceName(serviceId) {
    const names = {
        classic: 'Classic Haircut',
        fade: 'Fade & Line-up',
        beard: 'Beard Trim & Shape',
        package: 'Full Grooming Package',
        spray: 'Hair Spray Service'
    };
    return names[serviceId] || '';
}

// Update booking form price
function updatePrice() {
    const service = document.getElementById('service').value;
    const treatment = document.querySelector('input[name="treatment"]:checked')?.value;
    const location = document.querySelector('input[name="location"]:checked')?.value;
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    if (!service || !treatment || !location) {
        document.getElementById('bookingSummary').style.display = 'none';
        return;
    }

    const treatmentType = treatment === 'VIP' ? 'vip' : 'ordinary';
    let price = servicePrices[service][treatmentType];

    if (location === 'Home Service') {
        price += 500;
    }

    // Update summary
    document.getElementById('summaryService').textContent = getServiceName(service) + ` (${treatment})`;
    document.getElementById('summaryTreatment').textContent = treatment;
    document.getElementById('summaryLocation').textContent = location;
    document.getElementById('summaryDateTime').textContent = bookingDate && bookingTime 
        ? `${formatDate(bookingDate)} at ${bookingTime}` 
        : 'Not selected';
    document.getElementById('summaryPayment').textContent = payment || 'Not selected';
    document.getElementById('summaryPrice').textContent = price.toLocaleString() + ' GMD';

    document.getElementById('bookingSummary').style.display = 'block';
}

// Update home service price
function updateHomeServicePrice() {
    const service = document.getElementById('hsService').value;
    const treatment = document.querySelector('input[name="treatment"]:checked')?.value;
    const hsDate = document.getElementById('hsDate').value;
    const hsTime = document.getElementById('hsTime').value;
    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    if (!service || !treatment) {
        document.getElementById('homeServiceSummary').style.display = 'none';
        return;
    }

    const treatmentType = treatment === 'VIP' ? 'vip' : 'ordinary';
    const price = homeServicePrices[service][treatmentType];

    // Update summary
    document.getElementById('hsSummaryService').textContent = getServiceName(service) + ` (${treatment})`;
    document.getElementById('hsSummaryTreatment').textContent = treatment;
    document.getElementById('hsSummaryLocation').textContent = 'Your Home (New Yundum)';
    document.getElementById('hsSummaryDateTime').textContent = hsDate && hsTime 
        ? `${formatDate(hsDate)} at ${hsTime}` 
        : 'Not selected';
    document.getElementById('hsSummaryPayment').textContent = payment || 'Not selected';
    document.getElementById('hsSummaryPrice').textContent = price.toLocaleString() + ' GMD';

    document.getElementById('homeServiceSummary').style.display = 'block';
}

// Format date display
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', options);
}

// Handle booking form submission
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const service = document.getElementById('service').value;
            const treatment = document.querySelector('input[name="treatment"]:checked').value;
            const location = document.querySelector('input[name="location"]:checked').value;
            const bookingDate = document.getElementById('bookingDate').value;
            const bookingTime = document.getElementById('bookingTime').value;
            const payment = document.querySelector('input[name="payment"]:checked').value;
            const notes = document.getElementById('notes').value;

            // Validate all fields
            if (!fullName || !phone || !service || !treatment || !location || !bookingDate || !bookingTime || !payment) {
                alert('Please fill in all required fields');
                return;
            }

            // Create booking confirmation
            const bookingData = {
                name: fullName,
                phone: phone,
                service: getServiceName(service),
                treatment: treatment,
                location: location,
                date: formatDate(bookingDate),
                time: bookingTime,
                payment: payment,
                notes: notes,
                bookedAt: new Date().toLocaleString()
            };

            // Save to localStorage
            let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            // Show success message
            document.getElementById('successMessage').classList.add('show');
            
            // Reset form
            bookingForm.reset();
            document.getElementById('bookingSummary').style.display = 'none';

            // Hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('successMessage').classList.remove('show');
            }, 5000);

            console.log('Booking saved:', bookingData);
            alert(`Booking confirmed for ${fullName}!\n\nDate: ${bookingData.date}\nTime: ${bookingTime}\nService: ${bookingData.service}\nPayment: ${payment}\n\nWe'll see you soon!`);
        });
    }

    // Handle home service form submission
    const homeServiceForm = document.getElementById('homeServiceForm');
    if (homeServiceForm) {
        homeServiceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullName = document.getElementById('hsFullName').value;
            const phone = document.getElementById('hsPhone').value;
            const address = document.getElementById('hsAddress').value;
            const service = document.getElementById('hsService').value;
            const treatment = document.querySelector('input[name="treatment"]:checked').value;
            const hsDate = document.getElementById('hsDate').value;
            const hsTime = document.getElementById('hsTime').value;
            const payment = document.querySelector('input[name="payment"]:checked').value;
            const notes = document.getElementById('hsNotes').value;

            // Validate all fields
            if (!fullName || !phone || !address || !service || !treatment || !hsDate || !hsTime || !payment) {
                alert('Please fill in all required fields');
                return;
            }

            // Create booking confirmation
            const homeServiceData = {
                name: fullName,
                phone: phone,
                address: address,
                service: getServiceName(service),
                treatment: treatment,
                date: formatDate(hsDate),
                time: hsTime,
                payment: payment,
                notes: notes,
                type: 'Home Service',
                bookedAt: new Date().toLocaleString()
            };

            // Save to localStorage
            let homeServiceBookings = JSON.parse(localStorage.getItem('homeServiceBookings')) || [];
            homeServiceBookings.push(homeServiceData);
            localStorage.setItem('homeServiceBookings', JSON.stringify(homeServiceBookings));

            // Show success message
            document.getElementById('homeServiceSuccess').classList.add('show');
            
            // Reset form
            homeServiceForm.reset();
            document.getElementById('homeServiceSummary').style.display = 'none';

            // Hide success message after 10 seconds
            setTimeout(() => {
                document.getElementById('homeServiceSuccess').classList.remove('show');
            }, 10000);

            console.log('Home service booking saved:', homeServiceData);
            alert(`Home Service Booking confirmed for ${fullName}!\n\nDate: ${homeServiceData.date}\nTime: ${hsTime}\nService: ${homeServiceData.service}\nLocation: ${address}\nPayment: ${payment}\n\nOur barber will visit your home!`);
        });
    }
});

// Initialize event listeners for real-time updates
document.addEventListener('DOMContentLoaded', function() {
    // Real-time price updates for salon booking
    const bookingFormElements = ['service', 'treatment', 'location', 'bookingDate', 'bookingTime', 'payment'];
    bookingFormElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updatePrice);
        }
    });

    // Real-time price updates for home service
    const homeServiceElements = ['hsService', 'treatment', 'hsDate', 'hsTime', 'payment'];
    homeServiceElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateHomeServicePrice);
        }
    });
});