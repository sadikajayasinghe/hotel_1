/**
 * RoomController.js
 * Manages Hotel Lanka room inventory, REST CRUD operations with JWT Bearer authentication,
 * status transitions, live filtering, and modal editing.
 */

import { DB } from '../db/db.js';

export class RoomController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingRoomId = null;
    static cachedRooms = [];

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/rooms'
            : 'http://localhost:8080/v1/rooms';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        // Do not send the dummy demo token to the backend – it is rejected
        // and causes the room table to show “Unauthorized”.
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.reloadTable();
        this.bindEvents();

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:room_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // Filter tabs (All, Available, Occupied, Maintenance)
        $('.room-filter-btn').on('click', function () {
            $('.room-filter-btn').removeClass('btn-primary-orange text-white').addClass('btn-outline-secondary');
            $(this).removeClass('btn-outline-secondary').addClass('btn-primary-orange text-white');
            const status = $(this).data('status');
            RoomController.filterByStatus(status);
        });

        // "+ Add Room" button
        $('#btn_add_room').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_room').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button click
        $('#btn_search_room').on('click', () => {
            const query = $('#room_search_input').val().trim();
            this.filterRoomTable(query);
        });

        // Search input keyup (live search)
        $('#room_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterRoomTable(query);
        });

        // Refresh/Reload button
        $('#btn_reload_rooms').on('click', () => {
            $('#room_search_input').val('');
            $('.room-filter-btn').removeClass('btn-primary-orange text-white').addClass('btn-outline-secondary');
            $('.room-filter-btn[data-status="ALL"]').removeClass('btn-outline-secondary').addClass('btn-primary-orange text-white');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#room_tbody').on('click', '.btn-action-edit-room', (e) => {
            const roomId = $(e.currentTarget).data('id');
            this.openEditModal(roomId);
        });

        $('#room_tbody').on('click', '.btn-action-delete-room', (e) => {
            const roomId = $(e.currentTarget).data('id');
            this.handleDelete(roomId);
        });

        // Toggle room status directly from table dropdown
        $('#room_tbody').on('change', '.select-room-status', (e) => {
            const roomId = $(e.target).data('id');
            const newStatus = $(e.target).val();
            this.updateStatus(roomId, newStatus);
        });
    }

    // Alias for loadRoomsTable for backwards compatibility
    static loadRoomsTable(rooms = null) {
        if (rooms) {
            this.renderTable(rooms);
        } else {
            this.reloadTable();
        }
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const rooms = response && response.body ? response.body : [];
                this.cachedRooms = rooms;
                this.renderTable(rooms);
                DB.syncRooms(rooms);
            },
            error: (xhr) => {
                console.error("Failed to load rooms:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#room_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#room_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">
                                Unable to load rooms from backend server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterRoomTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { roomNumber: query } : {},
            success: (response) => {
                const rooms = response && response.body ? response.body : [];
                this.cachedRooms = rooms;
                this.renderTable(rooms);
            },
            error: (xhr) => {
                console.error("Failed to filter rooms:", xhr);
            }
        });
    }

    static filterByStatus(status) {
        if (status === 'ALL') {
            this.renderTable(this.cachedRooms);
        } else {
            const filtered = this.cachedRooms.filter(r => (r.status || '').toUpperCase() === status);
            this.renderTable(filtered);
        }
    }

    static renderTable(rooms) {
        const $tbody = $('#room_tbody');
        $tbody.empty();

        if (!rooms || rooms.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-bed fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No rooms found. Click <strong>+ Add Room</strong> to create one.
                    </td>
                </tr>
            `);
            $('#total_rooms_badge').text(0);
            return;
        }

        rooms.forEach(r => {
            const id = r.roomId != null ? r.roomId : r.id;
            const roomNumber = r.roomNumber || 'N/A';
            const roomType = r.roomType || 'Standard';
            const floor = r.floor != null ? r.floor : 1;
            const price = r.pricePerNight != null ? r.pricePerNight : (r.price || 0);
            const status = (r.status || 'AVAILABLE').toUpperCase();

            let badgeClass = 'badge-available';
            if (status === 'OCCUPIED') badgeClass = 'badge-occupied';
            if (status === 'MAINTENANCE') badgeClass = 'badge-maintenance';
            if (status === 'BOOKED') badgeClass = 'badge bg-warning text-dark';

            const row = `
                <tr>
                    <td class="fw-bold table-id-col">#${roomNumber}</td>
                    <td>${roomType}</td>
                    <td>Floor ${floor}</td>
                    <td class="fw-bold text-dark">LKR ${Number(price).toLocaleString()}</td>
                    <td>
                        <span class="${badgeClass}">${status}</span>
                    </td>
                    <td>
                        <select class="form-select form-select-sm select-room-status" data-id="${id}" style="width: 140px; display: inline-block;">
                            <option value="AVAILABLE" ${status === 'AVAILABLE' ? 'selected' : ''}>Available</option>
                            <option value="OCCUPIED" ${status === 'OCCUPIED' ? 'selected' : ''}>Occupied</option>
                            <option value="MAINTENANCE" ${status === 'MAINTENANCE' ? 'selected' : ''}>Maintenance</option>
                            <option value="BOOKED" ${status === 'BOOKED' ? 'selected' : ''}>Booked</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-room" data-id="${id}" title="Edit Room">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-room" data-id="${id}" title="Delete Room">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_rooms_badge').text(rooms.length);
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingRoomId = null;
        $('#roomModalLabel').text('Add New Room');
        $('#room_form')[0].reset();
        this.loadRoomTypeOptions(null);
        $('#roomModal').modal('show');
    }

    static loadRoomTypeOptions(selectedType) {
        const typeUrl = window.location.origin.includes('8080')
            ? '/v1/room-types'
            : 'http://localhost:8080/v1/room-types';

        $.ajax({
            url: typeUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const types = response && response.body ? response.body : [];
                let options = '';
                types.forEach(t => {
                    const name = t.typeName || t.name;
                    if (!name) return;
                    options += `<option value="${name}" ${name === selectedType ? 'selected' : ''}>${name}</option>`;
                });

                if (types.length === 0) {
                    options = `
                        <option value="Deluxe Ocean View">Deluxe Ocean View</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Standard King">Standard King</option>
                        <option value="Deluxe Double">Deluxe Double</option>
                        <option value="Presidential Penthouse">Presidential Penthouse</option>
                    `;
                }

                $('#room_type_input').html(options);
                if (selectedType) {
                    $('#room_type_input').val(selectedType);
                }
            },
            error: () => {
                var fallback = `
                    <option value="Deluxe Ocean View">Deluxe Ocean View</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Standard King">Standard King</option>
                    <option value="Deluxe Double">Deluxe Double</option>
                    <option value="Presidential Penthouse">Presidential Penthouse</option>
                `;
                $('#room_type_input').html(fallback);
                if (selectedType) {
                    $('#room_type_input').val(selectedType);
                }
            }
        });
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const room = response && response.body ? response.body : null;
                if (!room) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Room details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingRoomId = id;

                $('#roomModalLabel').text('Edit Room Details');
                $('#room_num_input').val(room.roomNumber || '');
                $('#room_floor_input').val(room.floor != null ? room.floor : 1);
                $('#room_price_input').val(room.pricePerNight != null ? room.pricePerNight : (room.price || ''));
                this.loadRoomTypeOptions(room.roomType || 'Deluxe Ocean View');

                $('#roomModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch room details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const roomNum = $('#room_num_input').val().trim();
        const roomType = $('#room_type_input').val();
        const price = $('#room_price_input').val().trim();
        const floor = $('#room_floor_input').val();

        if (!roomNum || !price) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please enter room number and price per night.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            roomNumber: roomNum,
            roomType: roomType,
            floor: parseInt(floor) || 1,
            price: parseFloat(price),
            pricePerNight: parseFloat(price),
            status: 'AVAILABLE'
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
                        title: 'Room Added',
                        text: `Room ${roomNum} has been added to inventory.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#roomModal').modal('hide');
                    $('#room_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add room. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingRoomId;

            $.ajax({
                url: updateUrl,
                type: 'PUT',
                contentType: 'application/json',
                data: payload,
                headers: this.getAuthHeaders(),
                success: (response) => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Room Updated',
                        text: `Room ${roomNum} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#roomModal').modal('hide');
                    $('#room_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update room. Please check backend server.';
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

    static updateStatus(roomId, newStatus) {
        const detailUrl = this.getBaseUrl() + '/' + roomId;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const room = response && response.body ? response.body : {};
                room.status = newStatus;

                $.ajax({
                    url: detailUrl,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(room),
                    headers: this.getAuthHeaders(),
                    success: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Status Updated',
                            text: `Room #${room.roomNumber || roomId} is now ${newStatus}.`,
                            timer: 1200,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to update room status.',
                            confirmButtonColor: '#e65100'
                        });
                        this.reloadTable();
                    }
                });
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Room not found.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleDelete(id) {
        Swal.fire({
            title: 'Delete Room?',
            text: `Are you sure you want to delete Room #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Room has been removed from inventory.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete room.';
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
