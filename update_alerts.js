const fs = require('fs');
const files = [
  'public/student.js',
  'public/admin.js',
  'public/staff.js',
  'public/student-dashboard.html',
  'public/admin-dashboard.html'
];

const newShowAlert = `function showAlert(message, type) {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = \`
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
        \`;
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
    toast.className = \`custom-toast \${type}\`;
    toast.innerHTML = \`
        <div class="icon"><i class="fas \${iconClass}"></i></div>
        <div class="message">\${message}</div>
        <button class="close-btn" onclick="this.parentElement.classList.remove('show'); setTimeout(function(){ this.parentElement.remove(); }.bind(this), 400)"><i class="fas fa-times"></i></button>
    \`;
    
    container.appendChild(toast);
    
    setTimeout(function() { toast.classList.add('show'); }, 10);
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { if (toast.parentElement) toast.remove(); }, 400);
    }, 4000);
}`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Different files have different formats
    if (file.includes('staff.js')) {
        content = content.replace(/function showAlert\(message,\s*type\)\s*\{[\s\S]*$/, newShowAlert + '\n');
    } else if (file.includes('admin-dashboard.html')) {
        content = content.replace(/function showAlert\(message,\s*type\)\s*\{[\s\S]*?(?=\n\s*\/\/\s*Helper)/, newShowAlert);
    } else if (file.includes('student-dashboard.html')) {
        content = content.replace(/function showAlert\(message,\s*type\)\s*\{[\s\S]*?(?=\n\s*\/\/\s*Helper)/, newShowAlert);
    } else if (file.includes('admin.js')) {
        content = content.replace(/function showAlert\(message,\s*type\)\s*\{[\s\S]*?(?=\n(?:function|\/\/))/, newShowAlert + '\n\n');
    } else if (file.includes('student.js')) {
        content = content.replace(/function showAlert\(message,\s*type\)\s*\{[\s\S]*$/, newShowAlert + '\n');
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
