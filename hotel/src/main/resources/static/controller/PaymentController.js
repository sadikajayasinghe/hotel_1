/**
 * PaymentController.js
 * Manages Payment CRUD operations via REST API with JWT Bearer authentication,
 * including a reservation dropdown loaded from the reservation list.
 */

export class PaymentController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingPaymentId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/payments'
            : 'http://localhost:8080/v1/payments';
    }

    static getReservationUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/reservations'
            : 'http://localhost:8080/v1/reservations';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.reloadTable();
        this.bindEvents();

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:payment_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // "+ Add Payment" button
        $('#btn_add_payment').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_payment').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button click
        $('#btn_search_payment').on('click', () => {
            const query = $('#payment_search_input').val().trim();
            this.filterPaymentTable(query);
        });

        // Search input keyup (live filter)
        $('#payment_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterPaymentTable(query);
        });

        // Refresh/Reload button
        $('#btn_reload_payments').on('click', () => {
            $('#payment_search_input').val('');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#payment_tbody').on('click', '.btn-action-edit-payment', (e) => {
            const paymentId = $(e.currentTarget).data('id');
            this.openEditModal(paymentId);
        });

        $('#payment_tbody').on('click', '.btn-action-delete-payment', (e) => {
            const paymentId = $(e.currentTarget).data('id');
            this.handleDelete(paymentId);
        });
    }

    static formatDate(raw) {
        if (!raw) return 'N/A';
        return String(raw).replace('T', ' ');
    }

    static generateTransactionId() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const rand = Math.floor(100 + Math.random() * 900);
        return `TXN-${date}-${time}-${rand}`;
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const payments = response && response.body ? response.body : [];
                this.renderTable(payments);
            },
            error: (xhr) => {
                console.error("Failed to load payments:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#payment_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#payment_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">
                                Unable to load payments from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterPaymentTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { reservationId: query } : {},
            success: (response) => {
                const payments = response && response.body ? response.body : [];
                this.renderTable(payments);
            },
            error: (xhr) => {
                console.error("Failed to filter payments:", xhr);
            }
        });
    }

    static renderTable(payments) {
        const $tbody = $('#payment_tbody');
        $tbody.empty();

        if (!payments || payments.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-credit-card fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No payments found. Click <strong>+ Add Payment</strong> to record one.
                    </td>
                </tr>
            `);
            $('#total_payment_badge').text(0);
            return;
        }

        payments.forEach(p => {
            const id = p.paymentId != null ? p.paymentId : p.id;
            const reservation = p.reservationNumber || ('Reservation #' + (p.reservationId || '-'));
            const amount = p.amount != null ? `LKR ${Number(p.amount).toLocaleString()}` : 'N/A';
            const date = this.formatDate(p.paymentDate);
            const method = (p.paymentMethod || 'CASH').replace('_', ' ');
            const status = (p.paymentStatus || 'COMPLETED').toUpperCase().replace('_', ' ');
            const txn = p.transactionId || 'N/A';

            let badgeClass = 'badge-available';
            if (status === 'PENDING') badgeClass = 'badge bg-warning text-dark';
            if (status === 'FAILED') badgeClass = 'badge bg-danger';
            if (status === 'REFUNDED') badgeClass = 'badge bg-secondary';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td class="fw-semibold">${reservation}</td>
                    <td class="fw-bold text-dark">${amount}</td>
                    <td>${date}</td>
                    <td>${method}</td>
                    <td>
                        <span class="${badgeClass}">${status}</span>
                    </td>
                    <td><small class="text-muted">${txn}</small></td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-payment" data-id="${id}" title="Edit Payment">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-payment" data-id="${id}" title="Delete Payment">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_payment_badge').text(payments.length);
    }

    static loadReservationOptions(selectedId) {
        $.ajax({
            url: this.getReservationUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const reservations = response && response.body ? response.body : [];
                let options = '<option value="">-- Select Reservation --</option>';
                if (reservations.length === 0) {
                    options = '<option value="">No reservations available</option>';
                } else {
                    reservations.forEach(r => {
                        const rid = r.reservationId != null ? r.reservationId : r.id;
                        const label = (r.reservationNumber || ('#' + rid))
                            + (r.customerName ? ' - ' + r.customerName : '')
                            + (r.roomNumber ? ' (Room ' + r.roomNumber + ')' : '');
                        options += `<option value="${rid}" ${String(rid) === String(selectedId) ? 'selected' : ''}>${label}</option>`;
                    });
                }
                $('#pay_reservation_select').html(options);
                if (selectedId) {
                    $('#pay_reservation_select').val(String(selectedId));
                }
            },
            error: () => {
                $('#pay_reservation_select').html('<option value="">No reservations loaded</option>');
            }
        });
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingPaymentId = null;
        $('#paymentModalLabel').text('Add New Payment');
        $('#payment_form')[0].reset();
        $('#pay_txn_input').val(this.generateTransactionId()).prop('readonly', true);
        this.loadReservationOptions(null);
        $('#paymentModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const payment = response && response.body ? response.body : null;
                if (!payment) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Payment details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingPaymentId = id;

                $('#paymentModalLabel').text('Edit Payment Details');
                $('#pay_amount_input').val(payment.amount != null ? payment.amount : '');
                $('#pay_method_input').val((payment.paymentMethod || 'CASH').toUpperCase());
                $('#pay_status_input').val((payment.paymentStatus || 'COMPLETED').toUpperCase());
                $('#pay_txn_input').val(payment.transactionId || this.generateTransactionId()).prop('readonly', true);

                this.loadReservationOptions(payment.reservationId);
                $('#paymentModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch payment details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const reservationId = $('#pay_reservation_select').val();
        const amount = $('#pay_amount_input').val().trim();

        if (!reservationId || !amount) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select a reservation and enter the payment amount.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            reservationId: parseInt(reservationId),
            amount: parseFloat(amount),
            paymentMethod: $('#pay_method_input').val(),
            paymentStatus: $('#pay_status_input').val(),
            transactionId: $('#pay_txn_input').val().trim()
        });

        if (this.currentMode === 'ADD') {
            $.ajax({
                url: this.getBaseUrl(),
                type: 'POST',
                contentType: 'application/json',
                data: payload,
                headers: this.getAuthHeaders(),
                success: (response) => {
                    if (response && response.status !== 200) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Save Failed',
                            text: (response && response.message) || 'Backend returned an error status.',
                            confirmButtonColor: '#e65100'
                        });
                        return;
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Added',
                        text: `Payment of LKR ${Number(amount).toLocaleString()} recorded successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#paymentModal').modal('hide');
                    $('#payment_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add payment. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingPaymentId;

            $.ajax({
                url: updateUrl,
                type: 'PUT',
                contentType: 'application/json',
                data: payload,
                headers: this.getAuthHeaders(),
                success: (response) => {
                    if (response && response.status !== 200) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: (response && response.message) || 'Backend returned an error status.',
                            confirmButtonColor: '#e65100'
                        });
                        return;
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Updated',
                        text: `Payment #${this.editingPaymentId} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#paymentModal').modal('hide');
                    $('#payment_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update payment. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        }
    }

    static handleDelete(id) {
        Swal.fire({
            title: 'Delete Payment?',
            text: `Are you sure you want to delete Payment #${id}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                const deleteUrl = this.getBaseUrl() + '/' + id;

                $.ajax({
                    url: deleteUrl,
                    type: 'DELETE',
                    contentType: 'application/json',
                    headers: this.getAuthHeaders(),
                    success: (response) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: response.message || 'Payment has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete payment.';
                        Swal.fire({
                            icon: 'error',
                            title: 'Delete Failed',
                            text: errMsg,
                            confirmButtonColor: '#e65100'
                        });
                    }
                });
            }
        });
    }
}