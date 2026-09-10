/**
 * ReviewController.js
 * Manages customer reviews (ratings + comments) via REST API with JWT Bearer authentication.
 */

export class ReviewController {
    static currentMode = 'ADD'; // 'ADD' or 'EDIT'
    static editingReviewId = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/reviews'
            : 'http://localhost:8080/v1/reviews';
    }

    static getCustomersUrl() {
        return window.location.origin.includes('8080')
            ? '/v1/customers'
            : 'http://localhost:8080/v1/customers';
    }

    static getReservationsUrl() {
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
        this.bindEvents();

        $(document).on('section:shown:review_content', () => {
            this.reloadTable();
        });
    }

    static bindEvents() {
        $('#btn_add_review').on('click', () => {
            this.openAddModal();
        });

        $('#btn_save_review').on('click', () => {
            this.handleSaveOrUpdate();
        });

        $('#btn_search_review').on('click', () => {
            const query = $('#review_search_input').val().trim();
            this.filterReviewTable(query);
        });

        $('#review_search_input').on('keyup', (e) => {
            const query = $(e.target).val().trim();
            this.filterReviewTable(query);
        });

        $('#btn_reload_reviews').on('click', () => {
            $('#review_search_input').val('');
            this.reloadTable();
        });

        $('#review_tbody').on('click', '.btn-action-edit-review', (e) => {
            const reviewId = $(e.currentTarget).data('id');
            this.openEditModal(reviewId);
        });

        $('#review_tbody').on('click', '.btn-action-delete-review', (e) => {
            const reviewId = $(e.currentTarget).data('id');
            this.handleDelete(reviewId);
        });
    }

    static stars(rating) {
        const n = Math.min(Math.max(parseInt(rating) || 0, 0), 5);
        let out = '';
        for (let i = 1; i <= 5; i++) {
            out += i <= n
                ? '<i class="fa-solid fa-star text-warning"></i> '
                : '<i class="fa-regular fa-star text-muted"></i> ';
        }
        return out.trim();
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
                const reviews = response && response.body ? response.body : [];
                this.renderTable(reviews);
            },
            error: (xhr) => {
                console.error("Failed to load reviews:", xhr);
                if (xhr.status === 401 || xhr.status === 403) {
                    $('#review_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-danger py-4">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>Unauthorized. Please log in first.
                            </td>
                        </tr>
                    `);
                } else {
                    $('#review_tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">
                                Unable to load reviews from server.
                            </td>
                        </tr>
                    `);
                }
            }
        });
    }

    static filterReviewTable(query) {
        $.ajax({
            url: this.getBaseUrl(),
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            data: query ? { customerId: query } : {},
            success: (response) => {
                const reviews = response && response.body ? response.body : [];
                this.renderTable(reviews);
            },
            error: (xhr) => {
                console.error("Failed to filter reviews:", xhr);
            }
        });
    }

    static renderTable(reviews) {
        const $tbody = $('#review_tbody');
        $tbody.empty();

        if (!reviews || reviews.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-star fa-2x mb-3 d-block text-secondary opacity-50"></i>
                        No reviews yet. Click <strong>+ Add Review</strong> to record guest feedback.
                    </td>
                </tr>
            `);
            $('#total_review_badge').text(0);
            return;
        }

        reviews.forEach(rv => {
            const id = rv.id != null ? rv.id : rv.reviewId;
            const rating = rv.rating != null ? rv.rating : '-';
            const comment = rv.comment || '-';
            const customer = rv.customerName || ('Customer #' + (rv.customerId || '-'));
            const reservation = rv.reservationNumber || (rv.reservationId ? '#' + rv.reservationId : '—');
            const created = this.formatDate(rv.createdAt);

            const row = `
                <tr>
                    <td class="table-id-col">#${id}</td>
                    <td><span class="text-warning">${this.stars(rating)}</span></td>
                    <td class="small text-muted">${comment}</td>
                    <td class="fw-semibold">${customer}</td>
                    <td><span class="badge bg-light text-dark border">${reservation}</span></td>
                    <td class="small text-muted">${created}</td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-action-edit btn-action-edit-review" data-id="${id}" title="Edit Review">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action-delete btn-action-delete-review" data-id="${id}" title="Delete Review">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        $('#total_review_badge').text(reviews.length);
    }

    static loadDropdownOptions(selectedCustomerId, selectedReservationId) {
        $.when(
            $.ajax({ url: this.getCustomersUrl(), type: 'GET', headers: this.getAuthHeaders() }),
            $.ajax({ url: this.getReservationsUrl(), type: 'GET', headers: this.getAuthHeaders() })
        ).done((custResp, resResp) => {
            const customers = custResp[0] && custResp[0].body ? custResp[0].body : [];
            const reservations = resResp[0] && resResp[0].body ? resResp[0].body : [];

            const $custSelect = $('#review_customer_select');
            $custSelect.empty().append('<option value="">-- Select Customer --</option>');
            customers.forEach(c => {
                const cId = c.customerId != null ? c.customerId : c.id;
                const cName = c.customerName || ('Customer #' + cId);
                $custSelect.append(`<option value="${cId}">${cName}</option>`);
            });
            $custSelect.val(selectedCustomerId ? String(selectedCustomerId) : '');

            const $resSelect = $('#review_reservation_select');
            $resSelect.empty().append('<option value="">-- Select Reservation (optional) --</option>');
            reservations.forEach(r => {
                const rId = r.reservationId != null ? r.reservationId : r.id;
                const label = (r.reservationNumber || ('#' + rId)) + (r.customerName ? ' - ' + r.customerName : '');
                $resSelect.append(`<option value="${rId}">${label}</option>`);
            });
            $resSelect.val(selectedReservationId ? String(selectedReservationId) : '');
        }).fail(() => {
            $('#review_customer_select').empty().append('<option value="">Customers unavailable</option>');
            $('#review_reservation_select').empty().append('<option value="">Reservations unavailable</option>');
        });
    }

    static openAddModal() {
        this.currentMode = 'ADD';
        this.editingReviewId = null;
        $('#reviewModalLabel').text('Add New Review');
        $('#review_form')[0].reset();
        $('#review_rating_select').val(5);
        this.loadDropdownOptions(null, null);
        $('#reviewModal').modal('show');
    }

    static openEditModal(id) {
        const detailUrl = this.getBaseUrl() + '/' + id;

        $.ajax({
            url: detailUrl,
            type: 'GET',
            contentType: 'application/json',
            headers: this.getAuthHeaders(),
            success: (response) => {
                const review = response && response.body ? response.body : null;
                if (!review) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Found',
                        text: 'Review details could not be found.',
                        confirmButtonColor: '#e65100'
                    });
                    return;
                }

                this.currentMode = 'EDIT';
                this.editingReviewId = id;

                $('#reviewModalLabel').text('Edit Review #' + id);
                $('#review_rating_select').val(review.rating != null ? String(review.rating) : '5');
                $('#review_comment_input').val(review.comment || '');
                this.loadDropdownOptions(review.customerId, review.reservationId);
                $('#reviewModal').modal('show');
            },
            error: (xhr) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch review details from server.',
                    confirmButtonColor: '#e65100'
                });
            }
        });
    }

    static handleSaveOrUpdate() {
        const customerId = $('#review_customer_select').val();
        const reservationId = $('#review_reservation_select').val();
        const rating = $('#review_rating_select').val();
        const comment = $('#review_comment_input').val().trim();

        if (!customerId || !rating || !comment) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please select a customer, pick a rating, and enter a comment.',
                confirmButtonColor: '#e65100'
            });
            return;
        }

        const payload = JSON.stringify({
            customerId: parseInt(customerId),
            reservationId: reservationId ? parseInt(reservationId) : null,
            rating: parseInt(rating),
            comment: comment
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
                        title: 'Review Added',
                        text: 'Guest feedback has been recorded successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#reviewModal').modal('hide');
                    $('#review_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to add review. Please check backend server.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Save Failed',
                        text: errMsg,
                        confirmButtonColor: '#e65100'
                    });
                }
            });
        } else {
            const updateUrl = this.getBaseUrl() + '/' + this.editingReviewId;

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
                        title: 'Review Updated',
                        text: `Review #${this.editingReviewId} has been updated.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    $('#reviewModal').modal('hide');
                    $('#review_form')[0].reset();
                    this.reloadTable();
                },
                error: (xhr) => {
                    const errMsg = xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : 'Failed to update review. Please check backend server.';
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
            title: 'Delete Review?',
            text: `Are you sure you want to delete Review #${id}? This action cannot be undone.`,
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
                            text: 'Review has been removed.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                        this.reloadTable();
                    },
                    error: (xhr) => {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete review.';
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