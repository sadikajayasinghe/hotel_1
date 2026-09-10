/**
 * DiscountController.js
 * Manages Discount CRUD operations via REST API with JWT Bearer authentication.
 */

export class DiscountController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingDiscountId = null;

    static getBaseUrl() {
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

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:discount_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // "+ Add Discount" button
        $('#btn_add_discount').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_discount').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button
        $('#btn_search_discount').on('click', () => {
            const query = $('#discount_search_input').val().trim();
            this.filterDiscountTable(query);
        });

        // Search input keyup (live filter)
        $('#discount_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterDiscountTable(query);
        });

        // Refresh/Reload button
        $('#btn_reload_discounts').on('click', () => {
            $('#discount_search_input').val('');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#discount_tbody').on('click', '.btn-action-edit-discount', (e) => {
            const discountId = $(e.currentTarget).data('id');
            this.openEditModal(discountId);
        });

        $('#discount_tbody').on('click', '.btn-action-delete-discount', (e) => {
            const discountId = $(e.currentTarget).data('id');
            this.handleDelete(discountId);
        });
    }

    static isActiveOf(d) {
        return d.active !== undefined ? d.active : d.isActive;
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const discounts = response && response.body ? response.body : [];
                this.renderTable(discounts);
            },
            error: (xhr) => {
                console.error("Failed to load discounts:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#discount_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#discount_tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">
                                Unable to load discounts from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterDiscountTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { code: query } : {},
            success: (response) => {
                const discounts = response && response.body ? response.body : [];
                this.renderTable(discounts);
            },
            error: (xhr) => {
                console.error("Failed to filter discounts:", xhr);
            }
        });
    }

    static renderTable(discounts) {
        const $tbody = $('#discount_tbody');
        $tbody.empty();

        if (!discounts || discounts.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-percent fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No discounts found. Click <strong>+ Add Discount</strong> to create one.
                    </td>
                </tr>
            `);
            $('#total_discount_badge').text(0);
            return;
        }

        discounts.forEach(d => {
            const id = d.discountId != null ? d.discountId : d.id;
            const code = d.code || 'N/A';
            const description = d.description || '-';
            const percentage = d.discountPercentage != null ? `${Number(d.discountPercentage)}%` : 'N/A';
            const startDate = d.startDate || '-';
            const endDate = d.endDate || '-';
            const isActive = this.isActiveOf(d);
            const statusBadge = isActive
                ? '<span class="badge bg-success-subtle text-success border border-success">ACTIVE</span>'
                : '<span class="badge bg-secondary-subtle text-secondary border border-secondary">INACTIVE</span>';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td class="fw-semibold">${code}</td>
                    <td class="text-muted small">${description}</td>
                    <td><span class="badge bg-danger-subtle text-danger">${percentage} OFF</span></td>
                    <td class="small">${startDate}</td>
                    <td class="small">${endDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-discount" data-id="${id}" title="Edit Discount">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-discount" data-id="${id}" title="Delete Discount">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_discount_badge').text(discounts.length);
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingDiscountId = null;
        $('#discountModalLabel').text('Add Discount');
        $('#discount_form')[0].reset();
        $('#discount_active_input').prop('checked', true);
        $('#discountModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const discount = response && response.body ? response.body : null;
                if (!discount) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Discount details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingDiscountId = id;

                $('#discountModalLabel').text('Edit Discount Details');
                $('#discount_code_input').val(discount.code || '');
                $('#discount_description_input').val(discount.description || '');
                $('#discount_percentage_input').val(discount.discountPercentage != null ? discount.discountPercentage : '');
                $('#discount_start_input').val(discount.startDate || '');
                $('#discount_end_input').val(discount.endDate || '');
                $('#discount_active_input').prop('checked', this.isActiveOf(discount));
                $('#discountModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch discount details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const code = $('#discount_code_input').val().trim();
        const description = $('#discount_description_input').val().trim();
        const percentage = $('#discount_percentage_input').val().trim();
        const startDate = $('#discount_start_input').val().trim();
        const endDate = $('#discount_end_input').val().trim();
        const isActive = $('#discount_active_input').prop('checked');

        if (!code || !percentage || !startDate || !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please provide code, percentage, start date, and end date.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        if (startDate > endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Date Range',
                text: 'Start date cannot be after the end date.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            code: code,
            description: description,
            discountPercentage: parseFloat(percentage),
            startDate: startDate,
            endDate: endDate,
            active: isActive
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
                        title: 'Discount Added',
                        text: `Discount code "${code}" has been added successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#discountModal').modal('hide');
                    $('#discount_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add discount. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingDiscountId;

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
                        title: 'Discount Updated',
                        text: `Discount #${this.editingDiscountId} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#discountModal').modal('hide');
                    $('#discount_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update discount. Please check backend server.';
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
            title: 'Delete Discount?',
            text: `Are you sure you want to delete Discount #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Discount has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete discount.';
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