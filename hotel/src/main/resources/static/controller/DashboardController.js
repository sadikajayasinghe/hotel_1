/**
 * DashboardController.js
 * Computes live business metrics, summary indicators, and quick action redirects.
 */

import { DB } from '../db/db.js';

export class DashboardController {
    static getAuthHeaders() {
        const token = localStorage.getItem('JWT');
        // Do not send the dummy demo token to the backend – it is rejected
        // and causes dashboard data to fail with “Unauthorized”.
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.loadDashboardData();

        $(document).on('section:shown:dashboard_content', () => {
            this.loadDashboardData();
        });
    }

    static loadDashboardData() {
        const custUrl = window.location.origin.includes('8080') ? '/v1/customers' : 'http://localhost:8080/v1/customers';
        const roomUrl = window.location.origin.includes('8080') ? '/v1/rooms' : 'http://localhost:8080/v1/rooms';
        const resUrl = window.location.origin.includes('8080') ? '/v1/reservations' : 'http://localhost:8080/v1/reservations';

        // 1. Customers Count
        $.ajax({
            url: custUrl,
            type: 'GET',
            headers: this.getAuthHeaders(),
            success: (resp) => {
                const count = resp && resp.body ? resp.body.length : 0;
                $('#dash_total_customers').text(count);
            }
        });

        // 2. Available Rooms
        $.ajax({
            url: roomUrl,
            type: 'GET',
            headers: this.getAuthHeaders(),
            success: (resp) => {
                const rooms = resp && resp.body ? resp.body : [];
                const available = rooms.filter(r => (r.status || '').toUpperCase() === 'AVAILABLE').length;
                $('#dash_available_rooms').text(available);
            }
        });

        // 3. Reservations & Revenue & Recent bookings
        $.ajax({
            url: resUrl,
            type: 'GET',
            headers: this.getAuthHeaders(),
            success: (resp) => {
                const reservations = resp && resp.body ? resp.body : [];
                const active = reservations.filter(r => {
                    const st = (r.status || '').toUpperCase();
                    return st === 'CONFIRMED' || st === 'CHECKED_IN';
                }).length;
                $('#dash_active_reservations').text(active);

                const revenue = reservations.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
                $('#dash_total_revenue').text(`LKR ${(revenue / 1000).toFixed(1)}k`);

                this.renderRecentBookings(reservations);
            }
        });
    }

    static renderRecentBookings(reservations) {
        const recent = (reservations || []).slice(-4).reverse();
        const $tbody = $('#dash_recent_tbody');
        $tbody.empty();

        if (recent.length === 0) {
            $tbody.html('<tr><td colspan="5" class="text-center py-3 text-muted">No recent bookings.</td></tr>');
            return;
        }

        recent.forEach(r => {
            const resNum = r.reservationNumber || ('#' + r.reservationId);
            const status = (r.status || 'CONFIRMED').toUpperCase();
            let statusBadge = '<span class="badge bg-primary">Confirmed</span>';
            if (status === 'CHECKED_IN') statusBadge = '<span class="badge bg-success">Checked In</span>';
            if (status === 'CHECKED_OUT') statusBadge = '<span class="badge bg-secondary">Checked Out</span>';
            if (status === 'CANCELLED') statusBadge = '<span class="badge bg-danger">Cancelled</span>';

            const row = `
                <tr>
                    <td class="fw-bold text-secondary">#${resNum}</td>
                    <td class="fw-semibold">${r.customerName || 'Customer #' + r.customerId}</td>
                    <td>Room #${r.roomNumber || r.roomId}</td>
                    <td>${r.checkInDate || '-'}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    }
}

