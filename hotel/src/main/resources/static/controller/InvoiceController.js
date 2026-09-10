/**
 * InvoiceController.js
 * Manages invoices (guest bills) via REST API with JWT Bearer authentication.
 * The backend auto-fills subtotal / discount / total when values are 0.
 */

export class InvoiceController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingInvoiceId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/invoices'
            : 'http://localhost:8080/v1/invoices';
    }

    static getReservationsUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/reservations'
            : 'http://localhost:8080/v1/reservations';
    }

    static getDiscountsUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/discounts'
            : 'http://localhost:8080/v1/discounts';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();

        $(document).on('section:shown:invoice_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        $('#btn_add_invoice').on('click', () => {
            this.openAddModal();
        });

        $('#btn_save_invoice').on('click', () => {
            this.handleSaveOrUpdate();
        });

        $('#btn_search_invoice').on('click', () => {
            const query = $('#invoice_search_input').val().trim();
            this.filterInvoiceTable(query);
        });

        $('#invoice_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterInvoiceTable(query);
        });

        $('#btn_reload_invoices').on('click', () => {
            $('#invoice_search_input').val('');
            this.reloadTable();
        });

        $('#invoice_tbody').on('click', '.btn-action-edit-invoice', (e) => {
            const invoiceId = $(e.currentTarget).data('id');
            this.openEditModal(invoiceId);
        });

        // Quick paid toggle from the table row
        $('#invoice_tbody').on('click', '.btn-toggle-paid', (e) => {
            const invoiceId = $(e.currentTarget).data('id');
            this.togglePaid(invoiceId);
        });

        $('#invoice_tbody').on('click', '.btn-action-delete-invoice', (e) => {
            const invoiceId = $(e.currentTarget).data('id');
            this.handleDelete(invoiceId);
        });

        // Auto-calculate the grand total
        $('#invoice_reservation_select, #invoice_discount_select, #invoice_subtotal_input, #invoice_discount_input').on('change input', () => {
            this.calculateTotal();
        });
    }

    static formatDate(raw) {
        if (!raw) return 'N/A';
        return String(raw).replace('T', ' ').slice(0, 16);
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const invoices = response && response.body ? response.body : [];
                this.renderTable(invoices);
            },
            error: (xhr) => {
                console.error("Failed to load invoices:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#invoice_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#invoice_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">
                                Unable to load invoices from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterInvoiceTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { reservationId: query } : {},
            success: (response) => {
                const invoices = response && response.body ? response.body : [];
                this.renderTable(invoices);
            },
            error: (xhr) => {
                console.error("Failed to filter invoices:", xhr);
            }
        });
    }

    static renderTable(invoices) {
        const $tbody = $('#invoice_tbody');
        $tbody.empty();

        if (!invoices || invoices.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-file-invoice-dollar fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No invoices yet. Click <strong>+ Add Invoice</strong> to generate a guest bill.
                    </td>
                </tr>
            `);
            $('#total_invoice_badge').text(0);
            return;
        }

        invoices.forEach(inv => {
            const id = inv.invoiceId != null ? inv.invoiceId : inv.id;
            const reservation = inv.reservationNumber || ('Reservation #' + (inv.reservationId || '-'));
            const subTotal = Number(inv.subTotal || 0).toLocaleString();
            const discount = Number(inv.discountAmount || 0).toLocaleString();
            const total = Number(inv.totalAmount || 0).toLocaleString();
            const date = this.formatDate(inv.issueDate);

            const isPaid = inv.isPaid === true || inv.paid === true;
            const paidBadge = isPaid
                ? '<span class="badge bg-success-subtle text-success border border-success">Paid</span>'
                : '<span class="badge bg-warning-subtle text-warning border border-warning">Unpaid</span>';
            const toggleTitle = isPaid ? 'Mark as Unpaid' : 'Mark as Paid';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td class="fw-semibold">${reservation}</td>
                    <td class="text-dark">LKR ${subTotal}</td>
                    <td class="text-danger small">- LKR ${discount}</td>
                    <td class="fw-bold text-success">LKR ${total}</td>
                    <td class="small text-muted">${date}</td>
                    <td>${paidBadge}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-invoice" data-id="${id}" title="Edit Invoice">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-invoice" data-id="${id}" title="Delete Invoice">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            <button class="btn-action-edit btn-toggle-paid" data-id="${id}" title="${toggleTitle}">
                                <i class="fa-solid fa-money-bill-wave"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_invoice_badge').text(invoices.length);
    }

    static loadDropdownOptions(selectedReservationId, selectedDiscountId) {
        $.when(
            $.ajax({ url: this.getReservationsUrl(), type: 'GET', headers: this.getAuthHeaders() }),
            $.ajax({ url: this.getDiscountsUrl(), type: 'GET', headers: this.getAuthHeaders() })
        ).done((resResp, discResp) => {
            const reservations = resResp[0] && resResp[0].body ? resResp[0].body : [];
            const discounts = discResp[0] && discResp[0].body ? discResp[0].body : [];

            const $resSelect = $('#invoice_reservation_select');
            $resSelect.empty().append('<option value="">-- Select Reservation --</option>');
            reservations.forEach(r => {
                const rId = r.reservationId != null ? r.reservationId : r.id;
                const label = (r.reservationNumber || ('#' + rId))
                    + (r.customerName ? ' - ' + r.customerName : '')
                    + (r.roomNumber ? ' (Room ' + r.roomNumber + ')' : '');
                $resSelect.append(`<option value="${rId}" data-total="${r.totalAmount || 0}">${label}</option>`);
            });
            $resSelect.val(selectedReservationId ? String(selectedReservationId) : '');

            const $discSelect = $('#invoice_discount_select');
            $discSelect.empty().append('<option value="">-- No Discount --</option>');
            discounts.forEach(d => {
                const dId = d.discountId != null ? d.discountId : d.id;
                const pct = d.discountPercentage != null ? d.discountPercentage : 0;
                $discSelect.append(`<option value="${dId}" data-pct="${pct}">${d.code || ('#' + dId)} - ${pct}%</option>`);
            });
            $discSelect.val(selectedDiscountId ? String(selectedDiscountId) : '');

            this.calculateTotal();
        }).fail(() => {
            $('#invoice_reservation_select').empty().append('<option value="">Reservations unavailable</option>');
            $('#invoice_discount_select').empty().append('<option value="">Discounts unavailable</option>');
        });
    }

    static calculateTotal() {
        const $res = $('#invoice_reservation_select option:selected');
        const $disc = $('#invoice_discount_select option:selected');

        let subTotal = parseFloat($('#invoice_subtotal_input').val());
        if (isNaN(subTotal)) subTotal = 0;

        // Auto-fill subtotal from the selected reservation (backend does the same)
        if ((!$('#invoice_subtotal_input').val() || subTotal <= 0) && $res.data('total')) {
            subTotal = parseFloat($res.data('total')) || 0;
            $('#invoice_subtotal_input').val(subTotal);
        }

        const pct = parseFloat($disc.data('pct')) || 0;
        let autoDisc = (subTotal * pct) / 100;

        let discountAmount = parseFloat($('#invoice_discount_input').val());
        if (isNaN(discountAmount)) discountAmount = 0;
        if ((!$('#invoice_discount_input').val() || discountAmount <= 0) && autoDisc > 0) {
            discountAmount = autoDisc;
            $('#invoice_discount_input').val(discountAmount);
        }

        const total = Math.max(0, subTotal - discountAmount);
        $('#invoice_total_input').val(total.toFixed(2));
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingInvoiceId = null;
        $('#invoiceModalLabel').text('Add New Invoice');
        $('#invoice_form')[0].reset();
        $('#invoice_subtotal_input').val('');
        $('#invoice_discount_input').val('');
        $('#invoice_total_input').val(0);
        $('#invoice_paid_select').val('false');
        this.loadDropdownOptions(null, null);
        $('#invoiceModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const invoice = response && response.body ? response.body : null;
                if (!invoice) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Invoice details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingInvoiceId = id;

                $('#invoiceModalLabel').text('Edit Invoice #' + id);
                $('#invoice_subtotal_input').val(invoice.subTotal || '');
                $('#invoice_discount_input').val(invoice.discountAmount || '');
                $('#invoice_total_input').val(invoice.totalAmount || 0);
                $('#invoice_paid_select').val(invoice.isPaid === true || invoice.paid === true ? 'true' : 'false');
                this.loadDropdownOptions(invoice.reservationId, invoice.discountId);
                $('#invoiceModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch invoice details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const reservationId = $('#invoice_reservation_select').val();
        const discountId = $('#invoice_discount_select').val();
        const subTotal = parseFloat($('#invoice_subtotal_input').val()) || 0;
        let discountAmount = parseFloat($('#invoice_discount_input').val());
        if (isNaN(discountAmount)) discountAmount = 0;
        const total = parseFloat($('#invoice_total_input').val()) || Math.max(0, subTotal - discountAmount);
        const paid = $('#invoice_paid_select').val() === 'true';

        if (!reservationId) {
            Swal.fire({
                icon: 'warning',
                title: 'Reservation Required',
                text: 'Please select a reservation for this invoice.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        if (subTotal <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Sub Total',
                text: 'Choose a reservation or enter a subtotal so the bill can be calculated.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            reservationId: parseInt(reservationId),
            discountId: discountId ? parseInt(discountId) : null,
            discountCode: '',
            subTotal: subTotal,
            discountAmount: discountAmount,
            totalAmount: total,
            paid: paid
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
                        title: 'Invoice Created',
                        text: `Invoice for LKR ${total.toLocaleString()} generated successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#invoiceModal').modal('hide');
                    $('#invoice_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to create invoice. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingInvoiceId;

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
                        title: 'Invoice Updated',
                        text: `Invoice #${this.editingInvoiceId} has been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#invoiceModal').modal('hide');
                    $('#invoice_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update invoice. Please check backend server.';
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

    static togglePaid(invoiceId) {
        const detailUrl = this.getBaseUrl() + '/' + invoiceId;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const invoice = response && response.body ? response.body : null;
                if (!invoice) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Invoice could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                const newPaid = !(invoice.isPaid === true || invoice.paid === true);

                $.ajax({
                    url: detailUrl,
                    type: 'PUT',
                    contentType: 'application/json',
                    headers: this.getAuthHeaders(),
                    data: JSON.stringify({
                        reservationId: invoice.reservationId,
                        discountId: invoice.discountId,
                        subTotal: invoice.subTotal,
                        discountAmount: invoice.discountAmount,
                        totalAmount: invoice.totalAmount,
                        paid: newPaid
                    }),
                    success: () => {
                        Swal.fire({
                            icon: 'success',
                            title: newPaid ? 'Marked as Paid' : 'Marked as Unpaid',
                            text: `Invoice #${invoiceId} status updated.`,
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Could not update payment status.',
                            confirmButtonColor: '#e65100'
                        });
                    }
                });
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch invoice details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleDelete(id) {
        Swal.fire({
            title: 'Delete Invoice?',
            text: `Are you sure you want to delete Invoice #${id}? This action cannot be undone.`,
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
                    success: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Invoice has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete invoice.';
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