const API_BASE = (() => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname.includes('vercel.app') || hostname.includes('now.sh')) {
    return 'https://diabetes-care-api.vercel.app/api';
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return '/api';
})();

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const config = { ...options, headers };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url, config);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  // Auth
  register: (body) => api.request('/auth/register', { method: 'POST', body }),
  login: (body) => api.request('/auth/login', { method: 'POST', body }),
  me: () => api.request('/auth/me'),

  // Appointments
  bookAppointment: (body) => api.request('/appointments', { method: 'POST', body }),
  myAppointments: () => api.request('/appointments/my'),
  cancelAppointment: (id) => api.request(`/appointments/${id}`, { method: 'DELETE' }),

  // Reports
  myReports: () => api.request('/reports/my'),

  // Patient Dashboard
  dashboard: () => api.request('/patients/dashboard'),
  patientHistory: () => api.request('/patients/history'),
  logGlucose: (body) => api.request('/patients/glucose', { method: 'POST', body }),
  glucoseHistory: (days) => api.request(`/patients/glucose?days=${days || 30}`),
  updateProfile: (body) => api.request('/patients/profile', { method: 'PATCH', body }),

  // Doctor
  doctorProfile: () => api.request('/doctors/me'),
  doctorPatients: () => api.request('/doctors/patients'),
  doctorPatientDetail: (id) => api.request(`/doctors/patients/${id}`),
  doctorPatientHistory: (id) => api.request(`/doctors/patients/${id}/history`),
  createPrescription: (body) => api.request('/doctors/prescriptions', { method: 'POST', body }),
  createMedicalRecord: (body) => api.request('/doctors/medical-records', { method: 'POST', body }),
  requestLabTest: (body) => api.request('/doctors/lab-requests', { method: 'POST', body }),
  doctorAppointments: () => api.request('/doctors/my-appointments'),
  doctorVideoSessions: () => api.request('/doctors/video-sessions'),

  // Lab Tests
  pendingLabTests: () => api.request('/lab-tests/pending'),
  allLabTests: (params) => api.request(`/lab-tests${params || ''}`),
  labTestDetail: (id) => api.request(`/lab-tests/${id}`),
  updateLabResults: (id, body) => api.request(`/lab-tests/${id}/results`, { method: 'PATCH', body }),
  updateLabStatus: (id, body) => api.request(`/lab-tests/${id}/status`, { method: 'PATCH', body }),
  uploadLabFile: (id, formData) => api.request(`/lab-tests/${id}/upload`, { method: 'PATCH', body: formData, headers: {} }),

  // Video Sessions
  myVideoSessions: () => api.request('/video-sessions/my'),
  joinVideoSession: (id) => api.request(`/video-sessions/${id}/join`),
  updateVideoStatus: (id, body) => api.request(`/video-sessions/${id}/status`, { method: 'PATCH', body }),
  adminCreateVideoSession: (body) => api.request('/video-sessions', { method: 'POST', body }),
  adminVideoSessions: () => api.request('/video-sessions'),

  // Admin
  adminStats: () => api.request('/admin/stats'),
  allPatients: (search) => api.request(`/admin/patients${search ? '?search=' + encodeURIComponent(search) : ''}`),
  patientDetail: (id) => api.request(`/admin/patients/${id}`),
  allDoctors: () => api.request('/admin/doctors'),
  allAppointments: (params) => api.request(`/admin/appointments${params || ''}`),
  allLabTests: (params) => api.request(`/admin/lab-tests${params || ''}`),
  allPrescriptions: () => api.request('/admin/prescriptions'),
  createDoctor: (body) => api.request('/admin/create-doctor', { method: 'POST', body }),
  createLabTech: (body) => api.request('/admin/create-lab-tech', { method: 'POST', body }),
  assignDoctor: (id, body) => api.request(`/admin/patients/${id}/assign-doctor`, { method: 'PATCH', body }),
  updateAppointmentStatus: (id, body) => api.request(`/appointments/${id}/status`, { method: 'PATCH', body }),
  allReports: () => api.request('/reports/all'),
  uploadReport: (formData) => api.request('/reports/upload', { method: 'POST', body: formData, headers: {} })
};

// Auth helpers
function setToken(token) { localStorage.setItem('token', token); }
function getToken() { return localStorage.getItem('token'); }
function removeToken() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }
function isDoctor() { const u = getUser(); return u && u.role === 'doctor'; }
function isLab() { const u = getUser(); return u && u.role === 'lab'; }
function isPatient() { const u = getUser(); return u && u.role === 'patient'; }

// Redirect based on role
function redirectByRole() {
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return; }
  if (user.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (user.role === 'doctor') {
    window.location.href = 'doctor-dashboard.html';
  } else if (user.role === 'lab') {
    window.location.href = 'lab-dashboard.html';
  } else {
    window.location.href = 'patient-portal.html';
  }
}

// Protect route
function protectRoute(allowedRoles) {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
  const user = getUser();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = 'index.html'; return false;
  }
  return true;
}

// Update nav based on auth
function updateNavAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  const user = getUser();
  if (user) {
    let dashLink = 'patient-portal.html';
    if (user.role === 'admin') dashLink = 'admin-dashboard.html';
    else if (user.role === 'doctor') dashLink = 'doctor-dashboard.html';
    else if (user.role === 'lab') dashLink = 'lab-dashboard.html';
    navActions.innerHTML = `
      <a href="${dashLink}" class="btn btn-primary">${user.fullName.split(' ')[0]}</a>
      <a href="#" class="btn btn-outline" onclick="logout();return false;">Logout</a>
    `;
  }
}

function logout() {
  removeToken();
  window.location.href = 'index.html';
}

// Format helpers
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '-';
  return timeStr;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Show alert
function showAlert(message, type = 'success') {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 20px;border-radius:8px;background:' + (type==='success'?'#22c55e':'#ef4444') + ';color:#fff;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}
