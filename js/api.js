// js/api.js — centralised fetch wrapper
import { BASE_URL } from './config.js';

function getToken() {
    const user = JSON.parse(localStorage.getItem('lass_session') || 'null');
    return user?.token || null;
}

async function request(method, path, body = null, isForm = false) {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isForm && body) headers['Content-Type'] = 'application/json';

    const options = { method, headers };
    if (body) options.body = isForm ? body : JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);

    // No content
    if (res.status === 204 || res.status === 200 && res.headers.get('content-length') === '0') {
        return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
            const errData = await res.json();
            errMsg = errData.message || errData.error || errMsg;
        } catch (_) { /* ignore */ }
        throw new Error(errMsg);
    }

    if (contentType.includes('application/json')) return res.json();
    if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) return res.blob();
    return res.text();
}

export const Api = {
    get:    (path)              => request('GET',    path),
    post:   (path, body)       => request('POST',   path, body),
    put:    (path, body)       => request('PUT',    path, body),
    delete: (path)             => request('DELETE', path),
    upload: (path, formData)   => request('POST',   path, formData, true),

    // Auth
    login:    (email, password)          => Api.post('/api/auth/login',    { email, password }),
    register: (name, email, password, role) => Api.post('/api/auth/register', { name, email, password, role }),

    // Courses
    getAllCourses:      ()           => Api.get('/api/courses'),
    getEnrolledCourses: ()          => Api.get('/api/courses/enrolled'),
    getTeachingCourses: ()          => Api.get('/api/courses/teaching'),
    createCourse:      (data)       => Api.post('/api/courses', data),
    enrollInCourse:    (courseId)   => Api.post(`/api/courses/${courseId}/enroll`),

    // Assignments
    getAssignments:    (courseId)   => Api.get(`/api/courses/${courseId}/assignments`),
    createAssignment:  (courseId, data) => Api.post(`/api/courses/${courseId}/assignments`, data),

    // Dashboard
    getStudentDashboard:    () => Api.get('/api/dashboards/student'),
    getInstructorDashboard: () => Api.get('/api/dashboards/instructor'),

    // Submissions
    submitAssignment: (assignmentId, file) => {
        const fd = new FormData();
        fd.append('file', file);
        return Api.upload(`/api/assignments/${assignmentId}/submit`, fd);
    },
    getPendingSubmissions:  ()             => Api.get('/api/submissions/pending'),
    gradeSubmission:        (submissionId, grade, feedback) =>
        Api.put(`/api/submissions/${submissionId}/grade`, { grade, feedback }),
    downloadSubmission:     (submissionId) => Api.get(`/api/submissions/${submissionId}/download`),
};
