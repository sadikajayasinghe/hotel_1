/**
 * CheckinController.js
 * Dedicated Check-in / Check-out lobby: summary cards, reservation finder,
 * and one-click guest check-in / check-out actions.
 */

export class CheckinController {
    static cachedReservations = [];

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/reservations'
            : 'http://localhost:8080/v1/reservations';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem('JWT');
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();

        $(document).on('section:shown:checkin_content', () => {
            this.loadCheckins();
        });
    }

    static bindEvents() {
        $('#btn_refresh_checkin').on('click', () => {
            this.loadCheckins();
        });

        $('#checkin_search_input, #checkin_status_filter').on('input change', () => {
            this.renderTable();
        });

        $('#checkin_tbody').on('click', '.btn-ci', (e) => {
            const resId = $(e.currentTarget).data('id');
            this.changeStatus(resId, 'CHECKED_IN', 'Guest Checked In', 'Guest has been checked in successfully.');
        });

        $('#checkin_tbody').on('click', '.btn-co', (e) => {
            const resId = $(e.currentTarget).data('id');
            this.changeStatus(resId, 'CHECKED_OUT', 'Guest Checked Out', 'Room released. Guest has been checked out successfully.');
        });
    }

    static loadCheckins() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                this.cachedReservations = response && response.body ? response.body : [];
                this.renderStats();
                this.renderTable();
            },
            error: (xhr) => {
                console.error('Failed to load check-in data:', xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#checkin_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#checkin_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">
                                Unable to load check-in data from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static renderStats() {
        const today = new Date().toISOString().split('T')[0];
        const reservations = this.cachedReservations || [];

        const awaiting = reservations.filter(r => ['CONFIRMED', 'PENDING'].includes(String(r.status || '').toUpperCase()));
        const dueToday = awaiting.filter(r => r.checkInDate === today);
        const checkedIn = reservations.filter(r => String(r.status || '').toUpperCase() === 'CHECKED_IN');
        const dueOutToday = checkedIn.filter(r => r.checkOutDate === today);
        const completed = reservations.filter(r => String(r.status || '').toUpperCase() === 'CHECKED_OUT');

        $('#checkin_awaiting_count').text(awaiting.length);
        $('#checkin_due_today_label').text(dueToday.length + ' due today');

        $('#checkin_checkedin_count').text(checkedIn.length);

        $('#checkin_dueout_count').text(checkedIn.length);
        $('#checkin_dueout_today_label').text(dueOutToday.length + ' departing today');

        $('#checkin_completed_count').text(completed.length);
    }

    static getFilteredReservations() {
        const q = ($('#checkin_search_input').val() || '').trim().toLowerCase();
        const statusFilter = ($('#checkin_status_filter').val() || '').toUpperCase();

        return (this.cachedReservations || []).filter(r => {
            if (statusFilter) {
                const st = String(r.status || '').toUpperCase();
                if (st !== statusFilter) return false;
            }
            if (!q) return true;

            const guest = String(r.customerName || '').toLowerCase();
            const room = String(r.roomNumber || r.roomId || '').toLowerCase();
            const ref = String(r.reservationNumber || r.reservationId || '').toLowerCase();
            return guest.includes(q) || room.includes(q) || ref.includes(q);
        });
    }

    static renderTable() {
        const $tbody = $('#checkin_tbody');
        $tbody.empty();

        const reservations = this.getFilteredReservations();

        if (!reservations.length) {
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fa-solid fa-door-open fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No reservations match this view.
                    </td>
                </tr>
            `);
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        reservations.forEach(r => {
            const id = r.reservationId;
            const resNum = r.reservationNumber || ('RES-' + id);
            const status = String(r.status || 'CONFIRMED').toUpperCase();
            const checkInDate = r.checkInDate || '-';
            const checkOutDate = r.checkOutDate || '-';

            let nights = 0;
            if (r.checkInDate && r.checkOutDate) {
                const diff = Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000);
                nights = Math.max(diff, 0);
            }

            let statusBadge;
            let actionBtn;
            let dueBadge = '';

            switch (status) {
                case 'CONFIRMED':
                    statusBadge = '<span class="badge bg-primary-subtle text-primary border border-primary">Confirmed</span>';
                    actionBtn = `<button class="btn btn-sm btn-success btn-ci" data-id="${id}" title="Check In Guest"><i class="fa-solid fa-key me-1"></i> Check In</button>`;
                    dueBadge = checkInDate === today ? '<span class="badge bg-warning-subtle text-warning border border-warning ms-1">Due Today</span>' : '';
                    break;
                case 'PENDING':
                    statusBadge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary">Pending</span>';
                    actionBtn = `<button class="btn btn-sm btn-success btn-ci" data-id="${id}" title="Check In Guest"><i class="fa-solid fa-key me-1"></i> Check In</button>`;
                    break;
                case 'CHECKED_IN':
                    statusBadge = '<span class="badge bg-success-subtle text-success border border-success">Checked In</span>';
                    actionBtn = `<button class="btn btn-sm btn-outline-warning btn-co" data-id="${id}" title="Check Out Guest"><i class="fa-solid fa-right-from-bracket me-1"></i> Check Out</button>`;
                    dueBadge = checkOutDate === today ? '<span class="badge bg-danger-subtle text-danger border border-danger ms-1">Departs Today</span>' : '';
                    break;
                case 'CHECKED_OUT':
                    statusBadge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary">Checked Out</span>';
                    actionBtn = '<span class="badge bg-light text-muted border">Completed</span>';
                    break;
                case 'CANCELLED':
                    statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger">Cancelled</span>';
                    actionBtn = '<span class="badge bg-light text-muted border">No Action</span>';
                    break;
                default:
                    statusBadge = `<span class="badge bg-light text-dark border">${status}</span>`;
                    actionBtn = '';
            }

            const row = `
                <tr>
                    <td class="fw-bold text-secondary">#${resNum}</td>
                    <td>
                        <div class="fw-semibold text-dark">${r.customerName || ('Customer #' + r.customerId)}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">Room #${r.roomNumber || r.roomId}</span></td>
                    <td>${checkInDate}${dueBadge}</td>
                    <td>${checkOutDate}</td>
                    <td><span class="badge bg-light text-dark border">${nights} night${nights === 1 ? '' : 's'}</span></td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    static changeStatus(resId, newStatus, title, message) {
        const res = this.cachedReservations.find(r => String(r.reservationId) === String(resId));
        if (!res) return;

        const payload = {
            ...res,
            status: newStatus
        };

        $.ajax({
            url: `${this.getBaseUrl()}/${resId}`,
            type: 'PUT',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: JSON.stringify(payload),
            success: () => {
                Swal.fire({
                    icon: 'success',
                    title: title,
                    text: message,
                    timer: 1500,
                    showConfirmButton: false
                });
                this.loadCheckins();
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Status Update Failed',
                    text: xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Could not update reservation status.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }
}