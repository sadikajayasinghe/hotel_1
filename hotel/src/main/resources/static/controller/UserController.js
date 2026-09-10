/**
 * UserController.js
 * Implements user management (create, read, update, delete) with JWT header
 * and a "My Profile" modal so the logged-in user can change their own details.
 */

import { DB } from '../db/db.js';

export class UserController {
    static init() {
        this.bindEvents();

        $(document).on('section:shown:user_content', () => {
            this.reloadTable();
        });
    }

    static getBaseUrl() {
        return window.location.origin.includes('8080') ? '' : 'http://localhost:8080';
    }

    static getApiBase() {
        return this.getBaseUrl() + '/v1/test';
    }

    static authHeaders() {
        const token = localStorage.getItem('JWT');
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    static bindEvents() {
        // Add New User button -> always starts in "Create" mode
        $('#btn_open_user_modal').on('click', () => {
            this.resetUserModal();
        });

        // Save / Update user button (Add User modal)
        $('#btn_save_user, #signInBtn').on('click', () => {
            this.handleSaveUser();
        });

        // Search button
        $('#searchBtn').on('click', () => {
            this.handleSearch();
        });

        // Reload table button
        $('#reloadUsersBtn').on('click', () => {
            $('#nameInput').val('');
            $('#roleInput').val('');
            this.reloadTable();
        });

        // Row actions: Edit + Deactivate
        $('#userTbody').on('click', '.btn-edit-user-row', (e) => {
            e.stopPropagation();
            this.openEditUserModal($(e.currentTarget));
        });

        $('#userTbody').on('click', '.btn-delete-user-row', (e) => {
            e.stopPropagation();
            const userId = $(e.currentTarget).data('id');
            const username = $(e.currentTarget).data('name') || `User #${userId}`;
            this.deleteUserById(userId, username);
        });

        // My Profile
        $('#profile_btn').on('click', (e) => {
            e.preventDefault();
            this.openProfileModal();
        });

        $('#btn_save_profile').on('click', () => {
            this.handleSaveProfile();
        });
    }

    static resetUserModal() {
        $('#edit_user_id').val('');
        $('#inputUserName1').val('');
        $('#inputPassword1').val('');
        $('#inputUserRole1').val('RECEPTIONIST');
        $('#inputUserStatus1').val('ACTIVE');
        $('#password_hint').hide();
        $('#userModalLabel').text('Create User');
        $('#userModalSub').text('Add a new user with assigned system privileges');
        $('#btn_save_user').html('<i class="fa-solid fa-check me-1"></i> Save User');
    }

    static openEditUserModal($btn) {
        const userId = $btn.data('id');
        const username = $btn.data('name') || `User #${userId}`;
        const role = $btn.data('role') || 'RECEPTIONIST';
        const status = $btn.data('status') || 'ACTIVE';

        $('#edit_user_id').val(userId);
        $('#inputUserName1').val(username);
        $('#inputPassword1').val('');
        $('#inputUserRole1').val(role);
        $('#inputUserStatus1').val(status);
        $('#password_hint').show();
        $('#userModalLabel').text('Edit User');
        $('#userModalSub').text('Update the user\u2019s details \u2014 leave password blank to keep it');
        $('#btn_save_user').html('<i class="fa-solid fa-floppy-disk me-1"></i> Update User');

        const modalEl = document.getElementById('userModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.show();
        }
    }

    static handleSaveUser() {
        const userId = $('#edit_user_id').val().trim();
        const userName = $('#inputUserName1').val().trim();
        const password = $('#inputPassword1').val().trim();
        const userRoles = $('#inputUserRole1').val().trim() || 'RECEPTIONIST';
        const userStatus = $('#inputUserStatus1').val().trim() || 'ACTIVE';

        const isEdit = !!userId;

        if (!userName) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Required Fields',
                text: 'Please provide a username.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        if (!isEdit && !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Password Required',
                text: 'Please provide a password for the new user.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const data = JSON.stringify({
            userName: userName,
            password: password,
            userRoles: userRoles,
            userStatus: userStatus
        });

        const url = isEdit
            ? `${this.getBaseUrl()}/v1/users/${userId}`
            : `${this.getApiBase()}/save`;

        $.ajax({
            url: url,
            type: isEdit ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: data,
            headers: this.authHeaders(),
            success: (response) => {
                Swal.fire({
                    icon: 'success',
                    title: isEdit ? 'User Updated' : 'User Created',
                    text: `User "${userName}" was ${isEdit ? 'updated' : 'created'} successfully!`,
                    timer: 1600,
                    showConfirmButton: false
                });

                this.closeModal('userModal');
                this.resetUserModal();
                this.reloadTable();

                if (isEdit && String(userId) === String(localStorage.getItem('userId'))) {
                    this.updateNavUser(userName);
                }
            },
            error: (xhr) => {
                const errMsg = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Failed to save user. Please check backend server.';
                Swal.fire({
                    icon: 'error',
                    title: isEdit ? 'Update Failed' : 'Creation Failed',
                    text: errMsg,
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static reloadTable() {
        $.ajax({
            url: `${this.getApiBase()}/getAll`,
            type: 'GET',
            contentType: "application/json",
            headers: this.authHeaders(),
            success: (response) => {
                let html = "";
                if (response && response.body && response.body.length > 0) {
                    for (const u of response.body) {
                        html += this.renderUserRow(u);
                    }
                } else {
                    html = `<tr><td colspan="5" class="text-center py-4 text-muted">No users found in database. Click "Add New User" to create one.</td></tr>`;
                }
                $('#userTbody').html(html);
            },
            error: (xhr) => {
                if (xhr.status === 403 || xhr.status === 401) {
                    $('#userTbody').html(`<tr><td colspan="5" class="text-center text-danger py-4"><i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.</td></tr>`);
                } else {
                    $('#userTbody').html(`<tr><td colspan="5" class="text-center text-muted py-4">Unable to connect to backend server.</td></tr>`);
                }
            }
        });
    }

    static renderUserRow(u) {
        const statusBadge = u.userStatus === 'ACTIVE'
            ? '<span class="badge bg-success-subtle text-success border border-success">ACTIVE</span>'
            : '<span class="badge bg-danger-subtle text-danger border border-danger">INACTIVE</span>';

        const roleBadgeClass = u.userRoles === 'ADMIN'
            ? 'bg-danger-subtle text-danger'
            : (u.userRoles === 'MANAGER' ? 'bg-warning-subtle text-warning' : 'bg-primary-subtle text-primary');

        const editBtn = `
            <button class="btn btn-sm btn-outline-primary btn-edit-user-row"
                data-id="${u.userId}" data-name="${u.userName}"
                data-role="${u.userRoles || 'RECEPTIONIST'}" data-status="${u.userStatus || 'ACTIVE'}"
                title="Edit User">
                <i class="fa-solid fa-pen"></i>
            </button>`;

        const deleteBtn = `
            <button class="btn btn-sm btn-outline-danger btn-delete-user-row"
                data-id="${u.userId}" data-name="${u.userName}" title="Deactivate User">
                <i class="fa-solid fa-trash-can"></i>
            </button>`;

        return `
            <tr>
                <td class="fw-bold text-secondary">#${u.userId}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
                            <i class="fa-solid fa-user text-muted small"></i>
                        </div>
                        <span class="fw-semibold">${u.userName}</span>
                    </div>
                </td>
                <td><span class="badge ${roleBadgeClass}">${u.userRoles || 'STAFF'}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="d-flex gap-2">
                        ${editBtn}
                        ${deleteBtn}
                    </div>
                </td>
            </tr>
        `;
    }

    static handleSearch() {
        const userName = $('#nameInput').val().trim();
        const userRole = $('#roleInput').val().trim();

        if (!userName && !userRole) {
            this.reloadTable();
            return;
        }

        $.ajax({
            url: `${this.getApiBase()}/filterUser`,
            type: 'GET',
            contentType: 'application/json',
            data: {
                userName: userName,
                userRole: userRole
            },
            headers: this.authHeaders(),
            success: (response) => {
                let html = "";
                if (response && response.body && response.body.length > 0) {
                    for (const u of response.body) {
                        html += this.renderUserRow(u);
                    }
                } else {
                    html = `<tr><td colspan="5" class="text-center py-4 text-muted">No matching users found for "${userName || 'any'}" / "${userRole || 'any'}".</td></tr>`;
                }
                $('#userTbody').html(html);
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Search Error',
                    text: 'Failed to search users. Please verify authentication token.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static deleteUserById(userId, userName = `User #${userId}`) {
        if (String(userId) === String(localStorage.getItem('userId'))) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Deactivate Own Account',
                text: 'You cannot deactivate the account you are currently signed in with.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        Swal.fire({
            title: 'Deactivate User?',
            text: `Are you sure you want to deactivate ${userName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Deactivate'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `${this.getApiBase()}/${userId}`,
                    type: 'DELETE',
                    contentType: "application/json",
                    headers: this.authHeaders(),
                    success: (response) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deactivated!',
                            text: response.message || 'User status updated to INACTIVE.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Something went wrong while deleting user.',
                            confirmButtonColor: '#e65100'
                        });
                    }
                });
            }
        });
    }

    // ================= My Profile =================

    static openProfileModal() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            Swal.fire({
                icon: 'warning',
                title: 'No Active User',
                text: 'Please log in first to view your profile.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        $.ajax({
            url: `${this.getBaseUrl()}/v1/users/${userId}`,
            type: 'GET',
            contentType: 'application/json',
            headers: this.authHeaders(),
            success: (response) => {
                const u = response && response.body ? response.body : null;
                if (!u) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Profile Error',
                        text: 'Unable to load your profile.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                const role = u.userRoles || 'STAFF';
                const roleClass = role === 'ADMIN'
                    ? 'bg-danger-subtle text-danger'
                    : (role === 'MANAGER' ? 'bg-warning-subtle text-warning' : 'bg-primary-subtle text-primary');

                $('#profile_user_id_input').val(u.userId);
                $('#profile_username_input').val(u.userName);
                $('#profile_password_input').val('');
                $('#profile_status_input').val(u.userStatus || 'ACTIVE');
                $('#profile_username_text').text(u.userName);
                $('#profile_role_text').attr('class', 'badge mt-1 ' + roleClass).text(role);

                this.updateNavUser(u.userName);

                const modalEl = document.getElementById('profileModal');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modal.show();
                }
            },
            error: (xhr) => {
                if (xhr.status === 403 || xhr.status === 401) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unauthorized',
                        text: 'Session expired. Please log in again.',
                        confirmButtonColor: '#e65100'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Profile Error',
                        text: 'Unable to load your profile from the server.',
                        confirmButtonColor: '#e65100'
                    });
                }
            }
        });
    }

    static handleSaveProfile() {
        const userId = $('#profile_user_id_input').val().trim();
        const userName = $('#profile_username_input').val().trim();
        const password = $('#profile_password_input').val().trim();

        if (!userId || !userName) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please provide a username.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        $.ajax({
            url: `${this.getBaseUrl()}/v1/users/${userId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                userName: userName,
                password: password
            }),
            headers: this.authHeaders(),
            success: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your account details were updated successfully.',
                    timer: 1600,
                    showConfirmButton: false
                });

                const currentUser = DB.getCurrentUser() || {};
                DB.setCurrentUser({ username: userName, userId: userId, role: currentUser.role || 'ADMIN' });
                this.updateNavUser(userName);
                this.closeModal('profileModal');
            },
            error: (xhr) => {
                const errMsg = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Failed to update profile. Please check backend server.';
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: errMsg,
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static updateNavUser(username) {
        $('#nav_user_name').text(username || 'Admin');
        $('#dropdown_signed_in').text('Signed in as ' + (username || 'Administrator'));
    }

    static closeModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) {
            const modal = bootstrap.Modal.getInstance(el);
            if (modal) modal.hide();
        }
    }
}