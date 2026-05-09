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
                { id: 'u4', email: 'prof.williams@uni.edu', password: 'prof123', name: 'Prof. Emily Williams', role: 'instructor' },
                { id: 'u5', email: 'alice@student.edu', password: 'pass123', name: 'Alice Johnson', role: 'student' },
                { id: 'u6', email: 'bob@student.edu', password: 'pass123', name: 'Bob Martinez', role: 'student' },
                { id: 'u7', email: 'sara@student.edu', password: 'pass123', name: 'Sara Ahmed', role: 'student' },
                { id: 'u8', email: 'james@student.edu', password: 'pass123', name: 'James Lee', role: 'student' },
                { id: 'u9', email: 'maria@student.edu', password: 'pass123', name: 'Maria Garcia', role: 'student' },
                { id: 'u10', email: 'tom@student.edu', password: 'pass123', name: 'Tom Chen', role: 'student' }
            ]);
            this.set('courses', [
                { id: 'c1', code: 'CS101', name: 'Intro to Programming', instructorId: 'u2', desc: 'Learn the fundamentals of programming using Python. Perfect for beginners!', color: '#4A90E2' },
                { id: 'c2', code: 'DS201', name: 'Data Structures & Algorithms', instructorId: 'u3', desc: 'Master advanced data structures and algorithm optimization techniques.', color: '#50C878' },
                { id: 'c3', code: 'WEB301', name: 'Web Development Bootcamp', instructorId: 'u2', desc: 'Build responsive web applications with HTML, CSS, and JavaScript.', color: '#FF8C42' },
                { id: 'c4', code: 'DB101', name: 'Database Design', instructorId: 'u4', desc: 'Design and optimize relational and NoSQL databases.', color: '#9B59B6' },
                { id: 'c5', code: 'AI101', name: 'Intro to Machine Learning', instructorId: 'u3', desc: 'Explore machine learning algorithms and real-world applications.', color: '#E74C3C' },
                { id: 'c6', code: 'CLOUD201', name: 'Cloud Computing Essentials', instructorId: 'u4', desc: 'Deploy and manage applications on AWS, Azure, and Google Cloud.', color: '#3498DB' }
            ]);
            this.set('enrollments', [
                { studentId: 'u5', courseId: 'c1' },
                { studentId: 'u5', courseId: 'c2' },
                { studentId: 'u5', courseId: 'c3' },
                { studentId: 'u6', courseId: 'c1' },
                { studentId: 'u6', courseId: 'c4' },
                { studentId: 'u7', courseId: 'c2' },
                { studentId: 'u7', courseId: 'c5' },
                { studentId: 'u8', courseId: 'c1' },
                { studentId: 'u9', courseId: 'c3' },
                { studentId: 'u10', courseId: 'c4' }
            ]);
            this.set('assignments', [
                { id: 'a1', courseId: 'c1', title: 'Hello World Program', due: '2025-12-15T23:59', maxScore: 100, desc: 'Write a program that prints Hello World in Python.' },
                { id: 'a2', courseId: 'c1', title: 'Functions & Loops', due: '2025-12-22T23:59', maxScore: 100, desc: 'Create functions and use loops to solve problems.' },
                { id: 'a3', courseId: 'c2', title: 'Array Implementation', due: '2025-12-20T23:59', maxScore: 150, desc: 'Implement dynamic array data structure with operations.' },
                { id: 'a4', courseId: 'c2', title: 'Binary Search Tree', due: '2025-12-28T23:59', maxScore: 150, desc: 'Build and optimize a balanced binary search tree.' },
                { id: 'a5', courseId: 'c3', title: 'Personal Portfolio Website', due: '2025-12-25T23:59', maxScore: 200, desc: 'Create a responsive personal portfolio using HTML/CSS/JS.' },
                { id: 'a6', courseId: 'c3', title: 'Interactive Todo App', due: '2026-01-10T23:59', maxScore: 200, desc: 'Build a todo application with add, edit, delete features.' },
                { id: 'a7', courseId: 'c4', title: 'Database Schema Design', due: '2025-12-18T23:59', maxScore: 100, desc: 'Design a normalized database schema for an e-commerce platform.' }
            ]);
            this.set('submissions', [
                { id: 's1', studentId: 'u5', assignmentId: 'a1', submittedAt: '2025-12-14T15:30', score: 95, status: 'graded' },
                { id: 's2', studentId: 'u5', assignmentId: 'a2', submittedAt: '2025-12-21T18:45', score: 88, status: 'graded' },
                { id: 's3', studentId: 'u6', assignmentId: 'a1', submittedAt: '2025-12-15T10:20', score: 100, status: 'graded' }
            ]);
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
        title.innerText = view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ');
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
        let content = '';
        if (user.role === 'student') {
            const enrollments = Store.get('enrollments').filter(e => e.studentId === user.id);
            const submissions = Store.get('submissions').filter(s => s.studentId === user.id);
            const courses = Store.get('courses');
            const myCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id));
            
            content = `
                <div class="hero-section">
                    <h1>Welcome back, ${user.name}! 👋</h1>
                    <p>You're doing great! Keep up with your assignments and ace your courses.</p>
                </div>
                <div class="stats-grid">
                    <div class="card stat-card">
                        <h4>📚 Enrolled Courses</h4>
                        <div class="value">${enrollments.length}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>✅ Submissions</h4>
                        <div class="value">${submissions.length}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>⭐ Avg Grade</h4>
                        <div class="value">${submissions.length > 0 ? Math.round(submissions.reduce((a,b) => a + b.score, 0) / submissions.length) : 'N/A'}</div>
                    </div>
                </div>
                <h2 style="margin-top: 32px; margin-bottom: 20px;">Your Courses</h2>
                <div class="course-grid">
                    ${myCourses.map(c => `
                        <div class="course-card">
                            <div class="course-card-header" style="background: linear-gradient(135deg, ${c.color}dd, ${c.color});">
                                <h3>${c.name}</h3>
                            </div>
                            <div class="course-card-body">
                                <div class="code">${c.code}</div>
                                <p>${c.desc}</p>
                                <div class="course-card-footer">
                                    <small style="color: var(--text-muted);">Instructor: Prof. Smith</small>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (user.role === 'instructor') {
            const courses = Store.get('courses').filter(c => c.instructorId === user.id);
            const enrollments = Store.get('enrollments');
            const totalStudents = enrollments.length;
            
            content = `
                <div class="hero-section">
                    <h1>Welcome, Professor ${user.name}! 🎓</h1>
                    <p>Manage your courses and track student progress efficiently.</p>
                </div>
                <div class="stats-grid">
                    <div class="card stat-card">
                        <h4>📖 My Courses</h4>
                        <div class="value">${courses.length}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>👥 Total Students</h4>
                        <div class="value">${totalStudents}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>📝 Active Assignments</h4>
                        <div class="value">${Store.get('assignments').filter(a => courses.some(c => c.id === a.courseId)).length}</div>
                    </div>
                </div>
                <h2 style="margin-top: 32px; margin-bottom: 20px;">Your Courses</h2>
                <div class="course-grid">
                    ${courses.map(c => `
                        <div class="course-card">
                            <div class="course-card-header" style="background: linear-gradient(135deg, ${c.color}dd, ${c.color});">
                                <h3>${c.name}</h3>
                            </div>
                            <div class="course-card-body">
                                <div class="code">${c.code}</div>
                                <p>${c.desc}</p>
                                <div class="course-card-footer">
                                    <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="Router.navigate('grading')">View Submissions</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            const totalUsers = Store.get('users').length;
            const totalCourses = Store.get('courses').length;
            const totalEnrollments = Store.get('enrollments').length;
            
            content = `
                <div class="hero-section">
                    <h1>Admin Dashboard 🛠️</h1>
                    <p>Manage users, courses, and monitor system activity.</p>
                </div>
                <div class="stats-grid">
                    <div class="card stat-card">
                        <h4>👥 Total Users</h4>
                        <div class="value">${totalUsers}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>📚 Total Courses</h4>
                        <div class="value">${totalCourses}</div>
                    </div>
                    <div class="card stat-card">
                        <h4>📊 Enrollments</h4>
                        <div class="value">${totalEnrollments}</div>
                    </div>
                </div>
                <div class="feature-grid" style="margin-top: 32px;">
                    <div class="feature-card card">
                        <div class="feature-icon">👥</div>
                        <h4>User Management</h4>
                        <p>View and manage all system users</p>
                        <button class="btn btn-primary" style="margin-top: 12px; width: 100%;" onclick="Router.navigate('users')">Manage Users</button>
                    </div>
                    <div class="feature-card card">
                        <div class="feature-icon">📚</div>
                        <h4>Course Management</h4>
                        <p>Create and manage courses</p>
                        <button class="btn btn-primary" style="margin-top: 12px; width: 100%;" onclick="Router.navigate('courses')">Manage Courses</button>
                    </div>
                    <div class="feature-card card">
                        <div class="feature-icon">📊</div>
                        <h4>Reports</h4>
                        <p>View system statistics and reports</p>
                        <button class="btn btn-primary" style="margin-top: 12px; width: 100%;">View Reports</button>
                    </div>
                </div>
            `;
        }
        container.innerHTML = content;
    },
    users(container) {
        const users = Store.get('users');
        const studentCount = users.filter(u => u.role === 'student').length;
        const instructorCount = users.filter(u => u.role === 'instructor').length;
        
        container.innerHTML = `
            <h1>User Management</h1>
            <div class="stats-grid" style="margin: 20px 0;">
                <div class="card stat-card">
                    <h4>👤 Students</h4>
                    <div class="value">${studentCount}</div>
                </div>
                <div class="card stat-card">
                    <h4>👨‍🏫 Instructors</h4>
                    <div class="value">${instructorCount}</div>
                </div>
                <div class="card stat-card">
                    <h4>⚙️ Admins</h4>
                    <div class="value">1</div>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td class="mono">${u.email}</td>
                                <td><span class="badge badge-secondary">${u.role}</span></td>
                                <td><span class="badge badge-success">Active</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    courses(container) {
        const courses = Store.get('courses');
        const user = Store.getCurrentUser();
        
        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h1>Courses</h1>
                ${user.role === 'instructor' ? '<button class="btn btn-primary" onclick="Views.openCourseModal()">+ Create Course</button>' : ''}
            </div>
            <div class="course-grid">
                ${courses.map(c => `
                    <div class="course-card">
                        <div class="course-card-header" style="background: linear-gradient(135deg, ${c.color}dd, ${c.color});">
                            <h3>${c.name}</h3>
                        </div>
                        <div class="course-card-body">
                            <div class="code">${c.code}</div>
                            <p>${c.desc}</p>
                            <div class="course-card-footer">
                                <small style="color: var(--text-muted);">Instructor: Prof. Smith</small>
                            </div>
                        </div>
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
            <p style="color: var(--text-muted); margin-bottom: 20px;">You are enrolled in ${myCourses.length} course${myCourses.length !== 1 ? 's' : ''}</p>
            <div class="course-grid">
                ${myCourses.map(c => `
                    <div class="course-card">
                        <div class="course-card-header" style="background: linear-gradient(135deg, ${c.color}dd, ${c.color});">
                            <h3>${c.name}</h3>
                        </div>
                        <div class="course-card-body">
                            <div class="code">${c.code}</div>
                            <p>${c.desc}</p>
                            <div class="course-card-footer">
                                <button class="btn btn-secondary" style="width: 100%; font-size: 0.85rem;" onclick="Router.navigate('assignments')">View Assignments</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    assignments(container) {
        const user = Store.getCurrentUser();
        const assignments = Store.get('assignments');
        const enrollments = Store.get('enrollments');
        
        let filteredAssignments = assignments;
        if (user.role === 'student') {
            const courseIds = enrollments.filter(e => e.studentId === user.id).map(e => e.courseId);
            filteredAssignments = assignments.filter(a => courseIds.includes(a.courseId));
        }
        
        container.innerHTML = `
            <h1>Assignments</h1>
            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Course</th>
                            <th>Due Date</th>
                            <th>Max Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAssignments.map(a => {
                            const course = Store.get('courses').find(c => c.id === a.courseId);
                            return `
                                <tr>
                                    <td><strong>${a.title}</strong></td>
                                    <td><span class="badge badge-info">${course?.code}</span></td>
                                    <td class="mono">${new Date(a.due).toLocaleDateString()}</td>
                                    <td>${a.maxScore} pts</td>
                                    <td><button class="btn btn-primary" onclick="Views.openSubmitModal('${a.id}')">Submit</button></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    grading(container) {
        const user = Store.getCurrentUser();
        const courses = Store.get('courses').filter(c => c.instructorId === user.id);
        const assignments = Store.get('assignments').filter(a => courses.some(c => c.id === a.courseId));
        
        container.innerHTML = `
            <h1>Grading</h1>
            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>Assignment</th>
                            <th>Student</th>
                            <th>Submitted</th>
                            <th>Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${assignments.length > 0 ? assignments.map(a => `
                            <tr>
                                <td><strong>${a.title}</strong></td>
                                <td>Alice Johnson</td>
                                <td class="mono">2025-12-14</td>
                                <td><span class="badge badge-success">95/100</span></td>
                                <td><button class="btn btn-primary" onclick="Views.openGradeModal()">Grade</button></td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">No submissions to grade yet</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },
    mySubmissions(container) {
        const user = Store.getCurrentUser();
        const submissions = Store.get('submissions').filter(s => s.studentId === user.id);
        
        container.innerHTML = `
            <h1>My Submissions</h1>
            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>Assignment</th>
                            <th>Submitted</th>
                            <th>Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${submissions.length > 0 ? submissions.map(s => {
                            const assignment = Store.get('assignments').find(a => a.id === s.assignmentId);
                            return `
                                <tr>
                                    <td><strong>${assignment?.title}</strong></td>
                                    <td class="mono">${new Date(s.submittedAt).toLocaleDateString()}</td>
                                    <td><span class="badge badge-success">${s.score}/${assignment?.maxScore}</span></td>
                                    <td><span class="badge badge-success">Graded</span></td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px;">No submissions yet</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },
    openCourseModal() {
        UI.modal('Create Course', `
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="course-name" placeholder="e.g., Web Development">
            </div>
            <div class="form-group">
                <label>Course Code</label>
                <input type="text" id="course-code" placeholder="e.g., WEB301">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="course-desc" rows="3" placeholder="Course description..."></textarea>
            </div>
        `, '<button class="btn btn-primary" onclick="UI.closeModal(); UI.notify(\'Course created successfully\', \'success\')">Create</button> <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>');
    },
    openSubmitModal(id) {
        UI.modal('Submit Assignment', `
            <div class="form-group">
                <label>Upload File</label>
                <div style="border:2px dashed var(--border);padding:40px;text-align:center;border-radius:12px;cursor:pointer;background: var(--surface-alt);">
                    📁 Drag & Drop your file here or click to browse
                </div>
            </div>
            <div class="form-group">
                <label>Submission Notes</label>
                <textarea id="submit-notes" rows="3" placeholder="Add any notes about your submission..."></textarea>
            </div>
        `, '<button class="btn btn-primary" onclick="UI.closeModal(); UI.notify(\'Assignment submitted successfully!\', \'success\')">Submit</button> <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>');
    },
    openGradeModal() {
        UI.modal('Grade Submission', `
            <div class="form-group">
                <label>Student: Alice Johnson</label>
                <input type="text" value="Alice Johnson" disabled>
            </div>
            <div class="form-group">
                <label>Score</label>
                <input type="number" min="0" max="100" placeholder="e.g., 95" id="grade-score">
            </div>
            <div class="form-group">
                <label>Feedback</label>
                <textarea id="grade-feedback" rows="3" placeholder="Provide constructive feedback..."></textarea>
            </div>
        `, '<button class="btn btn-primary" onclick="UI.closeModal(); UI.notify(\'Grade submitted successfully\', \'success\')">Submit Grade</button> <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>');
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
            <div class="nav-item" onclick="Router.navigate('${l}')">${l === 'submissions' ? 'My Submissions' : l.charAt(0).toUpperCase() + l.slice(1).replace('-', ' ')}</div>
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
                    <button class="btn btn-primary" style="width:100%;margin-bottom:15px" onclick="Auth.login(document.getElementById('login-email').value, document.getElementById('login-pass').value)">Login</button>
                    <div class="auth-footer">
                        <strong>Demo Accounts:</strong><br>
                        Student: alice@student.edu | pass123<br>
                        Instructor: prof.smith@uni.edu | prof123<br>
                        Admin: admin@uni.edu | admin123
                    </div>
                </div>
            </div>
        `;
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());
