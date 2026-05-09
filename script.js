const Store = {
    get(key) {
        return JSON.parse(localStorage.getItem('lass_' + key)) || [];
    },
    set(key, val) {
        localStorage.setItem('lass_' + key, JSON.stringify(val));
    },
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('lass_currentUser'));
    },
    setCurrentUser(user) {
        localStorage.setItem('lass_currentUser', JSON.stringify(user));
    },
    seed() {
        if (this.get('users').length === 0) {
            this.set('users', [
                { id: 'u1', email: 'admin@uni.edu', password: 'admin123', name: 'Admin', role: 'admin' },
                { id: 'u2', email: 'prof.smith@uni.edu', password: 'prof123', name: 'Prof. David Smith', role: 'instructor' },
                { id: 'u3', email: 'prof.khan@uni.edu', password: 'prof123', name: 'Prof. Aisha Khan', role: 'instructor' },
                { id: 'u4', email: 'alice@student.edu', password: 'pass123', name: 'Alice Johnson', role: 'student' },
                { id: 'u5', email: 'bob@student.edu', password: 'pass123', name: 'Bob Martinez', role: 'student' },
                { id: 'u6', email: 'sara@student.edu', password: 'pass123', name: 'Sara Ahmed', role: 'student' },
                { id: 'u7', email: 'james@student.edu', password: 'pass123', name: 'James Lee', role: 'student' }
            ]);
            this.set('courses', [
                { id: 'c1', code: 'CS101', name: 'Intro to Programming', instructorId: 'u2', desc: 'Fundamentals of coding.' },
                { id: 'c2', code: 'DS201', name: 'Data Structures', instructorId: 'u3', desc: 'Advanced algorithms.' }
            ]);
            this.set('enrollments', [
                { studentId: 'u4', courseId: 'c1' },
                { studentId: 'u4', courseId: 'c2' }
            ]);
            this.set('assignments', [
                { id: 'a1', courseId: 'c1', title: 'Hello World', due: '2025-12-31T23:59', maxScore: 100, desc: 'Write a program that prints Hello World.' }
            ]);
            this.set('submissions', []);
            this.set('grades', []);
        }
    }
};

const Auth = {
    login(email, password) {
        const users = Store.get('users');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            Store.setCurrentUser(user);
            UI.notify('Login successful', 'success');
            App.init();
            return true;
        }
        UI.notify('Invalid credentials', 'error');
        return false;
    },
    logout() {
        localStorage.removeItem('lass_currentUser');
        location.reload();
    },
    register(name, email, password, role) {
        const users = Store.get('users');
        if (users.find(u => u.email === email)) {
            UI.notify('Email already registered', 'error');
            return false;
        }
        const newUser = { id: 'u' + Date.now(), name, email, password, role };
        users.push(newUser);
        Store.set('users', users);
        this.login(email, password);
        return true;
    }
};

const UI = {
    notify(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },
    modal(title, content, footer = '') {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <span style="cursor:pointer;font-size:1.5rem" onclick="UI.closeModal()">&times;</span>
            </div>
            <div class="modal-body">${content}</div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;
        overlay.style.display = 'flex';
    },
    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }
};

const Router = {
    navigate(view) {
        const container = document.getElementById('main-content');
        const title = document.getElementById('view-title');
        title.innerText = view.charAt(0).toUpperCase() + view.slice(1);
        
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.querySelector(`[onclick*="${view}"]`);
        if (activeNav) activeNav.classList.add('active');

        switch(view) {
            case 'dashboard': Views.dashboard(container); break;
            case 'users': Views.users(container); break;
            case 'courses': Views.courses(container); break;
            case 'my-courses': Views.myCourses(container); break;
            case 'assignments': Views.assignments(container); break;
            case 'grading': Views.grading(container); break;
            case 'submissions': Views.mySubmissions(container); break;
        }
    }
};

const Views = {
    dashboard(container) {
        const user = Store.getCurrentUser();
        let stats = '';
        if (user.role === 'student') {
            const enrollments = Store.get('enrollments').filter(e => e.studentId === user.id);
            const submissions = Store.get('submissions').filter(s => s.studentId === user.id);
            stats = `
                <div class="stats-grid">
                    <div class="card stat-card"><h4>Enrolled</h4><div class="value">${enrollments.length}</div></div>
                    <div class="card stat-card"><h4>Submissions</h4><div class="value">${submissions.length}</div></div>
                </div>
            `;
        } else {
            stats = `<div class="stats-grid"><div class="card stat-card"><h4>Platform Active</h4><div class="value">Online</div></div></div>`;
        }
        container.innerHTML = `<h1>Dashboard</h1>${stats}`;
    },
    users(container) {
        const users = Store.get('users');
        container.innerHTML = `
            <h1>User Management</h1>
            <div class="card" style="padding:0">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                    <tbody>
                        ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td><span class="badge badge-info">${u.role}</span></td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    courses(container) {
        const courses = Store.get('courses');
        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
                <h1>Courses</h1>
                ${Store.getCurrentUser().role === 'instructor' ? '<button class="btn btn-primary" onclick="Views.openCourseModal()">Create Course</button>' : ''}
            </div>
            <div class="stats-grid" style="margin-top:20px">
                ${courses.map(c => `
                    <div class="card">
                        <span class="badge badge-info">${c.code}</span>
                        <h3 style="margin:10px 0">${c.name}</h3>
                        <p style="color:var(--text-muted)">${c.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },
    myCourses(container) {
        const user = Store.getCurrentUser();
        const courses = Store.get('courses');
        const enrollments = Store.get('enrollments').filter(e => e.studentId === user.id);
        const myCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id));
        
        container.innerHTML = `
            <h1>My Courses</h1>
            <div class="stats-grid" style="margin-top:20px">
                ${myCourses.map(c => `
                    <div class="card">
                        <span class="badge badge-info">${c.code}</span>
                        <h3 style="margin:10px 0">${c.name}</h3>
                        <button class="btn btn-secondary" style="width:100%" onclick="Router.navigate('assignments')">View Assignments</button>
                    </div>
                `).join('')}
            </div>
        `;
    },
    assignments(container) {
        const assignments = Store.get('assignments');
        container.innerHTML = `
            <h1>Assignments</h1>
            <div class="card" style="padding:0;margin-top:20px">
                <table>
                    <thead><tr><th>Title</th><th>Due Date</th><th>Action</th></tr></thead>
                    <tbody>
                        ${assignments.map(a => `
                            <tr>
                                <td>${a.title}</td>
                                <td class="mono">${new Date(a.due).toLocaleDateString()}</td>
                                <td><button class="btn btn-primary" onclick="Views.openSubmitModal('${a.id}')">Submit</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    grading(container) {
        container.innerHTML = `<h1>Grading</h1><div class="empty-state"><div class="empty-icon">📝</div><p>No submissions to grade</p></div>`;
    },
    mySubmissions(container) {
        container.innerHTML = `<h1>My Submissions</h1><div class="empty-state"><div class="empty-icon">📤</div><p>No submissions found</p></div>`;
    },
    openCourseModal() {
        UI.modal('Create Course', `
            <div class="form-group">
                <label>Course Name</label><input type="text" id="course-name">
            </div>
            <div class="form-group" style="margin-top:15px">
                <label>Course Code</label><input type="text" id="course-code">
            </div>
        `, '<button class="btn btn-primary" onclick="UI.closeModal()">Save</button>');
    },
    openSubmitModal(id) {
        UI.modal('Submit Assignment', `
            <div class="form-group">
                <label>Upload File</label>
                <div style="border:2px dashed var(--border);padding:40px;text-align:center;border-radius:12px;cursor:pointer">
                    Drag & Drop File
                </div>
            </div>
            <div class="form-group" style="margin-top:15px">
                <label>Notes</label><textarea rows="3"></textarea>
            </div>
        `, '<button class="btn btn-primary" onclick="UI.closeModal()">Submit</button>');
    }
};

const App = {
    init() {
        Store.seed();
        const user = Store.getCurrentUser();
        if (user) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-shell').style.display = 'grid';
            document.getElementById('user-name').innerText = user.name;
            document.getElementById('user-role').innerText = user.role;
            document.getElementById('user-avatar').innerText = user.name.charAt(0);
            this.renderNav(user.role);
            Router.navigate('dashboard');
        } else {
            this.showLogin();
        }
    },
    renderNav(role) {
        const nav = document.getElementById('nav-links');
        const links = {
            admin: ['dashboard', 'users', 'courses'],
            instructor: ['dashboard', 'my-courses', 'assignments', 'grading'],
            student: ['dashboard', 'my-courses', 'assignments', 'submissions']
        };
        nav.innerHTML = links[role].map(l => `
            <div class="nav-item" onclick="Router.navigate('${l}')">${l.charAt(0).toUpperCase() + l.slice(1).replace('-', ' ')}</div>
        `).join('');
    },
    showLogin() {
        const container = document.getElementById('auth-container');
        container.innerHTML = `
            <div class="card auth-card">
                <div class="auth-header"><div class="auth-logo">LASS</div></div>
                <div style="padding:10px">
                    <h2 style="text-align:center;margin-bottom:20px">Login</h2>
                    <input type="email" id="login-email" placeholder="Email" style="margin-bottom:15px">
                    <input type="password" id="login-pass" placeholder="Password" style="margin-bottom:15px">
                    <button class="btn btn-primary" style="width:100%" onclick="Auth.login(document.getElementById('login-email').value, document.getElementById('login-pass').value)">Login</button>
                    <div class="auth-footer">Demo: alice@student.edu | pass123</div>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
