// js/views.js — all view render functions connected to real APIs
import { Api } from './api.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { Router } from './router.js';

/* ─────────────────────────────────────────
   Colour palette for auto-assigned cards
───────────────────────────────────────── */
const CARD_COLOURS = [
    '#4A90E2','#50C878','#FF8C42','#9B59B6',
    '#E74C3C','#3498DB','#F39C12','#1ABC9C',
];
function cardColour(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return CARD_COLOURS[h % CARD_COLOURS.length];
}

/* ─────────────────────────────────────────
   Reusable course card HTML
───────────────────────────────────────── */
function courseCard(c, footerHTML = '') {
    const col = cardColour(c.id || c.title || '');
    return `
        <div class="course-card">
            <div class="course-card-header" style="background:linear-gradient(135deg,${col}dd,${col})">
                <h3>${c.title}</h3>
            </div>
            <div class="course-card-body">
                <p>${c.description || '<em style="color:var(--text-muted)">No description</em>'}</p>
                <small style="color:var(--text-muted)">Instructor: ${c.instructorName || '—'} · ${c.studentCount ?? 0} student${c.studentCount !== 1 ? 's' : ''}</small>
                <div class="course-card-footer">${footerHTML}</div>
            </div>
        </div>`;
}

export const Views = {

    /* ══════════════════ DASHBOARD ══════════════════ */
    async dashboard(container) {
        const session = Auth.getSession();
        const role = session.role.toLowerCase();

        if (role === 'student') {
            try {
                const data = await Api.getStudentDashboard();
                const submitted  = data.filter(d => d.submitted).length;
                const total      = data.length;
                const graded     = data.filter(d => d.grade != null);
                const avgGrade   = graded.length
                    ? Math.round(graded.reduce((s, d) => s + d.grade, 0) / graded.length)
                    : null;

                container.innerHTML = `
                    <div class="hero-section">
                        <h1>Welcome back, ${session.name}! 👋</h1>
                        <p>Keep up with your assignments and ace your courses.</p>
                    </div>
                    <div class="stats-grid">
                        <div class="card stat-card"><h4>📚 Assignments</h4><div class="value">${total}</div></div>
                        <div class="card stat-card"><h4>✅ Submitted</h4><div class="value">${submitted}</div></div>
                        <div class="card stat-card"><h4>⭐ Avg Grade</h4><div class="value">${avgGrade != null ? avgGrade + '%' : 'N/A'}</div></div>
                    </div>
                    <h2 style="margin:28px 0 16px">Upcoming Assignments</h2>
                    ${total === 0 ? UI.emptyState('📭', 'No assignments yet. Enroll in some courses!') : `
                    <div class="table-container">
                        <table>
                            <thead><tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Status</th><th>Grade</th></tr></thead>
                            <tbody>
                                ${data.map(d => `
                                    <tr>
                                        <td><strong>${d.assignmentTitle}</strong></td>
                                        <td>${UI.badge(d.courseTitle, 'info')}</td>
                                        <td class="mono">${UI.fmtDate(d.deadline)}</td>
                                        <td>${d.submitted ? UI.badge('Submitted','success') : UI.badge('Pending','warning')}</td>
                                        <td>${d.grade != null ? UI.badge(d.grade + '%', d.grade >= 50 ? 'success' : 'danger') : '—'}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>`}
                `;
            } catch (err) {
                container.innerHTML = `<p class="empty-state">${UI.emptyState('⚠️', err.message)}</p>`;
            }

        } else if (role === 'instructor') {
            try {
                const data = await Api.getInstructorDashboard();
                const pending = data.reduce((s, d) => s + d.pendingSubmissionsCount, 0);
                const courses = new Set(data.map(d => d.courseId)).size;

                container.innerHTML = `
                    <div class="hero-section">
                        <h1>Welcome, ${session.name}! 🎓</h1>
                        <p>Manage your courses and track student progress.</p>
                    </div>
                    <div class="stats-grid">
                        <div class="card stat-card"><h4>📖 Courses</h4><div class="value">${courses}</div></div>
                        <div class="card stat-card"><h4>📝 Assignments</h4><div class="value">${data.length}</div></div>
                        <div class="card stat-card"><h4>⏳ Pending Grading</h4><div class="value">${pending}</div></div>
                    </div>
                    <h2 style="margin:28px 0 16px">Assignment Overview</h2>
                    ${data.length === 0 ? UI.emptyState('📭', 'No assignments yet.') : `
                    <div class="table-container">
                        <table>
                            <thead><tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Pending Submissions</th></tr></thead>
                            <tbody>
                                ${data.map(d => `
                                    <tr>
                                        <td><strong>${d.assignmentTitle}</strong></td>
                                        <td>${UI.badge(d.courseTitle, 'info')}</td>
                                        <td class="mono">${UI.fmtDate(d.deadline)}</td>
                                        <td>${d.pendingSubmissionsCount > 0
                                            ? UI.badge(d.pendingSubmissionsCount + ' pending', 'warning')
                                            : UI.badge('All graded', 'success')}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>`}
                `;
            } catch (err) {
                container.innerHTML = UI.emptyState('⚠️', err.message);
            }

        } else {
            // ADMIN
            try {
                const courses = await Api.getAllCourses();
                container.innerHTML = `
                    <div class="hero-section">
                        <h1>Admin Dashboard 🛠️</h1>
                        <p>Manage courses and monitor system activity.</p>
                    </div>
                    <div class="stats-grid">
                        <div class="card stat-card"><h4>📚 Total Courses</h4><div class="value">${courses.length}</div></div>
                        <div class="card stat-card"><h4>👥 Total Students</h4><div class="value">${courses.reduce((s,c)=>s+c.studentCount,0)}</div></div>
                    </div>
                    <div class="feature-grid" style="margin-top:32px">
                        <div class="feature-card card">
                            <div class="feature-icon">📚</div>
                            <h4>Course Management</h4>
                            <p>View all courses</p>
                            <button class="btn btn-primary" style="margin-top:12px;width:100%" onclick="window.__Router.navigate('courses')">Manage Courses</button>
                        </div>
                    </div>
                `;
            } catch (err) {
                container.innerHTML = UI.emptyState('⚠️', err.message);
            }
        }
    },

    /* ══════════════════ ALL COURSES (Admin / browsing) ══════════════════ */
    async courses(container) {
        try {
            const courses = await Api.getAllCourses();
            container.innerHTML = `
                <h1>All Courses</h1>
                ${courses.length === 0 ? UI.emptyState('📭', 'No courses found.') : `
                <div class="course-grid">
                    ${courses.map(c => courseCard(c)).join('')}
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ ENROLL (Student — browse + enroll) ══════════════════ */
    async enroll(container) {
        try {
            const [all, enrolled] = await Promise.all([
                Api.getAllCourses(),
                Api.getEnrolledCourses(),
            ]);
            const enrolledIds = new Set(enrolled.map(c => c.id));

            container.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h1>Browse Courses</h1>
                </div>
                ${all.length === 0 ? UI.emptyState('📭', 'No courses available yet.') : `
                <div class="course-grid">
                    ${all.map(c => {
                        const isEnrolled = enrolledIds.has(c.id);
                        const footer = isEnrolled
                            ? `<button class="btn btn-secondary" style="width:100%" disabled>✓ Enrolled</button>`
                            : `<button class="btn btn-primary" style="width:100%" id="enroll-${c.id}" onclick="window.__Views.doEnroll('${c.id}')">Enroll</button>`;
                        return courseCard(c, footer);
                    }).join('')}
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    async doEnroll(courseId) {
        const btn = document.getElementById(`enroll-${courseId}`);
        if (btn) UI.setLoading(btn, true);
        try {
            await Api.enrollInCourse(courseId);
            UI.notify('Enrolled successfully!', 'success');
            Router.navigate('enroll');
        } catch (err) {
            UI.notify(err.message, 'error');
            if (btn) UI.setLoading(btn, false);
        }
    },

    /* ══════════════════ MY COURSES (Student) ══════════════════ */
    async myCourses(container) {
        try {
            const courses = await Api.getEnrolledCourses();
            container.innerHTML = `
                <h1>My Courses</h1>
                <p style="color:var(--text-muted);margin-bottom:20px">Enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}</p>
                ${courses.length === 0 ? UI.emptyState('📭', 'Not enrolled in any courses yet.') : `
                <div class="course-grid">
                    ${courses.map(c => courseCard(c, `
                        <button class="btn btn-secondary" style="width:100%;font-size:.85rem"
                            onclick="window.__Router.navigate('assignments')">
                            View Assignments
                        </button>`)).join('')}
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ INSTRUCTOR — MY COURSES (teaching) ══════════════════ */
    async teachingCourses(container) {
        try {
            const courses = await Api.getTeachingCourses();
            container.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h1>My Courses</h1>
                    <button class="btn btn-primary" onclick="window.__Views.openCreateCourseModal()">+ Create Course</button>
                </div>
                ${courses.length === 0 ? UI.emptyState('📭', 'No courses yet.') : `
                <div class="course-grid">
                    ${courses.map(c => courseCard(c, `
                        <button class="btn btn-primary" style="width:100%"
                            onclick="window.__Views.openCreateAssignmentModal('${c.id}')">
                            + Add Assignment
                        </button>`)).join('')}
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ ASSIGNMENTS ══════════════════ */
    async assignments(container) {
        const session = Auth.getSession();
        const role = session.role.toLowerCase();

        try {
            let rows = '';
            if (role === 'student') {
                const enrolled = await Api.getEnrolledCourses();
                if (enrolled.length === 0) {
                    container.innerHTML = `<h1>Assignments</h1>${UI.emptyState('📭','Enroll in courses to see assignments.')}`;
                    return;
                }
                const allAssignments = (await Promise.all(
                    enrolled.map(c => Api.getAssignments(c.id).catch(() => []))
                )).flat();

                rows = allAssignments.length === 0
                    ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px">No assignments yet</td></tr>`
                    : allAssignments.map(a => `
                        <tr>
                            <td><strong>${a.title}</strong><br><small style="color:var(--text-muted)">${a.description || ''}</small></td>
                            <td>${UI.badge(a.courseTitle,'info')}</td>
                            <td class="mono">${UI.fmtDate(a.deadline)}</td>
                            <td>${a.title ? new Date(a.deadline) < new Date() ? UI.badge('Past due','danger') : UI.badge('Open','success') : ''}</td>
                            <td><button class="btn btn-primary btn-sm" onclick="window.__Views.openSubmitModal('${a.id}','${a.title.replace(/'/g,"\\'")}')">Submit</button></td>
                        </tr>`).join('');

            } else if (role === 'instructor') {
                const courses = await Api.getTeachingCourses();
                const allAssignments = (await Promise.all(
                    courses.map(c => Api.getAssignments(c.id).catch(() => []))
                )).flat();

                rows = allAssignments.length === 0
                    ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px">No assignments yet</td></tr>`
                    : allAssignments.map(a => `
                        <tr>
                            <td><strong>${a.title}</strong></td>
                            <td>${UI.badge(a.courseTitle,'info')}</td>
                            <td class="mono">${UI.fmtDate(a.deadline)}</td>
                            <td><button class="btn btn-secondary btn-sm" onclick="window.__Router.navigate('grading')">View Submissions</button></td>
                        </tr>`).join('');
            }

            container.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h1>Assignments</h1>
                    ${role === 'instructor' ? `<button class="btn btn-primary" onclick="window.__Views.openPickCourseForAssignment()">+ Create Assignment</button>` : ''}
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th>Title</th><th>Course</th><th>Deadline</th>
                            ${role === 'student' ? '<th>Status</th>' : ''}
                            <th>Action</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>`;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ GRADING ══════════════════ */
    async grading(container) {
        try {
            const submissions = await Api.getPendingSubmissions();
            container.innerHTML = `
                <h1>Grading</h1>
                <p style="color:var(--text-muted);margin-bottom:20px">${submissions.length} pending submission${submissions.length !== 1 ? 's' : ''}</p>
                ${submissions.length === 0 ? UI.emptyState('🎉', 'All submissions graded!') : `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Student</th><th>Assignment</th><th>Submitted</th><th>Grade</th><th>Action</th></tr></thead>
                        <tbody>
                            ${submissions.map(s => `
                                <tr>
                                    <td><strong>${s.studentName}</strong></td>
                                    <td>${s.assignmentTitle || '—'}</td>
                                    <td class="mono">${UI.fmtDate(s.submissionTime)}</td>
                                    <td>${s.grade != null ? UI.badge(s.grade + '%', s.grade >= 50 ? 'success' : 'danger') : UI.badge('Ungraded','warning')}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="window.__Views.openGradeModal('${s.id}','${(s.studentName||'').replace(/'/g,"\\'")}','${(s.assignmentTitle||'').replace(/'/g,"\\'")}')">Grade</button>
                                        ${s.storagePath ? `<button class="btn btn-secondary btn-sm" style="margin-left:6px" onclick="window.__Views.downloadFile('${s.id}')">⬇ File</button>` : ''}
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ MY SUBMISSIONS (Student) ══════════════════ */
    async mySubmissions(container) {
        try {
            const session = Auth.getSession();
            // Build from dashboard data since we have submission info there
            const data = await Api.getStudentDashboard();
            const submitted = data.filter(d => d.submitted);

            container.innerHTML = `
                <h1>My Submissions</h1>
                ${submitted.length === 0 ? UI.emptyState('📭', 'No submissions yet.') : `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Assignment</th><th>Course</th><th>Submitted At</th><th>Grade</th><th>Feedback</th></tr></thead>
                        <tbody>
                            ${submitted.map(s => `
                                <tr>
                                    <td><strong>${s.assignmentTitle}</strong></td>
                                    <td>${UI.badge(s.courseTitle,'info')}</td>
                                    <td class="mono">${UI.fmtDate(s.submissionTime)}</td>
                                    <td>${s.grade != null ? UI.badge(s.grade + '%', s.grade >= 50 ? 'success' : 'danger') : UI.badge('Pending','warning')}</td>
                                    <td><small style="color:var(--text-muted)">${s.feedback || '—'}</small></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`}
            `;
        } catch (err) {
            container.innerHTML = UI.emptyState('⚠️', err.message);
        }
    },

    /* ══════════════════ USERS (Admin) ══════════════════ */
    async users(container) {
        container.innerHTML = `
            <h1>User Management</h1>
            <p style="color:var(--text-muted);margin-top:12px">
                User listing requires a dedicated admin API endpoint not yet exposed by the backend.
                Please manage users via your database or add a GET /api/admin/users endpoint.
            </p>
            ${UI.emptyState('🔒', 'Admin user list coming soon.')}`;
    },

    /* ══════════════════ MODALS ══════════════════ */
    openSubmitModal(assignmentId, title) {
        let fileRef = null;
        UI.modal(`Submit: ${title}`, `
            <div class="form-group">
                <label>Upload File <span style="color:var(--danger)">*</span></label>
                <div id="drop-zone" style="border:2px dashed var(--border);padding:40px;text-align:center;border-radius:12px;cursor:pointer;background:var(--surface-alt);transition:.2s" 
                     onclick="document.getElementById('file-input').click()"
                     ondragover="event.preventDefault();this.style.borderColor='var(--primary)'"
                     ondragleave="this.style.borderColor='var(--border)'"
                     ondrop="event.preventDefault();window.__Views._handleDrop(event)">
                    📁 Drag &amp; drop or <strong>click to browse</strong>
                    <div id="file-label" style="margin-top:8px;color:var(--text-muted);font-size:.85rem"></div>
                </div>
                <input type="file" id="file-input" style="display:none" onchange="window.__Views._handleFileSelect(this)">
            </div>
            <div class="form-group">
                <label>Notes (optional)</label>
                <textarea id="submit-notes" rows="3" placeholder="Add any notes..."></textarea>
            </div>
        `, `
            <button class="btn btn-secondary" onclick="window.__UI.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="submit-btn" onclick="window.__Views.doSubmit('${assignmentId}')">Submit</button>
        `);
    },

    _selectedFile: null,
    _handleFileSelect(input) {
        if (input.files[0]) {
            this._selectedFile = input.files[0];
            const lbl = document.getElementById('file-label');
            if (lbl) lbl.textContent = `Selected: ${this._selectedFile.name}`;
        }
    },
    _handleDrop(event) {
        const file = event.dataTransfer.files[0];
        if (file) {
            this._selectedFile = file;
            const lbl = document.getElementById('file-label');
            if (lbl) lbl.textContent = `Selected: ${file.name}`;
        }
    },

    async doSubmit(assignmentId) {
        if (!this._selectedFile) { UI.notify('Please select a file', 'error'); return; }
        const btn = document.getElementById('submit-btn');
        UI.setLoading(btn, true);
        try {
            await Api.submitAssignment(assignmentId, this._selectedFile);
            this._selectedFile = null;
            UI.closeModal();
            UI.notify('Assignment submitted successfully!', 'success');
            Router.navigate('submissions');
        } catch (err) {
            UI.notify(err.message, 'error');
            UI.setLoading(btn, false);
        }
    },

    openGradeModal(submissionId, studentName, assignmentTitle) {
        UI.modal(`Grade Submission`, `
            <div class="form-group">
                <label>Student</label>
                <input type="text" value="${studentName}" disabled>
            </div>
            <div class="form-group">
                <label>Assignment</label>
                <input type="text" value="${assignmentTitle}" disabled>
            </div>
            <div class="form-group">
                <label>Score (0–100) <span style="color:var(--danger)">*</span></label>
                <input type="number" id="grade-score" min="0" max="100" placeholder="e.g. 85">
            </div>
            <div class="form-group">
                <label>Feedback</label>
                <textarea id="grade-feedback" rows="3" placeholder="Constructive feedback..."></textarea>
            </div>
        `, `
            <button class="btn btn-secondary" onclick="window.__UI.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="grade-btn" onclick="window.__Views.doGrade('${submissionId}')">Submit Grade</button>
        `);
    },

    async doGrade(submissionId) {
        const scoreEl = document.getElementById('grade-score');
        const feedbackEl = document.getElementById('grade-feedback');
        const score = parseFloat(scoreEl?.value);
        if (isNaN(score) || score < 0 || score > 100) {
            UI.notify('Enter a valid score (0–100)', 'error'); return;
        }
        const btn = document.getElementById('grade-btn');
        UI.setLoading(btn, true);
        try {
            await Api.gradeSubmission(submissionId, score, feedbackEl?.value || '');
            UI.closeModal();
            UI.notify('Grade submitted!', 'success');
            Router.navigate('grading');
        } catch (err) {
            UI.notify(err.message, 'error');
            UI.setLoading(btn, false);
        }
    },

    async downloadFile(submissionId) {
        try {
            const blob = await Api.downloadSubmission(submissionId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'submission';
            document.body.appendChild(a); a.click();
            a.remove(); URL.revokeObjectURL(url);
        } catch (err) {
            UI.notify(err.message, 'error');
        }
    },

    openCreateCourseModal() {
        UI.modal('Create Course', `
            <div class="form-group">
                <label>Title <span style="color:var(--danger)">*</span></label>
                <input type="text" id="course-title" placeholder="e.g. Web Development">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="course-desc" rows="3" placeholder="Course description..."></textarea>
            </div>
        `, `
            <button class="btn btn-secondary" onclick="window.__UI.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="create-course-btn" onclick="window.__Views.doCreateCourse()">Create</button>
        `);
    },

    async doCreateCourse() {
        const title = document.getElementById('course-title')?.value?.trim();
        const desc  = document.getElementById('course-desc')?.value?.trim();
        if (!title) { UI.notify('Title is required', 'error'); return; }
        const btn = document.getElementById('create-course-btn');
        UI.setLoading(btn, true);
        try {
            await Api.createCourse({ title, description: desc });
            UI.closeModal();
            UI.notify('Course created!', 'success');
            Router.navigate('my-courses');
        } catch (err) {
            UI.notify(err.message, 'error');
            UI.setLoading(btn, false);
        }
    },

    async openPickCourseForAssignment() {
        try {
            const courses = await Api.getTeachingCourses();
            if (courses.length === 0) { UI.notify('Create a course first', 'error'); return; }
            UI.modal('Select Course', `
                <div class="form-group">
                    <label>Course</label>
                    <select id="pick-course">
                        ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                    </select>
                </div>
            `, `
                <button class="btn btn-secondary" onclick="window.__UI.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="window.__Views.openCreateAssignmentModal(document.getElementById('pick-course').value)">Next</button>
            `);
        } catch (err) {
            UI.notify(err.message, 'error');
        }
    },

    openCreateAssignmentModal(courseId) {
        UI.modal('Create Assignment', `
            <div class="form-group">
                <label>Title <span style="color:var(--danger)">*</span></label>
                <input type="text" id="asgn-title" placeholder="e.g. Lab 1">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="asgn-desc" rows="3" placeholder="Assignment details..."></textarea>
            </div>
            <div class="form-group">
                <label>Deadline <span style="color:var(--danger)">*</span></label>
                <input type="datetime-local" id="asgn-deadline">
            </div>
        `, `
            <button class="btn btn-secondary" onclick="window.__UI.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="create-asgn-btn" onclick="window.__Views.doCreateAssignment('${courseId}')">Create</button>
        `);
    },

    async doCreateAssignment(courseId) {
        const title    = document.getElementById('asgn-title')?.value?.trim();
        const desc     = document.getElementById('asgn-desc')?.value?.trim();
        const deadline = document.getElementById('asgn-deadline')?.value;
        if (!title)    { UI.notify('Title is required', 'error'); return; }
        if (!deadline) { UI.notify('Deadline is required', 'error'); return; }
        const btn = document.getElementById('create-asgn-btn');
        UI.setLoading(btn, true);
        try {
            await Api.createAssignment(courseId, { title, description: desc, deadline });
            UI.closeModal();
            UI.notify('Assignment created!', 'success');
            Router.navigate('assignments');
        } catch (err) {
            UI.notify(err.message, 'error');
            UI.setLoading(btn, false);
        }
    },
};
