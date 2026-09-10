/**
 * ReservationController.js
 * Manages Hotel Lanka booking reservations, check-in, check-out, editing, and cancellation.
 */

export class ReservationController {
    static cachedReservations = [];
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingReservationId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/reservations'
            : 'http://localhost:8080/v1/reservations';
    }

    static getUrlFor(path) {
        return window.location.origin.includes('8080')
            ? '/v1' + path
            : 'http://localhost:8080/v1' + path;
    }

    static getAuthHeaders() {
        const token = localStorage.getItem('JWT');
        // Do not send the dummy demo token to the backend – it is rejected
        // and causes the reservation table to show "Unauthorized".
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.loadReservationsTable();
        this.bindEvents();

        $(document).on('section:shown:reservation_content', () => {
            this.loadReservationsTable();
        });
    }

    static bindEvents() {
        // "+ New Booking" button
        $('#btn_new_booking').on('click', () => {
            this.openBookingModal(null);
        });

        // Save / Update booking
        $('#btn_save_booking').on('click', () => {
            this.handleSaveBooking();
        });

        // Auto-calculate total price when room or dates change
        $('#booking_room_select, #booking_checkin_date, #booking_checkout_date').on('change', () => {
            this.calculateTotal();
        });

        // Check-in / Check-out button actions
        $('#reservation_tbody').on('click', '.btn-toggle-checkin', (e) => {
            const resId = $(e.currentTarget).data('id');
            this.toggleCheckIn(resId);
        });

        // Edit / change reservation
        $('#reservation_tbody').on('click', '.btn-edit-res', (e) => {
            const resId = $(e.currentTarget).data('id');
            const res = this.cachedReservations.find(r => String(r.reservationId) === String(resId));
            this.openBookingModal(res || null);
        });

        // Quick delete / cancel reservation
        $('#reservation_tbody').on('click', '.btn-delete-res', (e) => {
            const resId = $(e.currentTarget).data('id');
            this.deleteReservation(resId);
        });
    }

    static loadReservationsTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const reservations = response && response.body ? response.body : [];
                this.cachedReservations = reservations;
                this.renderTable(reservations);
            },
            error: (xhr) => {
                console.error('Failed to load reservations:', xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#reservation_tbody').html(`
                        <tr>
                            <td colspan="9" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#reservation_tbody').html(`
                        <tr>
                            <td colspan="9" class="text-center text-muted py-4">
                                Unable to load reservations from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static renderTable(reservations) {
        const $tbody = $('#reservation_tbody');
        $tbody.empty();

        if (!reservations || reservations.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="fa-solid fa-calendar-days fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No reservations booked yet. Click <strong>+ New Booking</strong> to register one.
                    </td>
                </tr>
            `);
            return;
        }

        reservations.forEach(r => {
            const id = r.reservationId;
            const resNum = r.reservationNumber || ('RES-' + id);
            const status = (r.status || 'CONFIRMED').toUpperCase();

            let statusBadge = '<span class="badge bg-primary-subtle text-primary border border-primary">Confirmed</span>';
            let actionBtn = `<button class="btn btn-sm btn-outline-success btn-toggle-checkin me-1" data-id="${id}" title="Check In Guest"><i class="fa-solid fa-key me-1"></i> Check In</button>`;

            if (status === 'CHECKED_IN') {
                statusBadge = '<span class="badge bg-success-subtle text-success border border-success">Checked In</span>';
                actionBtn = `<button class="btn btn-sm btn-outline-warning btn-toggle-checkin me-1" data-id="${id}" title="Check Out Guest"><i class="fa-solid fa-right-from-bracket me-1"></i> Check Out</button>`;
            } else if (status === 'CHECKED_OUT') {
                statusBadge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary">Checked Out</span>';
                actionBtn = `<span class="text-muted small me-2">Completed</span>`;
            } else if (status === 'CANCELLED') {
                statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger">Cancelled</span>';
                actionBtn = `<span class="text-muted small me-2">Cancelled</span>`;
            }

            const row = `
                <tr>
                    <td class="fw-bold text-secondary">#${resNum}</td>
                    <td>
                        <div class="fw-semibold text-dark">${r.customerName || 'Customer #' + r.customerId}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">Room #${r.roomNumber || r.roomId}</span></td>
                    <td><span class="badge bg-light text-dark border">${r.numberOfGuests || 1} guest${(r.numberOfGuests || 1) === 1 ? '' : 's'}</span></td>
                    <td>${r.checkInDate || '-'}</td>
                    <td>${r.checkOutDate || '-'}</td>
                    <td class="fw-bold text-success">LKR ${Number(r.totalAmount || 0).toLocaleString()}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="d-flex align-items-center flex-wrap gap-1">
                            ${actionBtn}
                            <button class="btn btn-sm btn-outline-primary btn-edit-res" data-id="${id}" title="Edit Reservation">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-res" data-id="${id}" title="Cancel Reservation">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    static openBookingModal(res) {
        const isEdit = !!(res && res.reservationId);
        this.currentMode = isEdit ? 'EDIT' : 'ADD';
        this.editingReservationId = isEdit ? res.reservationId : null;

        $('#bookingModalLabel').text(isEdit ? `Edit Reservation #${res.reservationNumber || res.reservationId}` : 'Create Reservation');
        $('#booking_guests_input').val(isEdit && res.numberOfGuests > 0 ? res.numberOfGuests : 1);
        $('#booking_status_select').val(isEdit && res.status ? res.status.toUpperCase() : 'CONFIRMED');
        $('#booking_total_amount').val(0);
        $('#booking_total_display').text('LKR 0.00');

        // Default dates: today and tomorrow (prefilled from reservation when editing)
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        $('#booking_checkin_date').val(isEdit && res.checkInDate ? res.checkInDate : today);
        $('#booking_checkout_date').val(isEdit && res.checkOutDate ? res.checkOutDate : tomorrow);

        const custUrl = this.getUrlFor('/customers');
        const roomUrl = this.getUrlFor('/rooms');

        // Load Customers from backend
        $.ajax({
            url: custUrl,
            type: 'GET',
            headers: this.getAuthHeaders(),
            success: (resp) => {
                const customers = resp && resp.body ? resp.body : [];
                const $custSelect = $('#booking_customer_select');
                $custSelect.empty().append('<option value="">-- Choose Customer --</option>');
                customers.forEach(c => {
                    const cName = c.customerName || ('Customer #' + c.customerId);
                    $custSelect.append(`<option value="${c.customerId}" data-name="${cName}">${cName} (${c.contact || ''})</option>`);
                });
                if (isEdit && res.customerId) {
                    $custSelect.val(String(res.customerId));
                }
            },
            error: () => {
                $('#booking_customer_select').empty().append('<option value="">No customers loaded</option>');
            }
        });

        // Load Rooms from backend
        $.ajax({
            url: roomUrl,
            type: 'GET',
            headers: this.getAuthHeaders(),
            success: (resp) => {
                const rooms = resp && resp.body ? resp.body : [];
                const $roomSelect = $('#booking_room_select');
                $roomSelect.empty().append('<option value="">-- Choose Room --</option>');

                rooms.forEach(r => {
                    const isCurrent = isEdit && String(r.roomId) === String(res.roomId);
                    const available = r.status === 'AVAILABLE';
                    const disabled = (!available && !isCurrent) ? 'disabled' : '';
                    const availText = available ? 'Available' : ('(' + r.status + ')');
                    const suffix = isCurrent ? ' - Current' : '';
                    $roomSelect.append(
                        `<option value="${r.roomId}" data-room="${r.roomNumber}" data-price="${r.price}" ${disabled}>` +
                        `Room #${r.roomNumber} - ${r.roomType || 'Room'} (LKR ${Number(r.price).toLocaleString()}) - ${availText}${suffix}</option>`
                    );
                });

                if (isEdit && res.roomId) {
                    $roomSelect.val(String(res.roomId));
                }
                this.calculateTotal();
            },
            error: () => {
                $('#booking_room_select').empty().append('<option value="">No rooms loaded</option>');
            }
        });

        $('#bookingModal').modal('show');
    }

    static calculateTotal() {
        const $selectedRoom = $('#booking_room_select option:selected');
        const price = parseFloat($selectedRoom.data('price')) || 0;
        const checkin = new Date($('#booking_checkin_date').val());
        const checkout = new Date($('#booking_checkout_date').val());

        if (checkin && checkout && checkout > checkin && price > 0) {
            const diffTime = Math.abs(checkout - checkin);
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            const total = nights * price;
            $('#booking_total_display').text(`LKR ${total.toLocaleString()} (${nights} night${nights > 1 ? 's' : ''})`);
            $('#booking_total_amount').val(total);
        } else {
            $('#booking_total_display').text('LKR 0.00');
            $('#booking_total_amount').val(0);
        }
    }

    static handleSaveBooking() {
        const isEdit = this.currentMode === 'EDIT';
        const custId = $('#booking_customer_select').val();
        const roomId = $('#booking_room_select').val();
        const checkin = $('#booking_checkin_date').val();
        const checkout = $('#booking_checkout_date').val();
        const guests = parseInt($('#booking_guests_input').val()) || 1;
        const status = $('#booking_status_select').val() || 'CONFIRMED';
        const total = parseFloat($('#booking_total_amount').val()) || 0;

        if (!custId || !roomId || !checkin || !checkout) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Booking',
                text: 'Please select customer, room, and valid dates.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        if (new Date(checkout) <= new Date(checkin)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Dates',
                text: 'Check-out date must be after the check-in date.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        if (!isEdit && total <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Total',
                text: 'Please choose a room so the total can be calculated.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = {
            customerId: parseInt(custId),
            roomId: parseInt(roomId),
            checkInDate: checkin,
            checkOutDate: checkout,
            numberOfGuests: guests,
            totalAmount: total,
            status: status
        };

        if (isEdit) {
            $.ajax({
                url: `${this.getBaseUrl()}/${this.editingReservationId}`,
                type: 'PUT',
                contentType: 'application/json',
                headers: this.getAuthHeaders(),
                data: JSON.stringify(payload),
                success: () => {
                    $('#bookingModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        title: 'Reservation Updated',
                        text: 'Booking details have been successfully updated.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    this.loadReservationsTable();
                },
                error: (xhr) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Server error updating reservation.',
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            $.ajax({
                url: this.getBaseUrl(),
                type: 'POST',
                contentType: 'application/json',
                headers: this.getAuthHeaders(),
                data: JSON.stringify(payload),
                success: () => {
                    $('#bookingModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        title: 'Reservation Confirmed',
                        text: 'Booking has been successfully registered.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    this.loadReservationsTable();
                },
                error: (xhr) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Reservation Failed',
                        text: xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Server error creating reservation.',
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        }
    }

    static toggleCheckIn(resId) {
        const res = this.cachedReservations.find(r => String(r.reservationId) === String(resId));
        if (!res) return;

        let nextStatus = 'CHECKED_IN';
        let alertTitle = 'Guest Checked In';
        let alertMsg = 'Guest status changed to Checked In.';

        if ((res.status || '').toUpperCase() === 'CHECKED_IN') {
            nextStatus = 'CHECKED_OUT';
            alertTitle = 'Guest Checked Out';
            alertMsg = 'Guest status changed to Checked Out.';
        }

        const updated = {
            ...res,
            status: nextStatus
        };

        $.ajax({
            url: `${this.getBaseUrl()}/${resId}`,
            type: 'PUT',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: JSON.stringify(updated),
            success: () => {
                Swal.fire({
                    icon: 'success',
                    title: alertTitle,
                    text: alertMsg,
                    timer: 1400,
                    showConfirmButton: false
                });
                this.loadReservationsTable();
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

    static deleteReservation(resId) {
        Swal.fire({
            title: 'Cancel Reservation?',
            text: 'Are you sure you want to cancel this reservation?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `${this.getBaseUrl()}/${resId}`,
                    type: 'DELETE',
                    headers: this.getAuthHeaders(),
                    success: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cancelled',
                            text: 'Reservation cancelled successfully.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.loadReservationsTable();
                    },
                    error: (xhr) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Could not delete reservation.',
                            confirmButtonColor: '#e65100'
                        });
                    }
                });
            }
        });
    }
}