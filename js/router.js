// js/router.js — client-side router
import { Views } from './views.js';
import { Auth } from './auth.js';

const ROUTE_LABELS = {
    'dashboard':   'Dashboard',
    'courses':     'Courses',
    'my-courses':  'My Courses',
    'assignments': 'Assignments',
    'grading':     'Grading',
    'submissions': 'My Submissions',
    'users':       'User Management',
    'enroll':      'Enroll in Courses',
};

export const Router = {
    current: null,

    navigate(view) {
        this.current = view;
        const container = document.getElementById('main-content');
        const titleEl   = document.getElementById('view-title');

        titleEl.textContent = ROUTE_LABELS[view] || view;
        container.innerHTML = `<div class="empty-state"><div class="spinner"></div><p>Loading…</p></div>`;

        // Highlight active nav
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const active = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (active) active.classList.add('active');

        switch (view) {
            case 'dashboard':   Views.dashboard(container);    break;
            case 'courses':     Views.courses(container);      break;
            case 'my-courses':
                {
                    const session = Auth.getSession();
                    if (session && session.role.toLowerCase() === 'instructor') {
                        Views.teachingCourses(container);
                    } else {
                        Views.myCourses(container);
                    }
                }
                break;
            case 'assignments': Views.assignments(container);  break;
            case 'grading':     Views.grading(container);      break;
            case 'submissions': Views.mySubmissions(container); break;
            case 'users':       Views.users(container);        break;
            case 'enroll':      Views.enroll(container);       break;
            default:
                container.innerHTML = `<p style="color:var(--text-muted)">Unknown view.</p>`;
        }
    }
};
