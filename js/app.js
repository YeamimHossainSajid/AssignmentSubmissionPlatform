// js/app.js — application entry point (ES Module)
import { Auth } from './auth.js';
import { UI }   from './ui.js';
import { Router } from './router.js';
import { Views }  from './views.js';
import { Api }    from './api.js';

// ─── Expose globals so inline onclick handlers work ───────────────────────────
window.__UI     = UI;
window.__Router = Router;
window.__Views  = Views;
window.__Auth   = Auth;
window.__Api    = Api;

// ─── Nav config per role ──────────────────────────────────────────────────────
const NAV_LINKS = {
    ADMIN:      [
        { view: 'dashboard', label: '🏠 Dashboard' },
        { view: 'courses',   label: '📚 All Courses' },
    ],
    INSTRUCTOR: [
        { view: 'dashboard',   label: '🏠 Dashboard' },
        { view: 'my-courses',  label: '📖 My Courses' },
        { view: 'assignments', label: '📝 Assignments' },
        { view: 'grading',     label: '✅ Grading' },
    ],
    STUDENT: [
        { view: 'dashboard',   label: '🏠 Dashboard' },
        { view: 'my-courses',  label: '📖 My Courses' },
        { view: 'enroll',      label: '🔍 Browse Courses' },
        { view: 'assignments', label: '📝 Assignments' },
        { view: 'submissions', label: '📤 My Submissions' },
    ],
};

function renderNav(role) {
    const links = NAV_LINKS[role] || [];
    document.getElementById('nav-links').innerHTML = links
        .map(l => `<div class="nav-item" data-view="${l.view}" onclick="window.__Router.navigate('${l.view}')">${l.label}</div>`)
        .join('');
}

function showApp(session) {
    document.getElementById('auth-container').style.display  = 'none';
    document.getElementById('app-shell').style.display       = 'grid';
    document.getElementById('user-name').textContent  = session.name;
    document.getElementById('user-role').textContent  = session.role;
    document.getElementById('user-avatar').textContent = session.name.charAt(0).toUpperCase();
    renderNav(session.role);
    Router.navigate('dashboard');
}

/* ─────────────────────────────────────────────────────────────────────────────
   Auth Forms
───────────────────────────────────────────────────────────────────────────── */
function showLogin() {
    document.getElementById('auth-container').style.display  = 'flex';
    document.getElementById('app-shell').style.display       = 'none';

    document.getElementById('auth-container').innerHTML = `
        <div class="card auth-card">
            <div class="auth-header"><div class="auth-logo">LASS</div></div>
            <div style="padding:24px">
                <h2 style="text-align:center;margin-bottom:6px">Sign In</h2>
                <p style="text-align:center;color:var(--text-muted);font-size:.9rem;margin-bottom:24px">
                    Student Assignment Submission System
                </p>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="login-email" placeholder="you@example.com" style="margin-bottom:14px"
                           onkeydown="if(event.key==='Enter') document.getElementById('login-pass').focus()">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-pass" placeholder="Password" style="margin-bottom:20px"
                           onkeydown="if(event.key==='Enter') window.__doLogin()">
                </div>
                <button class="btn btn-primary" id="login-btn" style="width:100%;margin-bottom:14px" onclick="window.__doLogin()">Sign In</button>
                <button class="btn btn-secondary" style="width:100%" onclick="window.__showRegister()">Create Account</button>
                <div class="auth-footer" style="margin-top:20px">
                    <strong>Demo:</strong> register any account, role: STUDENT / INSTRUCTOR / ADMIN
                </div>
            </div>
        </div>
    `;
}

function showRegister() {
    document.getElementById('auth-container').innerHTML = `
        <div class="card auth-card">
            <div class="auth-header"><div class="auth-logo">LASS</div></div>
            <div style="padding:24px">
                <h2 style="text-align:center;margin-bottom:6px">Create Account</h2>
                <p style="text-align:center;color:var(--text-muted);font-size:.9rem;margin-bottom:24px">
                    Join LASS today
                </p>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="reg-name" placeholder="Jane Smith" style="margin-bottom:14px">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="reg-email" placeholder="you@example.com" style="margin-bottom:14px">
                </div>
                <div class="form-group">
                    <label>Password (min 6 chars)</label>
                    <input type="password" id="reg-pass" placeholder="Password" style="margin-bottom:14px">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="reg-role" style="margin-bottom:20px">
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="reg-btn" style="width:100%;margin-bottom:14px" onclick="window.__doRegister()">Register</button>
                <button class="btn btn-secondary" style="width:100%" onclick="window.__showLogin()">Back to Sign In</button>
            </div>
        </div>
    `;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Action handlers exposed to window
───────────────────────────────────────────────────────────────────────────── */
window.__doLogin = async () => {
    const email = document.getElementById('login-email')?.value?.trim();
    const pass  = document.getElementById('login-pass')?.value;
    const btn   = document.getElementById('login-btn');
    if (!email || !pass) { UI.notify('Enter email and password', 'error'); return; }
    UI.setLoading(btn, true);
    const session = await Auth.login(email, pass);
    if (session) {
        showApp(session);
    } else {
        UI.setLoading(btn, false);
    }
};

window.__doRegister = async () => {
    const name  = document.getElementById('reg-name')?.value?.trim();
    const email = document.getElementById('reg-email')?.value?.trim();
    const pass  = document.getElementById('reg-pass')?.value;
    const role  = document.getElementById('reg-role')?.value;
    const btn   = document.getElementById('reg-btn');
    if (!name || !email || !pass) { UI.notify('All fields are required', 'error'); return; }
    UI.setLoading(btn, true);
    const session = await Auth.register(name, email, pass, role);
    if (session) {
        showApp(session);
    } else {
        UI.setLoading(btn, false);
    }
};

window.__showLogin    = showLogin;
window.__showRegister = showRegister;

// Logout button in sidebar
window.__logout = () => Auth.logout();

/* ─────────────────────────────────────────────────────────────────────────────
   Bootstrap
───────────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const session = Auth.getSession();
    if (session) {
        showApp(session);
    } else {
        showLogin();
    }
});
