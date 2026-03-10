/**
 * Returns the CSS class for a status badge.
 */
export function getStatusBadgeClass(status) {
    switch (status) {
        case 'new': return 'badge badge-new';
        case 'follow_up': return 'badge badge-follow-up';
        case 'closed': return 'badge badge-closed';
        default: return 'badge';
    }
}

/**
 * Returns the CSS class for a source badge.
 */
export function getSourceBadgeClass(source) {
    switch (source) {
        case 'website': return 'badge badge-website';
        case 'whatsapp': return 'badge badge-whatsapp';
        case 'referral': return 'badge badge-referral';
        case 'ads': return 'badge badge-ads';
        default: return 'badge badge-other';
    }
}

/**
 * Formats a status label for display.
 */
export function formatStatus(status) {
    switch (status) {
        case 'new': return 'New';
        case 'follow_up': return 'Follow Up';
        case 'closed': return 'Closed';
        default: return status || '—';
    }
}

/**
* Formats a source label for display.
*/
export function formatSource(source) {
    if (!source) return '—';
    switch (source.toLowerCase()) {
        case 'website': return 'Website';
        case 'whatsapp': return 'WhatsApp';
        case 'referral': return 'Referral';
        case 'ads': return 'Ads';
        default: return source.charAt(0).toUpperCase() + source.slice(1);
    }
}

/**
 * Formats a timestamp into a relative time string.
 */
export function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Formats a full datetime for display.
 */
export function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Formats just the date.
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
