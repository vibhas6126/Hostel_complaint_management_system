// API Base URL
const API_BASE_URL = '/api';

// Global variables
let currentUser = null;
let authToken = null;
let categoryChart = null;
let statusChart = null;
let trendsChart = null;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');

// Navigation elements
const navDashboard = document.getElementById('navDashboard');
const navComplaints = document.getElementById('navComplaints');
const navStaff = document.getElementById('navStaff');
const navUsers = document.getElementById('navUsers');
const navStats = document.getElementById('navStats');

const sidebarDashboard = document.getElementById('sidebarDashboard');
const sidebarComplaints = document.getElementById('sidebarComplaints');
const sidebarStaff = document.getElementById('sidebarStaff');
const sidebarUsers = document.getElementById('sidebarUsers');
const sidebarStats = document.getElementById('sidebarStats');

// Content sections
const dashboardContent = document.getElementById('dashboardContent');
const complaintsContent = document.getElementById('complaintsContent');
const staffContent = document.getElementById('staffContent');
const usersContent = document.getElementById('usersContent');
const statsContent = document.getElementById('statsContent');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Debug: Check if elements exist
    console.log('DOM Loaded');
    console.log('Login Page:', document.getElementById('loginPage'));
    console.log('Register Page:', document.getElementById('registerPage'));
    console.log('Show Admin Register Link:', document.getElementById('showAdminRegister'));

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
            if (currentUser.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
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

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Show register page
    const showReg1 = document.getElementById('showRegister');
    const showReg2 = document.getElementById('showAdminRegister');
    if (showReg1) showReg1.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    if (showReg2) showReg2.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });

    // Show login page
    const showLog = document.getElementById('showLogin');
    if (showLog) showLog.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
}


// Show login page
function showLogin() {
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
}

// Show register page
function showRegister() {
    loginPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
}

// Show login page
function showLogin() {
    if (loginPage) loginPage.classList.remove('hidden');
    if (typeof registerPage !== 'undefined' && registerPage) registerPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
}

// Show register page
function showRegister() {
    if (loginPage) loginPage.classList.add('hidden');
    if (typeof registerPage !== 'undefined' && registerPage) registerPage.classList.remove('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');

    // Update user info
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.full_name}`;
    document.getElementById('sidebarUserName').textContent = currentUser.full_name;

    // Load dashboard data
    loadDashboardData();
}

// Show specific section
function showSection(section) {
    // Hide all sections
    dashboardContent.classList.add('hidden');
    complaintsContent.classList.add('hidden');
    staffContent.classList.add('hidden');
    usersContent.classList.add('hidden');
    statsContent.classList.add('hidden');

    // Remove active class from all nav items
    navDashboard.classList.remove('active');
    navComplaints.classList.remove('active');
    navStaff.classList.remove('active');
    navUsers.classList.remove('active');
    navStats.classList.remove('active');
    sidebarDashboard.classList.remove('active');
    sidebarComplaints.classList.remove('active');
    sidebarStaff.classList.remove('active');
    sidebarUsers.classList.remove('active');
    sidebarStats.classList.remove('active');

    // Show selected section
    switch (section) {
        case 'dashboard':
            dashboardContent.classList.remove('hidden');
            navDashboard.classList.add('active');
            sidebarDashboard.classList.add('active');
            loadDashboardData();
            break;
        case 'complaints':
            complaintsContent.classList.remove('hidden');
            navComplaints.classList.add('active');
            sidebarComplaints.classList.add('active');
            loadCategories();
            loadComplaints();
            break;
        case 'staff':
            staffContent.classList.remove('hidden');
            navStaff.classList.add('active');
            sidebarStaff.classList.add('active');
            loadStaff();
            break;
        case 'users':
            usersContent.classList.remove('hidden');
            navUsers.classList.add('active');
            sidebarUsers.classList.add('active');
            loadUsers();
            break;
        case 'stats':
            statsContent.classList.remove('hidden');
            navStats.classList.add('active');
            sidebarStats.classList.add('active');
            loadStatistics();
            break;
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    console.log('handleLogin called with data:', {
        username: document.getElementById('username')?.value,
        password: document.getElementById('password')?.value
    });

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
            if (data.user.role !== 'admin') {
                showAlert('Access denied. Admin privileges required.', 'danger');
                return;
            }

            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
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
    console.log('handleRegister called with data:', {
        username: document.getElementById('regUsername')?.value,
        email: document.getElementById('regEmail')?.value,
        full_name: document.getElementById('regFullName')?.value
    });

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const full_name = document.getElementById('regFullName').value;
    const phone_number = document.getElementById('regPhoneNumber').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validate inputs
    if (!username || !email || !full_name || !password) {
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
        console.log('Making registration API call');
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                full_name,
                role: 'admin', // Force role to admin for admin registration
                phone_number,
                password
            })
        });
        console.log('Registration API response status:', response.status);

        const data = await response.json();

        if (data.success) {
            showAlert('Registration successful! Please login.', 'success');
            showLogin();
            document.getElementById('registerForm').reset();
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
        const response = await fetch(`${API_BASE_URL}/stats/overview`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const stats = data.stats;

            // Update quick stats
            document.getElementById('totalComplaints').textContent = stats.totals.total_complaints || 0;
            document.getElementById('pendingComplaints').textContent = stats.totals.pending_complaints || 0;
            document.getElementById('inProgressComplaints').textContent = stats.totals.in_progress_complaints || 0;
            document.getElementById('resolvedComplaints').textContent = stats.totals.resolved_complaints || 0;

            // Update charts
            updateCategoryChart(stats.category);
            updateStatusChart(stats.status);

            // Display recent complaints
            displayRecentComplaints(stats.recent_complaints);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Failed to load dashboard data', 'danger');
    }
}

// Update category chart
function updateCategoryChart(categoryData) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) {
        categoryChart.destroy();
    }

    const labels = categoryData.map(item => item.category_name);
    const data = categoryData.map(item => item.count);

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#e94560',
                    '#0f3460',
                    '#f39c12',
                    '#27ae60',
                    '#3498db',
                    '#9b59b6',
                    '#1abc9c',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update status chart
function updateStatusChart(statusData) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    if (statusChart) {
        statusChart.destroy();
    }

    const labels = statusData.map(item => item.status_name);
    const data = statusData.map(item => item.count);

    statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Complaints',
                data: data,
                backgroundColor: [
                    '#f39c12',
                    '#3498db',
                    '#9b59b6',
                    '#27ae60',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Display recent complaints
function displayRecentComplaints(complaints) {
    const container = document.getElementById('recentComplaints');

    if (!complaints || complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No recent complaints</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Student</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${complaints.map(complaint => `
                        <tr>
                            <td>#${complaint.complaint_id}</td>
                            <td>${complaint.title}</td>
                            <td>${complaint.student_name}</td>
                            <td>${complaint.category_name}</td>
                            <td><span class="status-badge status-${complaint.status_name.toLowerCase().replace(' ', '-')}">${complaint.status_name}</span></td>
                            <td><span class="priority-${complaint.priority}">${complaint.priority}</span></td>
                            <td>${formatDate(complaint.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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

// Load complaints
async function loadComplaints() {
    const statusFilter = document.getElementById('filterStatus').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    const searchTerm = document.getElementById('searchComplaints').value;

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
            let complaints = data.complaints;

            // Filter by search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                complaints = complaints.filter(c =>
                    c.title.toLowerCase().includes(term) ||
                    c.description.toLowerCase().includes(term) ||
                    c.student_name.toLowerCase().includes(term)
                );
            }

            displayComplaintsList(complaints);
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Failed to load complaints', 'danger');
    }
}

// Filter complaints by status
function filterComplaintsByStatus(status) {
    // Update button states
    document.getElementById('allComplaintsBtn').classList.remove('active');
    document.getElementById('pendingComplaintsBtn').classList.remove('active');
    document.getElementById('approvedComplaintsBtn').classList.remove('active');

    if (status === '') {
        document.getElementById('allComplaintsBtn').classList.add('active');
    } else if (status === 'Pending') {
        document.getElementById('pendingComplaintsBtn').classList.add('active');
    } else if (status === 'Approved') {
        document.getElementById('approvedComplaintsBtn').classList.add('active');
    }

    // Update filter and reload
    document.getElementById('filterStatus').value = status;
    loadComplaints();
}

// Display complaints list
function displayComplaintsList(complaints) {
    const container = document.getElementById('complaintsList');

    if (!complaints || complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No complaints found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Student</th>
                        <th>Room</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${complaints.map(complaint => `
                        <tr>
                            <td>#${complaint.complaint_id}</td>
                            <td>${complaint.title}</td>
                            <td>${complaint.student_name}</td>
                            <td>${complaint.student_room || 'N/A'}</td>
                            <td>${complaint.category_name}</td>
                            <td><span class="status-badge status-${complaint.status_name.toLowerCase().replace(' ', '-')}">${complaint.status_name}</span></td>
                            <td><span class="priority-${complaint.priority}">${complaint.priority}</span></td>
                            <td>${complaint.assigned_staff_name || 'Unassigned'}</td>
                            <td>${formatDate(complaint.created_at)}</td>
                            <td class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="viewComplaintDetails(${complaint.complaint_id})" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${complaint.status_name === 'Pending' || complaint.status_name === 'Approved' ? `
                                    <button class="btn btn-sm btn-success" onclick="approveComplaint(${complaint.complaint_id})" title="Approve">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn btn-sm btn-primary" onclick="showAssignStaffModal(${complaint.complaint_id})" title="Assign Staff">
                                        <i class="fas fa-user-plus"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="rejectComplaint(${complaint.complaint_id})" title="Reject">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                                ${complaint.status_name === 'In Progress' ? `
                                    <button class="btn btn-sm btn-success" onclick="resolveComplaint(${complaint.complaint_id})" title="Mark Resolved">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
            const modalFooter = document.getElementById('complaintModalFooter');

            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <h5>${complaint.title}</h5>
                        <p class="text-muted mb-3">
                            <i class="fas fa-user"></i> ${complaint.student_name} |
                            <i class="fas fa-door-open"></i> ${complaint.student_room || 'N/A'} |
                            <i class="fas fa-envelope"></i> ${complaint.student_email}
                        </p>
                        <p class="text-muted mb-3">
                            <i class="fas fa-folder"></i> ${complaint.category_name} |
                            <i class="fas fa-map-marker-alt"></i> ${complaint.location || 'N/A'} |
                            <i class="fas fa-calendar"></i> ${formatDate(complaint.created_at)}
                        </p>
                        <p><strong>Description:</strong></p>
                        <p>${complaint.description}</p>
                        ${complaint.image_url ? `
                            <p><strong>Image:</strong></p>
                            <img src="${complaint.image_url}" alt="Complaint Image" class="img-fluid rounded">
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
                                    <p class="text-muted small">${complaint.assignment_notes || ''}</p>
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
                    <div class="complaint-timeline">
                        ${history.map(h => `
                            <div class="timeline-item">
                                <div class="d-flex justify-content-between">
                                    <strong>${h.status_name}</strong>
                                    <small class="text-muted">${formatDate(h.changed_at)}</small>
                                </div>
                                <p class="mb-0">${h.changed_by_name} - ${h.notes || 'No notes'}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;

            // Update modal footer based on status
            if (complaint.status_name === 'Pending' || complaint.status_name === 'Approved') {
                modalFooter.innerHTML = `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="approveComplaint(${complaint.complaintId})">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button type="button" class="btn btn-primary" onclick="showAssignStaffModal(${complaint.complaintId})">
                        <i class="fas fa-user-plus"></i> Assign Staff
                    </button>
                    <button type="button" class="btn btn-danger" onclick="rejectComplaint(${complaint.complaintId})">
                        <i class="fas fa-times"></i> Reject
                    </button>
                `;
            } else if (complaint.status_name === 'In Progress') {
                modalFooter.innerHTML = `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="resolveComplaint(${complaint.complaintId})">
                        <i class="fas fa-check-circle"></i> Mark Resolved
                    </button>
                `;
            } else {
                modalFooter.innerHTML = `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                `;
            }

            const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading complaint details:', error);
        showAlert('Failed to load complaint details', 'danger');
    }
}

// Approve complaint
async function approveComplaint(complaintId) {
    try {
        // Get "Approved" status ID
        const statusResponse = await fetch(`${API_BASE_URL}/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const statusData = await statusResponse.json();
        const approvedStatus = statusData.statuses.find(s => s.status_name === 'Approved');

        if (!approvedStatus) {
            showAlert('System error: Approved status not found', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status_id: approvedStatus.status_id,
                notes: 'Complaint approved by admin'
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint approved successfully', 'success');
            loadComplaints();

            // Close modal if open
            const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            showAlert(data.message || 'Failed to approve complaint', 'danger');
        }
    } catch (error) {
        console.error('Error approving complaint:', error);
        showAlert('Failed to approve complaint', 'danger');
    }
}

// Reject complaint
async function rejectComplaint(complaintId) {
    if (!confirm('Are you sure you want to reject this complaint?')) {
        return;
    }

    try {
        // Get "Rejected" status ID
        const statusResponse = await fetch(`${API_BASE_URL}/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const statusData = await statusResponse.json();
        const rejectedStatus = statusData.statuses.find(s => s.status_name === 'Rejected');

        if (!rejectedStatus) {
            showAlert('System error: Rejected status not found', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status_id: rejectedStatus.status_id,
                notes: 'Complaint rejected by admin'
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint rejected successfully', 'success');
            loadComplaints();

            // Close modal if open
            const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            showAlert(data.message || 'Failed to reject complaint', 'danger');
        }
    } catch (error) {
        console.error('Error rejecting complaint:', error);
        showAlert('Failed to reject complaint', 'danger');
    }
}

// Resolve complaint
async function resolveComplaint(complaintId) {
    try {
        // Get "Resolved" status ID
        const statusResponse = await fetch(`${API_BASE_URL}/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const statusData = await statusResponse.json();
        const resolvedStatus = statusData.statuses.find(s => s.status_name === 'Resolved');

        if (!resolvedStatus) {
            showAlert('System error: Resolved status not found', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status_id: resolvedStatus.status_id,
                notes: 'Complaint marked as resolved by admin'
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint resolved successfully', 'success');
            loadComplaints();

            // Close modal if open
            const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            showAlert(data.message || 'Failed to resolve complaint', 'danger');
        }
    } catch (error) {
        console.error('Error resolving complaint:', error);
        showAlert('Failed to resolve complaint', 'danger');
    }
}

// Show assign staff modal
async function showAssignStaffModal(complaintId) {
    document.getElementById('assignComplaintId').value = complaintId;

    try {
        // Load staff members
        const response = await fetch(`${API_BASE_URL}/users?role=staff`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const staffSelect = document.getElementById('staffSelect');
            staffSelect.innerHTML = '<option value="">Select Staff</option>' +
                data.users.map(user => `<option value="${user.user_id}">${user.full_name}</option>`).join('');

            const modal = new bootstrap.Modal(document.getElementById('assignStaffModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        showAlert('Failed to load staff members', 'danger');
    }
}

// Handle assign staff
async function handleAssignStaff() {
    const complaintId = document.getElementById('assignComplaintId').value;
    const staffId = document.getElementById('staffSelect').value;
    const notes = document.getElementById('assignmentNotes').value;

    if (!staffId) {
        showAlert('Please select a staff member', 'danger');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                complaint_id: complaintId,
                staff_id: staffId,
                notes: notes
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Staff assigned successfully', 'success');
            loadComplaints();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('assignStaffModal'));
            modal.hide();

            // Clear form
            document.getElementById('assignStaffForm').reset();
        } else {
            showAlert(data.message || 'Failed to assign staff', 'danger');
        }
    } catch (error) {
        console.error('Error assigning staff:', error);
        showAlert('Failed to assign staff', 'danger');
    }
}

// Load staff
async function loadStaff() {
    try {
        const response = await fetch(`${API_BASE_URL}/users?role=staff`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayStaffList(data.users);
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        showAlert('Failed to load staff', 'danger');
    }
}

// Display staff list
function displayStaffList(staff) {
    const container = document.getElementById('staffList');

    if (!staff || staff.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-users fa-3x mb-3"></i>
                <p>No staff members found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row">
            ${staff.map(member => `
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white me-3" style="width: 50px; height: 50px;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">${member.full_name}</h5>
                                    <p class="card-text text-muted small mb-0">${member.email}</p>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="small text-muted">Total</div>
                                    <div class="fw-bold" id="staffTotal-${member.user_id}">-</div>
                                </div>
                                <div class="col-4">
                                    <div class="small text-muted">Active</div>
                                    <div class="fw-bold text-info" id="staffActive-${member.user_id}">-</div>
                                </div>
                                <div class="col-4">
                                    <div class="small text-muted">Completed</div>
                                    <div class="fw-bold text-success" id="staffCompleted-${member.user_id}">-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Load workload for each staff member
    staff.forEach(member => {
        loadStaffWorkload(member.user_id);
    });
}

// Load staff workload
async function loadStaffWorkload(staffId) {
    try {
        const response = await fetch(`${API_BASE_URL}/assignments?staff_id=${staffId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const assignments = data.assignments;
            const total = assignments.length;
            const active = assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress').length;
            const completed = assignments.filter(a => a.status === 'completed').length;

            document.getElementById(`staffTotal-${staffId}`).textContent = total;
            document.getElementById(`staffActive-${staffId}`).textContent = active;
            document.getElementById(`staffCompleted-${staffId}`).textContent = completed;
        }
    } catch (error) {
        console.error('Error loading staff workload:', error);
    }
}

// Load users
async function loadUsers() {
    const roleFilter = document.getElementById('filterUserRole').value;
    const searchTerm = document.getElementById('searchUsers').value;

    try {
        let url = `${API_BASE_URL}/users`;
        const params = new URLSearchParams();

        if (roleFilter) params.append('role', roleFilter);

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
            let users = data.users;

            // Filter by search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                users = users.filter(u =>
                    u.full_name.toLowerCase().includes(term) ||
                    u.username.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term)
                );
            }

            displayUsersList(users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Failed to load users', 'danger');
    }
}

// Display users list
function displayUsersList(users) {
    const container = document.getElementById('usersList');

    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-users fa-3x mb-3"></i>
                <p>No users found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Room</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.user_id}</td>
                            <td>${user.full_name}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td><span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'staff' ? 'info' : 'primary'}">${user.role}</span></td>
                            <td>${user.room_number || 'N/A'}</td>
                            <td>${user.phone_number || 'N/A'}</td>
                            <td>${formatDate(user.created_at)}</td>
                            <td>
                                ${user.role !== 'admin' || user.user_id !== currentUser.user_id ? `
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.user_id})" title="Delete User">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Handle add user
async function handleAddUser() {
    const role = document.getElementById('newUserRole').value;
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('newEmail').value;
    const full_name = document.getElementById('newFullName').value;
    const room_number = document.getElementById('newRoomNumber').value;
    const phone_number = document.getElementById('newPhoneNumber').value;
    const password = document.getElementById('newPassword').value;

    if (!role || !username || !email || !full_name || !password) {
        showAlert('Please fill in all required fields', 'danger');
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
                role,
                room_number: role === 'student' ? room_number : null,
                phone_number,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('User added successfully', 'success');
            loadUsers();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();

            // Clear form
            document.getElementById('addUserForm').reset();
        } else {
            showAlert(data.message || 'Failed to add user', 'danger');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showAlert('Failed to add user', 'danger');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('User deleted successfully', 'success');
            loadUsers();
        } else {
            showAlert(data.message || 'Failed to delete user', 'danger');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Failed to delete user', 'danger');
    }
}

// Load statistics
async function loadStatistics() {
    try {
        // Load resolution time stats
        const resolutionResponse = await fetch(`${API_BASE_URL}/stats/resolution-time`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const resolutionData = await resolutionResponse.json();

        if (resolutionData.success) {
            displayResolutionTimeStats(resolutionData.resolution_stats, resolutionData.averages);
        }

        // Load staff performance
        const staffResponse = await fetch(`${API_BASE_URL}/stats/overview`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const staffData = await staffResponse.json();

        if (staffData.success) {
            displayStaffPerformance(staffData.stats.staff_workload);
        }

        // Load trends chart
        loadTrendsChart();
    } catch (error) {
        console.error('Error loading statistics:', error);
        showAlert('Failed to load statistics', 'danger');
    }
}

// Display resolution time stats
function displayResolutionTimeStats(resolutionStats, averages) {
    const container = document.getElementById('resolutionTimeStats');

    if (!resolutionStats || resolutionStats.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <p>No resolution data available yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="text-center">
                    <div class="h3 mb-0">${Math.round(averages.avg_hours || 0)}h</div>
                    <small class="text-muted">Average Resolution Time</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="text-center">
                    <div class="h3 mb-0 text-success">${Math.round(averages.min_hours || 0)}h</div>
                    <small class="text-muted">Fastest Resolution</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="text-center">
                    <div class="h3 mb-0 text-danger">${Math.round(averages.max_hours || 0)}h</div>
                    <small class="text-muted">Slowest Resolution</small>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Complaint</th>
                        <th>Category</th>
                        <th>Resolution Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${resolutionStats.slice(0, 5).map(stat => `
                        <tr>
                            <td>${stat.title}</td>
                            <td>${stat.category_name}</td>
                            <td>${Math.round(stat.resolution_hours)} hours</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Display staff performance
function displayStaffPerformance(staffWorkload) {
    const container = document.getElementById('staffPerformance');

    if (!staffWorkload || staffWorkload.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <p>No staff performance data available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = staffWorkload.map(staff => {
        const total = staff.total_assignments || 0;
        const active = staff.active_assignments || 0;
        const completed = staff.completed_assignments || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title mb-0">${staff.full_name}</h5>
                        <span class="badge bg-success">${completionRate}% Completion Rate</span>
                    </div>
                    <div class="row text-center mb-2">
                        <div class="col-3">
                            <div class="small text-muted">Total</div>
                            <div class="fw-bold">${total}</div>
                        </div>
                        <div class="col-3">
                            <div class="small text-muted">Active</div>
                            <div class="fw-bold text-info">${active}</div>
                        </div>
                        <div class="col-3">
                            <div class="small text-muted">Completed</div>
                            <div class="fw-bold text-success">${completed}</div>
                        </div>
                        <div class="col-3">
                            <div class="small text-muted">Rate</div>
                            <div class="fw-bold">${completionRate}%</div>
                        </div>
                    </div>
                    <div class="staff-workload-bar">
                        <div class="staff-workload-progress" style="width: ${completionRate}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load trends chart
async function loadTrendsChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/complaints-by-date`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const complaintsByDate = data.complaints_by_date;

            // Group by date and status
            const groupedData = {};
            complaintsByDate.forEach(item => {
                if (!groupedData[item.date]) {
                    groupedData[item.date] = {};
                }
                groupedData[item.date][item.status_name] = item.count;
            });

            const dates = Object.keys(groupedData).sort().slice(-7); // Last 7 days
            const statusNames = ['Pending', 'In Progress', 'Resolved'];
            const datasets = statusNames.map((status, index) => ({
                label: status,
                data: dates.map(date => groupedData[date][status] || 0),
                borderColor: ['#f39c12', '#3498db', '#27ae60'][index],
                backgroundColor: ['#f39c12', '#3498db', '#27ae60'][index],
                tension: 0.1
            }));

            const ctx = document.getElementById('trendsChart').getContext('2d');

            if (trendsChart) {
                trendsChart.destroy();
            }

            trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(date => formatDate(date)),
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading trends chart:', error);
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


// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}