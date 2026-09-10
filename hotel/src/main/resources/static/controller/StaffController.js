/**
 * StaffController.js
 * Manages Staff CRUD operations via REST API with JWT Bearer authentication.
 * Completely separate from User login accounts (/v1/staff only).
 */

export class StaffController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingStaffId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/staff'
            : 'http://localhost:8080/v1/staff';
    }

    static getAuthHeaders() {
        const token = localStorage.getItem("JWT");
        if (!token || token === 'demo-session-token') return {};
        return { 'Authorization': 'Bearer ' + token };
    }

    static init() {
        this.bindEvents();

        // Listen for tab activation to auto-refresh table
        $(document).on('section:shown:staff_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        // "+ Add Staff Member" button
        $('#btn_add_staff').on('click', () => {
            this.openAddModal();
        });

        // Save / Update button in modal
        $('#btn_save_staff').on('click', () => {
            this.handleSaveOrUpdate();
        });

        // Search button (filter by role)
        $('#btn_search_staff').on('click', () => {
            const role = $('#staff_role_filter').val().trim();
            this.filterStaffTable(role);
        });

        // Role filter select (live filter)
        $('#staff_role_filter').on('change', () => {
            const role = $('#staff_role_filter').val().trim();
            this.filterStaffTable(role);
        });

        // Refresh/Reload button
        $('#btn_reload_staff').on('click', () => {
            $('#staff_role_filter').val('');
            this.reloadTable();
        });

        // Delegated table row actions: Edit & Delete
        $('#staff_tbody').on('click', '.btn-action-edit-staff', (e) => {
            const staffId = $(e.currentTarget).data('id');
            this.openEditModal(staffId);
        });

        $('#staff_tbody').on('click', '.btn-action-delete-staff', (e) => {
            const staffId = $(e.currentTarget).data('id');
            this.handleDelete(staffId);
        });
    }

    static getRoleBadgeClass(role) {
        switch ((role || '').toUpperCase()) {
            case 'CHEF': return 'bg-danger-subtle text-danger';
            case 'SECURITY': return 'bg-dark-subtle text-dark';
            case 'MAINTENANCE': return 'bg-warning-subtle text-warning';
            case 'BELLBOY': return 'bg-info-subtle text-info';
            case 'DRIVER': return 'bg-primary-subtle text-primary';
            case 'WAITER': return 'bg-success-subtle text-success';
            default: return 'bg-primary-subtle text-primary';
        }
    }

    static reloadTable() {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const staffList = response && response.body ? response.body : [];
                this.renderTable(staffList);
            },
            error: (xhr) => {
                console.error("Failed to load staff:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#staff_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#staff_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">
                                Unable to load staff from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterStaffTable(role) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: role ? { role: role } : {},
            success: (response) => {
                const staffList = response && response.body ? response.body : [];
                this.renderTable(staffList);
            },
            error: (xhr) => {
                console.error("Failed to filter staff:", xhr);
            }
        });
    }

    static renderTable(staffList) {
        const $tbody = $('#staff_tbody');
        $tbody.empty();

        if (!staffList || staffList.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-user-tie fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No staff found. Click <strong>+ Add Staff Member</strong> to register one.
                    </td>
                </tr>
            `);
            $('#total_staff_badge').text(0);
            return;
        }

        staffList.forEach(s => {
            const id = s.id != null ? s.id : s.staffId;
            const fullName = s.fullName || 'N/A';
            const phone = s.phone || '-';
            const email = s.email || '-';
            const role = (s.role || 'STAFF').toUpperCase();
            const salary = s.salary != null ? `LKR ${Number(s.salary).toLocaleString()}` : 'N/A';

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:34px;height:34px;">
                                <i class="fa-solid fa-user-tie text-muted small"></i>
                            </div>
                            <span class="fw-semibold">${fullName}</span>
                        </div>
                    </td>
                    <td>${phone}</td>
                    <td class="text-muted small">${email}</td>
                    <td>
                        <span class="badge ${this.getRoleBadgeClass(role)}">${role}</span>
                    </td>
                    <td class="fw-bold text-dark">${salary}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-staff" data-id="${id}" title="Edit Staff">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-staff" data-id="${id}" title="Delete Staff">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_staff_badge').text(staffList.length);
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingStaffId = null;
        $('#staffModalLabel').text('Add Staff Member');
        $('#staff_form')[0].reset();
        $('#staff_role_input').val('HOUSEKEEPER');
        $('#staffModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const staff = response && response.body ? response.body : null;
                if (!staff) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Staff details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingStaffId = id;

                $('#staffModalLabel').text('Edit Staff Details');
                $('#staff_fullname_input').val(staff.fullName || '');
                $('#staff_phone_input').val(staff.phone || '');
                $('#staff_email_input').val(staff.email || '');
                $('#staff_role_input').val((staff.role || 'HOUSEKEEPER').toUpperCase());
                $('#staff_salary_input').val(staff.salary != null ? staff.salary : '');
                $('#staffModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch staff details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const fullName = $('#staff_fullname_input').val().trim();
        const phone = $('#staff_phone_input').val().trim();
        const email = $('#staff_email_input').val().trim();
        const role = $('#staff_role_input').val().trim();
        const salary = $('#staff_salary_input').val().trim();

        if (!fullName || !phone || !salary) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please provide full name, phone, and salary.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            fullName: fullName,
            phone: phone,
            email: email,
            role: role,
            salary: parseFloat(salary)
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
                        title: 'Staff Added',
                        text: `${fullName} has been added to the staff.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#staffModal').modal('hide');
                    $('#staff_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add staff member. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingStaffId;

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
                        title: 'Staff Updated',
                        text: `Staff #${this.editingStaffId} details have been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#staffModal').modal('hide');
                    $('#staff_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update staff member. Please check backend server.';
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
            title: 'Delete Staff Member?',
            text: `Are you sure you want to delete Staff #${id}? This action cannot be undone.`,
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
                            text: response.message || 'Staff member has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete staff member.';
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