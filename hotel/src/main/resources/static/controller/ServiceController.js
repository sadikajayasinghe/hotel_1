/**
 * ServiceController.js
 * Manages Service CRUD operations via REST API with JWT Bearer authentication.
 */

export class ServiceController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingServiceId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/services'
            : 'http://localhost:8080/v1/services';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:service_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // "+ Add Service" button
        $('#btn_add_service').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_service').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button
        $('#btn_search_service').on('click', () => {
            const query = $('#service_search_input').val().trim();
            this.filterServiceTable(query);
        });

        // Search input keyup (live filter)
        $('#service_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterServiceTable(query);
        });

        // Refresh/Reload button
        $('#btn_reload_services').on('click', () => {
            $('#service_search_input').val('');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#service_tbody').on('click', '.btn-action-edit-service', (e) => {
            const serviceId = $(e.currentTarget).data('id');
            this.openEditModal(serviceId);
        });

        $('#service_tbody').on('click', '.btn-action-delete-service', (e) => {
            const serviceId = $(e.currentTarget).data('id');
            this.handleDelete(serviceId);
        });
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const services = response && response.body ? response.body : [];
                this.renderTable(services);
            },
            error: (xhr) => {
                console.error("Failed to load services:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#service_tbody').html(`
                        <tr>
                            <td colspan="5" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#service_tbody').html(`
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">
                                Unable to load services from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterServiceTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { serviceName: query } : {},
            success: (response) => {
                const services = response && response.body ? response.body : [];
                this.renderTable(services);
            },
            error: (xhr) => {
                console.error("Failed to filter services:", xhr);
            }
        });
    }

    static renderTable(services) {
        const $tbody = $('#service_tbody');
        $tbody.empty();

        if (!services || services.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-bell-concierge fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No services found. Click <strong>+ Add Service</strong> to register one.
                    </td>
                </tr>
            `);
            $('#total_service_badge').text(0);
            return;
        }

        services.forEach(s => {
            const id = s.serviceId != null ? s.serviceId : s.id;
            const name = s.serviceName || 'N/A';
            const description = s.description || '-';
            const price = s.price != null ? `LKR ${Number(s.price).toLocaleString()}` : 'N/A';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td class="fw-semibold">${name}</td>
                    <td class="text-muted small">${description}</td>
                    <td class="fw-bold text-dark">${price}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-service" data-id="${id}" title="Edit Service">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-service" data-id="${id}" title="Delete Service">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_service_badge').text(services.length);
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingServiceId = null;
        $('#serviceModalLabel').text('Add Service');
        $('#service_form')[0].reset();
        $('#serviceModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const service = response && response.body ? response.body : null;
                if (!service) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Service details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingServiceId = id;

                $('#serviceModalLabel').text('Edit Service Details');
                $('#service_name_input').val(service.serviceName || '');
                $('#service_description_input').val(service.description || '');
                $('#service_price_input').val(service.price != null ? service.price : '');
                $('#serviceModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch service details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const serviceName = $('#service_name_input').val().trim();
        const description = $('#service_description_input').val().trim();
        const price = $('#service_price_input').val().trim();

        if (!serviceName || !price) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please provide a service name and price.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            serviceName: serviceName,
            description: description,
            price: parseFloat(price)
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
                        title: 'Service Added',
                        text: `${serviceName} has been added successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#serviceModal').modal('hide');
                    $('#service_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add service. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingServiceId;

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
                        title: 'Service Updated',
                        text: `Service #${this.editingServiceId} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#serviceModal').modal('hide');
                    $('#service_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update service. Please check backend server.';
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
            title: 'Delete Service?',
            text: `Are you sure you want to delete Service #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Service has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete service.';
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