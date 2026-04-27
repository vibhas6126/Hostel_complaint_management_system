const fs = require('fs');

const setupFn = `// Setup event listeners
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
}`;

['public/student.js', 'public/admin.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\/\/\s*Setup event listeners\s*\nfunction setupEventListeners\(\) \{[\s\S]*?(?=\n\/\/ Show login page|\nfunction showLogin)/, setupFn + '\n\n');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
