// API Base URL
const API_BASE_URL = '/api';

// Global variables
let currentUser = null;
let authToken = null;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const complaintForm = document.getElementById('complaintForm');

// Navigation elements
const navDashboard = document.getElementById('navDashboard');
const navNewComplaint = document.getElementById('navNewComplaint');
const navMyComplaints = document.getElementById('navMyComplaints');
const sidebarDashboard = document.getElementById('sidebarDashboard');
const sidebarNewComplaint = document.getElementById('sidebarNewComplaint');
const sidebarMyComplaints = document.getElementById('sidebarMyComplaints');

// Content sections
const dashboardContent = document.getElementById('dashboardContent');
const newComplaintContent = document.getElementById('newComplaintContent');
const myComplaintsContent = document.getElementById('myComplaintsContent');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (authToken && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            if (currentUser.role === 'student') {
                window.location.href = 'student-dashboard.html';
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                showLogin();
            }
        } catch (e) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLogin();
        }
    } else {
        showLogin();
    }
}

function setupEventListeners() {
    // Login form
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Register form
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Show register page
    const showReg = document.getElementById('showRegister');
    if (showReg) showReg.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });

    // Show login page
    const showLog = document.getElementById('showLogin');
    if (showLog) showLog.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
}

// Show login page
function showLogin() {
    if (loginPage) loginPage.classList.remove('hidden');
    if (registerPage) registerPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
}

// Show register page
function showRegister() {
    if (loginPage) loginPage.classList.add('hidden');
    if (registerPage) registerPage.classList.remove('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    loginPage.classList.add('hidden');
    registerPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');

    // Update user info
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.full_name}`;
    document.getElementById('sidebarUserName').textContent = currentUser.full_name;
    document.getElementById('sidebarRoomNumber').textContent = `Room: ${currentUser.room_number || 'N/A'}`;

    // Load dashboard data
    loadDashboardData();
    loadCategories();
}

// Show specific section
function showSection(section) {
    // Hide all sections
    dashboardContent.classList.add('hidden');
    newComplaintContent.classList.add('hidden');
    myComplaintsContent.classList.add('hidden');

    // Remove active class from all nav items
    navDashboard.classList.remove('active');
    navNewComplaint.classList.remove('active');
    navMyComplaints.classList.remove('active');
    sidebarDashboard.classList.remove('active');
    sidebarNewComplaint.classList.remove('active');
    sidebarMyComplaints.classList.remove('active');

    // Show selected section
    switch (section) {
        case 'dashboard':
            dashboardContent.classList.remove('hidden');
            navDashboard.classList.add('active');
            sidebarDashboard.classList.add('active');
            loadDashboardData();
            break;
        case 'newComplaint':
            newComplaintContent.classList.remove('hidden');
            navNewComplaint.classList.add('active');
            sidebarNewComplaint.classList.add('active');
            loadCategories();
            break;
        case 'myComplaints':
            myComplaintsContent.classList.remove('hidden');
            navMyComplaints.classList.add('active');
            sidebarMyComplaints.classList.add('active');
            loadCategories();
            loadMyComplaints();
            break;
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!username || !password) {
        showAlert('Please enter both username and password', 'danger');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1000);
        } else {
            // Show detailed error message
            let errorMessage = 'Login failed';
            if (data.message) {
                errorMessage = data.message;
            } else if (data.error) {
                errorMessage = data.error;
            }
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            showAlert('Cannot connect to server. Please check if the server is running.', 'danger');
        } else {
            showAlert(`Login failed: ${error.message}. Please try again.`, 'danger');
        }
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const full_name = document.getElementById('regFullName').value;
    const room_number = document.getElementById('regRoomNumber').value;
    const phone_number = document.getElementById('regPhoneNumber').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validate inputs
    if (!username || !email || !full_name || !room_number || !password) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                full_name,
                role: 'student',
                room_number,
                phone_number,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Registration successful! Please login.', 'success');
            showLogin();
            registerForm.reset();
        } else {
            // Show detailed error message
            let errorMessage = 'Registration failed';
            if (data.message) {
                errorMessage = data.message;
            } else if (data.error) {
                errorMessage = data.error;
            }
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            showAlert('Cannot connect to server. Please check if the server is running.', 'danger');
        } else {
            showAlert(`Registration failed: ${error.message}. Please try again.`, 'danger');
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;

    showAlert('Logged out successfully', 'success');
    showLogin();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const complaints = data.complaints;

            // Calculate statistics
            const total = complaints.length;
            const pending = complaints.filter(c => c.status_name === 'Pending').length;
            const inProgress = complaints.filter(c => c.status_name === 'In Progress').length;
            const resolved = complaints.filter(c => c.status_name === 'Resolved').length;

            // Update statistics
            document.getElementById('totalComplaints').textContent = total;
            document.getElementById('pendingComplaints').textContent = pending;
            document.getElementById('inProgressComplaints').textContent = inProgress;
            document.getElementById('resolvedComplaints').textContent = resolved;

            // Display recent complaints
            displayRecentComplaints(complaints.slice(0, 5));
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Failed to load dashboard data', 'danger');
    }
}

// Display recent complaints
function displayRecentComplaints(complaints) {
    const container = document.getElementById('recentComplaints');

    if (complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No complaints yet. Submit your first complaint!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = complaints.map(complaint => `
        <div class="card complaint-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${complaint.title}</h5>
                        <p class="card-text text-muted small mb-2">
                            <i class="fas fa-folder"></i> ${complaint.category_name} |
                            <i class="fas fa-map-marker-alt"></i> ${complaint.location || 'N/A'} |
                            <i class="fas fa-calendar"></i> ${formatDate(complaint.created_at)}
                        </p>
                    </div>
                    <span class="status-badge status-${complaint.status_name.toLowerCase().replace(' ', '-')}">
                        ${complaint.status_name}
                    </span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="priority-${complaint.priority}">
                        <i class="fas fa-flag"></i> ${complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                    </span>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${complaint.complaint_id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const categories = data.categories;

            // Update category dropdown in complaint form
            const categorySelect = document.getElementById('category');
            const currentValue = categorySelect.value;
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => `<option value="${cat.category_id}">${cat.category_name}</option>`).join('');
            categorySelect.value = currentValue;

            // Update category filter
            const filterCategory = document.getElementById('filterCategory');
            const currentFilter = filterCategory.value;
            filterCategory.innerHTML = '<option value="">All Categories</option>' +
                categories.map(cat => `<option value="${cat.category_name}">${cat.category_name}</option>`).join('');
            filterCategory.value = currentFilter;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Handle submit complaint
async function handleSubmitComplaint(e) {
    e.preventDefault();

    const category_id = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];

    if (!category_id || !title || !description) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('category_id', category_id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    formData.append('location', location);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint submitted successfully!', 'success');
            complaintForm.reset();
            showSection('myComplaints');
        } else {
            showAlert(data.message || 'Failed to submit complaint', 'danger');
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showAlert('Failed to submit complaint. Please try again.', 'danger');
    }
}

// Load my complaints
async function loadMyComplaints() {
    const statusFilter = document.getElementById('filterStatus').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const priorityFilter = document.getElementById('filterPriority').value;

    try {
        let url = `${API_BASE_URL}/complaints`;
        const params = new URLSearchParams();

        if (statusFilter) params.append('status', statusFilter);
        if (categoryFilter) params.append('category', categoryFilter);
        if (priorityFilter) params.append('priority', priorityFilter);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayComplaintsList(data.complaints);
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Failed to load complaints', 'danger');
    }
}

// Display complaints list
function displayComplaintsList(complaints) {
    const container = document.getElementById('complaintsList');

    if (complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No complaints found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = complaints.map(complaint => `
        <div class="card complaint-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${complaint.title}</h5>
                        <p class="card-text text-muted small mb-2">
                            <i class="fas fa-folder"></i> ${complaint.category_name} |
                            <i class="fas fa-map-marker-alt"></i> ${complaint.location || 'N/A'} |
                            <i class="fas fa-calendar"></i> ${formatDate(complaint.created_at)}
                        </p>
                        ${complaint.description ? `<p class="card-text">${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</p>` : ''}
                    </div>
                    <span class="status-badge status-${complaint.status_name.toLowerCase().replace(' ', '-')}">
                        ${complaint.status_name}
                    </span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="priority-${complaint.priority}">
                        <i class="fas fa-flag"></i> ${complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                    </span>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${complaint.complaint_id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${complaint.status_name === 'Pending' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteComplaint(${complaint.complaint_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// View complaint details
async function viewComplaintDetails(complaintId) {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const complaint = data.complaint;
            const history = data.history || [];

            const modalBody = document.getElementById('complaintModalBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <h5>${complaint.title}</h5>
                        <p class="text-muted mb-3">
                            <i class="fas fa-folder"></i> ${complaint.category_name} |
                            <i class="fas fa-map-marker-alt"></i> ${complaint.location || 'N/A'} |
                            <i class="fas fa-calendar"></i> ${formatDate(complaint.created_at)}
                        </p>
                        <p><strong>Description:</strong></p>
                        <p>${complaint.description}</p>
                        ${complaint.image_url ? `
                            <p><strong>Image:</strong></p>
                            <img src="${complaint.image_url}" alt="Complaint Image" class="complaint-image">
                        ` : ''}
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">Status</h6>
                                <span class="status-badge status-${complaint.status_name.toLowerCase().replace(' ', '-')} mb-3">
                                    ${complaint.status_name}
                                </span>
                                <h6 class="card-title mt-3">Priority</h6>
                                <span class="priority-${complaint.priority}">
                                    ${complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                                </span>
                                ${complaint.assigned_staff_name ? `
                                    <h6 class="card-title mt-3">Assigned Staff</h6>
                                    <p>${complaint.assigned_staff_name}</p>
                                ` : ''}
                                ${complaint.resolved_at ? `
                                    <h6 class="card-title mt-3">Resolved At</h6>
                                    <p>${formatDate(complaint.resolved_at)}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                ${history.length > 0 ? `
                    <h6 class="mt-4 mb-3">Complaint History</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Changed By</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.map(h => `
                                    <tr>
                                        <td>${formatDate(h.changed_at)}</td>
                                        <td><span class="status-badge status-${h.status_name.toLowerCase().replace(' ', '-')}">${h.status_name}</span></td>
                                        <td>${h.changed_by_name}</td>
                                        <td>${h.notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            `;

            const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading complaint details:', error);
        showAlert('Failed to load complaint details', 'danger');
    }
}

// Delete complaint
async function deleteComplaint(complaintId) {
    if (!confirm('Are you sure you want to delete this complaint?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint deleted successfully', 'success');
            loadMyComplaints();
        } else {
            showAlert(data.message || 'Failed to delete complaint', 'danger');
        }
    } catch (error) {
        console.error('Error deleting complaint:', error);
        showAlert('Failed to delete complaint', 'danger');
    }
}

// Show alert
function showAlert(message, type) {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
            .custom-toast { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 15px 20px; display: flex; align-items: center; gap: 15px; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 350px; min-width: 250px; }
            .custom-toast.show { transform: translateX(0); }
            .custom-toast .icon { font-size: 1.5rem; }
            .custom-toast.success .icon { color: #10b981; }
            .custom-toast.danger .icon { color: #ef4444; }
            .custom-toast.info .icon { color: #3b82f6; }
            .custom-toast.warning .icon { color: #f59e0b; }
            .custom-toast .message { flex-grow: 1; font-weight: 600; color: #1f2937; font-size: 0.95rem; }
            .custom-toast .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 0; font-size: 1.2rem; transition: color 0.2s; }
            .custom-toast .close-btn:hover { color: #1f2937; }
        `;
        document.head.appendChild(style);
    }

    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger' || type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'error') type = 'danger';

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <div class="icon"><i class="fas ${iconClass}"></i></div>
        <div class="message">${message}</div>
        <button class="close-btn" onclick="this.parentElement.classList.remove('show'); setTimeout(function(){ this.parentElement.remove(); }.bind(this), 400)"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(function() { toast.classList.add('show'); }, 10);
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { if (toast.parentElement) toast.remove(); }, 400);
    }, 4000);
}
