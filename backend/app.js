const express = require('express');
const app = express();
const port = 3000;

// Middleware to log headers
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', {
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'host': req.headers['host']
    });
    next();
});

// Home page - shows current cookies
app.get('/', (req, res) => {
    const cookies = req.headers.cookie || 'No cookies set';

    res.send(`
        <h1>Secure Cookie Demo</h1>

        <p><strong>Current cookies:</strong> ${cookies}</p>

        <p><strong>Connection info:</strong></p>
        <ul>
            <li>X-Forwarded-Proto: ${req.headers['x-forwarded-proto'] || 'Not set'}</li>
            <li>Host: ${req.headers['host']}</li>
            <li>X-Forwarded-For: ${req.headers['x-forwarded-for'] || 'Not set'}</li>
        </ul>

        <hr>
        <a href="/login">Set Secure Cookie</a><br><br>
        <a href="/logout">Clear Cookie</a><br><br>
        <a href="http://localhost:3000/login">Set Secure Cookie with DIRECT access</a><br><br>
        <a href="/test-insecure">Try to set insecure cookie</a>
    `);
});

// Login endpoint - sets secure cookie
app.get('/login', (req, res) => {
    const isHttps = req.headers['x-forwarded-proto'] === 'https';

    if (isHttps) {
        // Backend can set secure cookies when behind HTTPS proxy
        res.cookie('auth_token', 'secure_token_12345', {
            secure: true,      // Only sent over HTTPS
            httpOnly: true,    // Not accessible via JavaScript
            sameSite: 'strict', // CSRF protection
            maxAge: 3600000    // 1 hour
        });

        res.send(`
            <h1>Login Successful!</h1>
            <p>Secure cookie set successfully!</p>
            <p><strong>Cookie details:</strong></p>
            <ul>
                <li>secure: true</li>
                <li>httpOnly: true</li>
                <li>sameSite: 'strict'</li>
            </ul>
            <p><strong>X-Forwarded-Proto:</strong> ${req.headers['x-forwarded-proto']}</p>
            <a href="/">← Back to home</a>
        `);
    } else {
        // Direct HTTP access
        res.send(`
            <h1>Cannot set secure cookie</h1>
            <p>This request was not made over HTTPS.</p>
            <p><strong>X-Forwarded-Proto:</strong> ${req.headers['x-forwarded-proto'] || 'Not set'}</p>
            <p>Access this via HTTPS proxy to set secure cookies.</p>
            <a href="/">← Back to home</a>
        `);
    }
});

// Logout endpoint - clears cookie
app.get('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
    });

    res.send(`
        <p>Cookie cleared!</p>
        <a href="/">← Back to home</a>
    `);
});

// Test insecure cookie (for comparison)
app.get('/test-insecure', (req, res) => {
    res.cookie('insecure_token', 'insecure_token_67890', {
        secure: false,     // Can be sent over HTTP
        httpOnly: false,   // Accessible via JavaScript
        sameSite: 'lax'
    });

    res.send(`
        <h1>Insecure Cookie Set</h1>
        <p>This cookie has secure: false</p>
        <p>It will work over both HTTP and HTTPS</p>
        <a href="/">← Back to home</a>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        protocol: req.headers['x-forwarded-proto'] || 'http'
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on HTTP port ${port}`);
});
