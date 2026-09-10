/**
 * RoomTypeController.js
 * Manages Room Type CRUD operations via REST API with JWT Bearer authentication.
 * Rendered inside the shared generic module table (generic_content section).
 */

export class RoomTypeController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingRoomTypeId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/room-types'
            : 'http://localhost:8080/v1/room-types';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();
    }

    static bindEvents() {
        // Quick Action button opens the Add modal only for Room Types module
        $('#generic_action_btn').on('click', () => {
            if (window.__currentGenericModule === 'Room Types') {
                this.openAddModal();
            }
        });

        // Save / Update button in modal
        $('#btn_save_room_type').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Delegated table row actions: Edit & Delete
        $('#generic_table_body').on('click', '.btn-action-edit-room-type', (e) => {
            const roomTypeId = $(e.currentTarget).data('id');
            this.openEditModal(roomTypeId);
        });

        $('#generic_table_body').on('click', '.btn-action-delete-room-type', (e) => {
            const roomTypeId = $(e.currentTarget).data('id');
            this.handleDelete(roomTypeId);
        });
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const types = response && response.body ? response.body : [];
                this.renderTable(types);
            },
            error: (xhr) => {
                console.error("Failed to load room types:", xhr);
                $('#generic_table_body').html(`
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            Unable to load room types from server.
                        </td>
                    </tr>
                `);
            }
        });
    }

    static renderTable(typeList) {
        const $tbody = $('#generic_table_body');
        const $thead = $('#generic_table_head');
        $tbody.empty();

        $thead.html(`
            <tr>
                <th>#</th>
                <th>Type Name</th>
                <th>Description</th>
                <th>Base Price</th>
                <th>Capacity</th>
                <th>Actions</th>
            </tr>
        `);

        if (!typeList || typeList.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="6" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-tags fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No room types found. Click <strong>Quick Action</strong> to add one.
                    </td>
                </tr>
            `);
            return;
        }

        typeList.forEach(t => {
            const id = t.roomTypeId != null ? t.roomTypeId : t.id;
            const name = t.typeName || t.name || 'N/A';
            const description = t.description || '-';
            const basePrice = t.basePrice != null ? `LKR ${Number(t.basePrice).toLocaleString()}` : 'N/A';
            const capacity = t.capacity != null ? t.capacity : '-';

            const row = `
                <tr>
                    <td class="fw-bold table-id-col">#${id}</td>
                    <td class="fw-semibold">${name}</td>
                    <td>${description}</td>
                    <td class="fw-bold">${basePrice}</td>
                    <td>${capacity}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-room-type" data-id="${id}" title="Edit Room Type">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-room-type" data-id="${id}" title="Delete Room Type">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingRoomTypeId = null;
        $('#roomTypeModalLabel').text('Add New Room Type');
        $('#room_type_form')[0].reset();
        $('#rt_capacity_input').val(2);
        $('#roomTypeModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const roomType = response && response.body ? response.body : null;
                if (!roomType) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Room type details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingRoomTypeId = id;

                $('#roomTypeModalLabel').text('Edit Room Type Details');
                $('#rt_name_input').val(roomType.typeName || '');
                $('#rt_description_input').val(roomType.description || '');
                $('#rt_base_price_input').val(roomType.basePrice != null ? roomType.basePrice : '');
                $('#rt_capacity_input').val(roomType.capacity != null ? roomType.capacity : 2);

                $('#roomTypeModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch room type details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const name = $('#rt_name_input').val().trim();
        const price = $('#rt_base_price_input').val().trim();

        if (!name || !price) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please enter type name and base price.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            typeName: name,
            description: $('#rt_description_input').val().trim(),
            basePrice: parseFloat(price),
            capacity: parseInt($('#rt_capacity_input').val()) || 2
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
                        title: 'Room Type Added',
                        text: `${name} has been added successfully.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#roomTypeModal').modal('hide');
                    $('#room_type_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add room type. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingRoomTypeId;

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
                        title: 'Room Type Updated',
                        text: `${name} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#roomTypeModal').modal('hide');
                    $('#room_type_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update room type. Please check backend server.';
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
            title: 'Delete Room Type?',
            text: `Are you sure you want to delete Room Type #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Room type has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete room type.';
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