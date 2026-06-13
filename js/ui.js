// js/ui.js — toasts, modals, loading helpers
export const UI = {
    notify(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    modal(title, contentHTML, footerHTML = '') {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="modal-close" onclick="window.__UI.closeModal()">&times;</span>
            </div>
            <div class="modal-body">${contentHTML}</div>
            ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        `;
        overlay.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    },

    setLoading(el, isLoading) {
        if (isLoading) {
            el.dataset.origText = el.textContent;
            el.textContent = 'Loading…';
            el.disabled = true;
        } else {
            el.textContent = el.dataset.origText || el.textContent;
            el.disabled = false;
        }
    },

    emptyState(icon, msg) {
        return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${msg}</p></div>`;
    },

    /** Format ISO date string nicely */
    fmtDate(iso) {
        if (!iso) return '—';
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    },

    badge(text, variant = 'info') {
        return `<span class="badge badge-${variant}">${text}</span>`;
    }
};
