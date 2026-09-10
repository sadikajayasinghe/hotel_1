/**
 * CustomerController.js
 * Manages Customer CRUD operations via REST API with JWT Bearer authentication,
 * live regex validation, and responsive table rendering.
 */

import { DB } from '../db/db.js';
import { REGEX_PATTERNS, validateInput, resetValidation } from '../utils/regex_utils.js';

export class CustomerController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingCustomerId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/customers'
            : 'http://localhost:8080/v1/customers';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        // Do not send the dummy demo token to the backend – it is rejected
        // and causes the customer table to show “Unauthorized”.
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.reloadTable();
        this.bindEvents();
        this.bindValidation();

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:customer_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // "+ Add Customer" button
        $('#btn_add_customer').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_customer').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button click
        $('#btn_search_customer').on('click', () => {
            const query = $('#customer_search_input').val().trim();
            this.filterCustomerTable(query);
        });

        // Search input keyup (live filter)
        $('#customer_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterCustomerTable(query);
        });

        // Refresh/Reload button
        $('#btn_reload_customers').on('click', () => {
            $('#customer_search_input').val('');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#customer_tbody').on('click', '.btn-action-edit', (e) => {
            const customerId = $(e.currentTarget).data('id');
            this.openEditModal(customerId);
        });

        $('#customer_tbody').on('click', '.btn-action-delete', (e) => {
            const customerId = $(e.currentTarget).data('id');
            this.handleDelete(customerId);
        });
    }

    static bindValidation() {
        $('#cust_name').on('input blur', () => {
            validateInput('#cust_name', REGEX_PATTERNS.NAME, '#err_cust_name', 'Enter a valid name (3-50 letters)');
        });

        $('#cust_email').on('input blur', () => {
            validateInput('#cust_email', REGEX_PATTERNS.EMAIL, '#err_cust_email', 'Enter a valid email address');
        });

        $('#cust_phone').on('input blur', () => {
            validateInput('#cust_phone', REGEX_PATTERNS.PHONE, '#err_cust_phone', 'Enter a valid Sri Lankan mobile number (e.g. 0771234567)');
        });

        $('#cust_nic').on('input blur', () => {
            validateInput('#cust_nic', REGEX_PATTERNS.NIC, '#err_cust_nic', 'Enter a valid NIC (9 digits + V/X or 12 digits)');
        });

        $('#cust_address').on('input blur', () => {
            validateInput('#cust_address', REGEX_PATTERNS.ADDRESS, '#err_cust_address', 'Address must be at least 5 characters');
        });
    }

    static isFormValid() {
        const vName = validateInput('#cust_name', REGEX_PATTERNS.NAME, '#err_cust_name', 'Enter a valid name (3-50 letters)');
        const vEmail = validateInput('#cust_email', REGEX_PATTERNS.EMAIL, '#err_cust_email', 'Enter a valid email address');
        const vPhone = validateInput('#cust_phone', REGEX_PATTERNS.PHONE, '#err_cust_phone', 'Enter a valid mobile (e.g. 0771234567)');
        const vNic = validateInput('#cust_nic', REGEX_PATTERNS.NIC, '#err_cust_nic', 'Enter a valid NIC (9 digits + V or 12 digits)');
        const vAddr = validateInput('#cust_address', REGEX_PATTERNS.ADDRESS, '#err_cust_address', 'Address must be at least 5 characters');

        return vName && vEmail && vPhone && vNic && vAddr;
    }

    // Alias for reloadTable to support backwards compatibility
    static loadCustomerTable() {
        this.reloadTable();
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const customers = response && response.body ? response.body : [];
                this.renderTable(customers);
                DB.syncCustomers(customers);
            },
            error: (xhr) => {
                console.error("Failed to load customers:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#customer_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#customer_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">
                                Unable to load customers from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterCustomerTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { customerName: query } : {},
            success: (response) => {
                const customers = response && response.body ? response.body : [];
                this.renderTable(customers);
            },
            error: (xhr) => {
                console.error("Failed to filter customers:", xhr);
            }
        });
    }

    static renderTable(customers) {
        const $tbody = $('#customer_tbody');
        $tbody.empty();

        if (!customers || customers.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-users-slash fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No customers found. Click <strong>+ Add Customer</strong> to create one.
                    </td>
                </tr>
            `);
            $('#total_customer_badge').text(0);
            return;
        }

        customers.forEach(c => {
            const id = c.customerId != null ? c.customerId : c.id;
            const name = c.customerName || ((c.firstName || '') + ' ' + (c.lastName || '')).trim() || 'N/A';
            const email = c.email || 'N/A';
            const phone = c.contact || c.phone || 'N/A';
            const nic = c.nicOrPassport || 'N/A';
            const address = c.address || 'N/A';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td class="table-name-col fw-semibold">${name}</td>
                    <td>${email}</td>
                    <td>${phone}</td>
                    <td>${nic}</td>
                    <td>${address}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit" data-id="${id}" title="Edit Customer">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete" data-id="${id}" title="Delete Customer">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        // Update customer count badge
        $('#total_customer_badge').text(customers.length);
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingCustomerId = null;
        $('#customerModalLabel').text('Add New Customer');
        $('#customer_form')[0].reset();
        resetValidation('#customer_form');
        $('#customerModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const customer = response && response.body ? response.body : null;
                if (!customer) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Customer details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingCustomerId = id;

                $('#customerModalLabel').text('Edit Customer Details');
                const fullName = customer.customerName || ((customer.firstName || '') + ' ' + (customer.lastName || '')).trim();
                $('#cust_name').val(fullName);
                $('#cust_email').val(customer.email || '');
                $('#cust_phone').val(customer.contact || customer.phone || '');
                $('#cust_nic').val(customer.nicOrPassport || '');
                $('#cust_address').val(customer.address || '');

                resetValidation('#customer_form');
                $('#customerModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch customer details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        if (!this.isFormValid()) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please correct the highlighted errors in the form.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const name = $('#cust_name').val().trim();
        const email = $('#cust_email').val().trim();
        const phone = $('#cust_phone').val().trim();
        const nic = $('#cust_nic').val().trim();
        const address = $('#cust_address').val().trim();

        const payload = JSON.stringify({
            customerName: name,
            contact: phone,
            phone: phone,
            email: email,
            nicOrPassport: nic,
            address: address
        });

        if (this.currentMode === 'ADD') {
            $.ajax({
                url: this.getBaseUrl(),
                type: 'POST',
                contentType: 'application/json',
                data: payload,
                headers: this.getAuthHeaders(),
                success: (response) => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Customer Added',
                        text: `${name} has been added successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#customerModal').modal('hide');
                    $('#customer_form')[0].reset();
                    resetValidation('#customer_form');
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add customer. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingCustomerId;

            $.ajax({
                url: updateUrl,
                type: 'PUT',
                contentType: 'application/json',
                data: payload,
                headers: this.getAuthHeaders(),
                success: (response) => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Customer Updated',
                        text: `${name}'s details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#customerModal').modal('hide');
                    $('#customer_form')[0].reset();
                    resetValidation('#customer_form');
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update customer. Please check backend server.';
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
            title: 'Delete Customer?',
            text: `Are you sure you want to delete Customer #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Customer has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete customer.';
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
