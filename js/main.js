/* ============================================
   DR. DIABETES CARE - MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                navbar.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });
    
    // Tab functionality for shop
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Online consultation toggle
    const onlineConsult = document.getElementById('onlineConsult');
    if (onlineConsult) {
        onlineConsult.addEventListener('change', function() {
            const bookBtn = document.querySelector('.hero-actions .btn-primary');
            if (this.checked) {
                if (bookBtn) {
                    bookBtn.href = 'appointment.html?type=online';
                    bookBtn.innerHTML = '<i class="fas fa-video"></i> Book Video Consultation';
                }
            } else {
                if (bookBtn) {
                    bookBtn.href = 'appointment.html';
                    bookBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Appointment';
                }
            }
        });
    }
    
    // Glucose Chart (Chart.js)
    const glucoseCtx = document.getElementById('glucoseChart');
    if (glucoseCtx) {
        new Chart(glucoseCtx, {
            type: 'line',
            data: {
                labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
                datasets: [{
                    label: 'Blood Glucose (mg/dL)',
                    data: [110, 124, 142, 138, 125, 118, 132, 128],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#059669',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false, min: 60, max: 200, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }
    
    // Dashboard glucose chart
    const dashboardGlucoseCtx = document.getElementById('dashboardGlucoseChart');
    if (dashboardGlucoseCtx) {
        new Chart(dashboardGlucoseCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Fasting',
                    data: [110, 115, 108, 122, 118, 105, 112],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Post-Meal',
                    data: [145, 152, 138, 160, 148, 135, 142],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } }
                },
                scales: {
                    y: { beginAtZero: false, min: 60, max: 200, grid: { color: 'rgba(0,0,0,0.04)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    // Add to cart functionality
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.background = '#22c55e';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 1500);
        });
    });
    
    // Appointment form handling
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formContainer = document.querySelector('.form-container');
            formContainer.innerHTML = `
                <div class="success-message" style="text-align:center;padding:50px 20px;">
                    <i class="fas fa-check-circle" style="font-size:3.5rem;color:var(--success);margin-bottom:16px;"></i>
                    <h3 style="font-family:var(--font-heading);font-size:1.4rem;margin-bottom:10px;">Appointment Requested!</h3>
                    <p style="color:var(--text-light);margin-bottom:8px;">We will confirm via SMS and email shortly.</p>
                    <p style="font-weight:600;">Reference: APT-${Date.now().toString().slice(-6)}</p>
                </div>
            `;
        });
    }
    
    // Time slot selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('booked')) return;
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            const timeInput = document.getElementById('appointmentTime');
            if (timeInput) {
                timeInput.value = this.getAttribute('data-time');
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .product-card, .testimonial-card, .lab-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

