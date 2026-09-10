/**
 * ReportController.js
 * Builds a management summary report entirely from the existing REST APIs
 * (customers, rooms, reservations, payments). No dedicated backend is needed.
 */

export class ReportController {
    static getUrl(path) {
        return window.location.origin.includes('8080')
            ? '/v1' + path
            : 'http://localhost:8080/v1' + path;
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();

        $(document).on('section:shown:report_content', () => {
            this.loadReport();
        });
    }

    static bindEvents() {
        $('#btn_reload_report').on('click', () => {
            this.loadReport();
        });

        $('#btn_print_report').on('click', () => {
            window.print();
        });
    }

    static loadReport() {
        const configs = [
            { key: 'customers', url: this.getUrl('/customers') },
            { key: 'rooms', url: this.getUrl('/rooms') },
            { key: 'reservations', url: this.getUrl('/reservations') },
            { key: 'payments', url: this.getUrl('/payments') }
        ];

        $('#report_generated_on').text('Generated on ' + new Date().toLocaleString());

        const requests = configs.map(cfg =>
            $.ajax({
                url: cfg.url,
                type: 'GET',
                contentType: 'application/json',
                headers: this.getAuthHeaders(),
                dataType: 'json'
            }).then(resp => ({ key: cfg.key, data: resp && resp.body ? resp.body : [] }))
              .catch(() => ({ key: cfg.key, data: [] }))
        );

        $.when(...requests).done((...results) => {
            const data = {};
            results.forEach(r => { data[r.key] = r.data; });

            const customers = data.customers || [];
            const rooms = data.rooms || [];
            const reservations = data.reservations || [];
            const payments = data.payments || [];

            const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const activeStatuses = ['CONFIRMED', 'PENDING', 'CHECKED_IN'];
            const activeRes = reservations.filter(r => activeStatuses.includes(String(r.status || '').toUpperCase()));

            const totalRooms = rooms.length || 1;
            const occupied = rooms.filter(r => String(r.status || '').toUpperCase() === 'OCCUPIED').length;
            const occupancy = Math.round((occupied / totalRooms) * 100);

            $('#report_total_revenue').text(totalRevenue.toLocaleString());
            $('#report_total_customers').text(customers.length);
            $('#report_total_reservations').text(reservations.length);
            $('#report_active_res_label').text(activeRes.length + ' active');
            $('#report_occupancy').text(occupancy + '%');
            $('#report_rooms_label').text(occupied + ' of ' + rooms.length + ' rooms occupied');

            this.renderStatusBreakdown(reservations);
            this.renderRoomBreakdown(rooms);
            this.renderPaymentBreakdown(payments);
            this.renderRecentReservations(reservations);
        });
    }

    static renderStatusBreakdown(reservations) {
        const counts = {};
        reservations.forEach(r => {
            const st = String(r.status || 'CONFIRMED').toUpperCase();
            counts[st] = (counts[st] || 0) + 1;
        });

        const order = ['CONFIRMED', 'PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
        const $tbody = $('#report_res_status_tbody');
        $tbody.empty();

        if (!reservations.length) {
            $tbody.html('<tr><td colspan="2" class="text-center text-muted py-3">No data</td></tr>');
            return;
        }

        order.forEach(st => {
            if (!counts[st]) return;
            $tbody.append(`
                <tr>
                    <td>${st.replace('_', ' ')}</td>
                    <td class="text-end fw-bold">${counts[st]}</td>
                </tr>
            `);
        });
        $tbody.append(`
            <tr class="table-light">
                <td class="fw-bold">Total</td>
                <td class="text-end fw-bold">${reservations.length}</td>
            </tr>
        `);
    }

    static renderRoomBreakdown(rooms) {
        const counts = {};
        rooms.forEach(r => {
            const st = String(r.status || 'AVAILABLE').toUpperCase();
            counts[st] = (counts[st] || 0) + 1;
        });

        const order = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'BOOKED'];
        const $tbody = $('#report_room_status_tbody');
        $tbody.empty();

        if (!rooms.length) {
            $tbody.html('<tr><td colspan="2" class="text-center text-muted py-3">No data</td></tr>');
            return;
        }

        order.forEach(st => {
            if (!counts[st]) return;
            $tbody.append(`
                <tr>
                    <td>${st}</td>
                    <td class="text-end fw-bold">${counts[st]}</td>
                </tr>
            `);
        });
        $tbody.append(`
            <tr class="table-light">
                <td class="fw-bold">Total</td>
                <td class="text-end fw-bold">${rooms.length}</td>
            </tr>
        `);
    }

    static renderPaymentBreakdown(payments) {
        const groups = {};
        payments.forEach(p => {
            const method = (p.paymentMethod || 'CASH').replace('_', ' ');
            groups[method] = (groups[method] || 0) + (Number(p.amount) || 0);
        });

        const $tbody = $('#report_pay_method_tbody');
        $tbody.empty();

        if (!payments.length) {
            $tbody.html('<tr><td colspan="2" class="text-center text-muted py-3">No data</td></tr>');
            return;
        }

        let grandTotal = 0;
        Object.keys(groups).forEach(method => {
            const amt = groups[method];
            grandTotal += amt;
            $tbody.append(`
                <tr>
                    <td>${method}</td>
                    <td class="text-end fw-bold">LKR ${amt.toLocaleString()}</td>
                </tr>
            `);
        });
        $tbody.append(`
            <tr class="table-light">
                <td class="fw-bold">Total Collected</td>
                <td class="text-end fw-bold">LKR ${grandTotal.toLocaleString()}</td>
            </tr>
        `);
    }

    static renderRecentReservations(reservations) {
        const $tbody = $('#report_recent_tbody');
        $tbody.empty();

        const recent = [...reservations]
            .sort((a, b) => (b.reservationId || 0) - (a.reservationId || 0))
            .slice(0, 8);

        if (!recent.length) {
            $tbody.html('<tr><td colspan="4" class="text-center text-muted py-3">No data</td></tr>');
            return;
        }

        recent.forEach(r => {
            const st = String(r.status || 'CONFIRMED').toUpperCase();
            let badge = '<span class="badge bg-primary-subtle text-primary border border-primary">Confirmed</span>';
            if (st === 'CHECKED_IN') badge = '<span class="badge bg-success-subtle text-success border border-success">Checked In</span>';
            if (st === 'CHECKED_OUT') badge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary">Checked Out</span>';
            if (st === 'CANCELLED') badge = '<span class="badge bg-danger-subtle text-danger border border-danger">Cancelled</span>';
            if (st === 'PENDING') badge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary">Pending</span>';

            $tbody.append(`
                <tr>
                    <td class="table-id-col">#${r.reservationNumber || r.reservationId}</td>
                    <td>${r.customerName || ('Customer #' + r.customerId)}</td>
                    <td><span class="badge bg-light text-dark border">Room #${r.roomNumber || r.roomId}</span></td>
                    <td>${badge}</td>
                </tr>
            `);
        });
    }
}