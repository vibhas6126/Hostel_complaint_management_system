const http = require('http');

const loginData = JSON.stringify({ username: 'student1', password: 'password123' });

const loginReq = http.request({
    hostname: 'localhost',
    port: 3003,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
}, (loginRes) => {
    let body = '';
    loginRes.on('data', d => body += d);
    loginRes.on('end', () => {
        const token = JSON.parse(body).token;
        console.log('Got token:', token);
        
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        let formData = '';
        formData += '--' + boundary + '\r\n';
        formData += 'Content-Disposition: form-data; name=\"category_id\"\r\n\r\n1\r\n';
        formData += '--' + boundary + '\r\n';
        formData += 'Content-Disposition: form-data; name=\"title\"\r\n\r\nTest Title\r\n';
        formData += '--' + boundary + '\r\n';
        formData += 'Content-Disposition: form-data; name=\"description\"\r\n\r\nTest Description\r\n';
        formData += '--' + boundary + '\r\n';
        formData += 'Content-Disposition: form-data; name=\"priority\"\r\n\r\nmedium\r\n';
        formData += '--' + boundary + '--\r\n';

        const postReq = http.request({
            hostname: 'localhost',
            port: 3003,
            path: '/api/complaints',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': Buffer.byteLength(formData)
            }
        }, (res) => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => {
                console.log('STATUS:', res.statusCode);
                console.log('RESPONSE:', resBody);
            });
        });
        postReq.write(formData);
        postReq.end();
    });
});
loginReq.write(loginData);
loginReq.end();
