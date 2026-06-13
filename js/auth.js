// js/auth.js — session state management
import { Api } from './api.js';
import { UI } from './ui.js';

const SESSION_KEY = 'lass_session';

export const Auth = {
    getSession() {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    },
    setSession(data) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    },
    clearSession() {
        localStorage.removeItem(SESSION_KEY);
    },
    isLoggedIn() {
        return !!this.getSession();
    },

    async login(email, password) {
        try {
            const data = await Api.login(email, password);
            // data: { token, id, name, email, role }
            this.setSession(data);
            UI.notify('Login successful', 'success');
            return data;
        } catch (err) {
            UI.notify(err.message || 'Invalid credentials', 'error');
            return null;
        }
    },

    async register(name, email, password, role) {
        try {
            const data = await Api.register(name, email, password, role);
            this.setSession(data);
            UI.notify('Registration successful', 'success');
            return data;
        } catch (err) {
            UI.notify(err.message || 'Registration failed', 'error');
            return null;
        }
    },

    logout() {
        this.clearSession();
        location.reload();
    }
};
