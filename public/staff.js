// API Base URL
const API_BASE_URL = '/api';

// Global variables
let currentUser = null;
let authToken = null;
let assignmentsData = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    // Are we on the login page or dashboard?
    const isLoginPage = document.getElementById('loginPage') !== null;
    
    if (authToken && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            if (currentUser.role === 'staff') {
                if (isLoginPage) {
                    window.location.href = 'staff-dashboard.html';
                } else {
                    // Update UI with user info
                    document.getElementById('sidebarUserName').textContent = currentUser.full_name;
                    loadAssignments();
                }
            } else {
                handleLogout();
            }
        } catch (e) {
            handleLogout();
        }
    } else {
        if (!isLoginPage) {
            window.location.href = 'staff.html';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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
            if (data.user.role !== 'staff') {
                showAlert('Access denied. Staff privileges required.', 'danger');
                return;
            }

            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'staff-dashboard.html';
            }, 1000);
        } else {
            let errorMessage = data.message || data.error || 'Login failed';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Cannot connect to server. Please try again.', 'danger');
    }
}

// Handle logout
function logout() {
    handleLogout();
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    window.location.href = 'staff.html';
}

// Section navigation
function showSection(section) {
    const dashboardContent = document.getElementById('dashboardContent');
    const tasksContent = document.getElementById('tasksContent');
    
    document.getElementById('sidebarDashboard').classList.remove('active');
    document.getElementById('sidebarTasks').classList.remove('active');

    dashboardContent.classList.add('hidden');
    tasksContent.classList.add('hidden');

    if (section === 'dashboard') {
        dashboardContent.classList.remove('hidden');
        document.getElementById('sidebarDashboard').classList.add('active');
        loadAssignments(); // Refresh
    } else if (section === 'tasks') {
        tasksContent.classList.remove('hidden');
        document.getElementById('sidebarTasks').classList.add('active');
        renderTasksView();
    }
}

// Load assignments
async function loadAssignments() {
    try {
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            assignmentsData = data.assignments;
            
            // Update Dashboard Stats
            const total = assignmentsData.length;
            const completed = assignmentsData.filter(a => a.status === 'completed').length;
            const pending = total - completed;

            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;

            // Update Recent table
            const recentBody = document.getElementById('recentTasksBody');
            if (recentBody) {
                recentBody.innerHTML = assignmentsData.slice(0, 5).map(a => `
                    <tr>
                        <td>#${a.complaint_id}</td>
                        <td>${a.complaint_title}</td>
                        <td><span class="status-badge status-${a.status}">${formatStatus(a.status)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="openUpdateModal(${a.assignment_id}, '${a.status}', '${a.notes ? a.notes.replace(/'/g, "\\'") : ''}')">
                                <i class="fas fa-edit"></i> Update
                            </button>
                        </td>
                    </tr>
                `).join('') || `<tr><td colspan="4" class="text-center text-muted">No assignments found</td></tr>`;
            }

            renderTasksView();
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
        showAlert('Failed to load assignments', 'danger');
    }
}

function renderTasksView() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    if (assignmentsData.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center text-white">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = assignmentsData.map(a => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title fw-bold m-0">#${a.complaint_id}: ${a.complaint_title}</h5>
                    <span class="status-badge status-${a.status}">${formatStatus(a.status)}</span>
                </div>
                <p class="text-muted small mb-2"><i class="fas fa-clock"></i> Assigned on ${new Date(a.assigned_at).toLocaleDateString()}</p>
                <p class="mb-3"><strong>Notes:</strong> ${a.notes || 'No specific instructions provided.'}</p>
                
                ${a.status !== 'completed' ? `
                    <button class="btn btn-primary" onclick="openUpdateModal(${a.assignment_id}, '${a.status}', '${a.notes ? a.notes.replace(/'/g, "\\'") : ''}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                ` : `
                    <button class="btn btn-secondary" disabled>
                        <i class="fas fa-check-circle"></i> Resolved
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function formatStatus(status) {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    return 'Assigned';
}

function openUpdateModal(id, currentStatus, currentNotes) {
    document.getElementById('updateAssignmentId').value = id;
    document.getElementById('updateStatus').value = currentStatus;
    document.getElementById('updateNotes').value = currentNotes !== 'null' ? currentNotes : '';
    
    const modal = new bootstrap.Modal(document.getElementById('updateTaskModal'));
    modal.show();
}

async function submitTaskUpdate() {
    const id = document.getElementById('updateAssignmentId').value;
    const status = document.getElementById('updateStatus').value;
    const notes = document.getElementById('updateNotes').value;

    try {
        const response = await fetch(`${API_BASE_URL}/assignments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status, notes })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Task status updated successfully!', 'success');
            
            // Hide modal
            const modalEl = document.getElementById('updateTaskModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // Refresh assignments
            loadAssignments();
        } else {
            showAlert(data.message || 'Failed to update status', 'danger');
        }
    } catch (error) {
        console.error('Update error:', error);
        showAlert('Failed to update status', 'danger');
    }
}

// Utility: Show alerts
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
