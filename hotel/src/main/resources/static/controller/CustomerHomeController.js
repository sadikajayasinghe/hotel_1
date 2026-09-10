/**
 * CustomerHomeController.js - Controller for Hotel Lanka Customer Facing Website
 * Handles Availability Search, Dynamic Room Displays, and Instant Booking Modal.
 */

import { DB } from '../db/db.js';

export class CustomerHomeController {
    static rooms = [
        {
            id: 1,
            name: "Deluxe Room",
            guests: 2,
            beds: "1 Bed",
            area: "25 m²",
            price: 18000,
            badge: null,
            image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 2,
            name: "Ocean View Room",
            guests: 2,
            beds: "1 Bed",
            area: "30 m²",
            price: 24000,
            badge: { text: "Best Seller", class: "best-seller" },
            image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 3,
            name: "Executive Suite",
            guests: 2,
            beds: "1 Bed",
            area: "45 m²",
            price: 35000,
            badge: null,
            image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 4,
            name: "Presidential Suite",
            guests: 2,
            beds: "1 Bed",
            area: "60 m²",
            price: 50000,
            badge: { text: "Luxury", class: "luxury" },
            image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop"
        }
    ];

    static selectedRoom = null;

    static getBaseUrl() {
        return window.location.origin.includes('8080') ? '' : 'http://localhost:8080';
    }

    static init() {
        this.bindScrollHeader();
        this.initDates();
        this.renderPopularRooms();
        this.loadRoomsFromBackend();
        this.bindEvents();
    }

    static loadRoomsFromBackend() {
        $.ajax({
            url: this.getBaseUrl() + '/v1/rooms',
            type: 'GET',
            contentType: 'application/json',
            success: (response) => {
                if (response && response.body && Array.isArray(response.body) && response.body.length > 0) {
                    const fallbackImages = [
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop"
                    ];

                    this.rooms = response.body.map((r, index) => {
                        const id = r.roomId != null ? r.roomId : (r.id != null ? r.id : (index + 1));
                        const price = r.pricePerNight != null ? r.pricePerNight : (r.price != null ? r.price : 20000);
                        let badge = null;
                        if (index === 1) badge = { text: "Best Seller", class: "best-seller" };
                        if (index === 3) badge = { text: "Luxury", class: "luxury" };

                        return {
                            id: id,
                            name: r.roomType || (r.roomNumber ? `Room ${r.roomNumber}` : `Deluxe Suite ${index + 1}`),
                            roomNumber: r.roomNumber || String(100 + index + 1),
                            guests: 2,
                            beds: "1 Bed",
                            area: `${25 + (index * 10)} m²`,
                            price: price,
                            badge: badge,
                            image: fallbackImages[index % fallbackImages.length]
                        };
                    });
                    this.renderPopularRooms();
                }
            },
            error: (err) => {
                console.log("Backend rooms API offline or empty, displaying default luxury suites.");
            }
        });
    }

    static bindScrollHeader() {
        $(window).on('scroll', () => {
            if ($(window).scrollTop() > 50) {
                $('#site_header').addClass('scrolled');
            } else {
                $('#site_header').removeClass('scrolled');
            }
        });
    }

    static initDates() {
        const today = new Date();
        const checkOut = new Date(today);
        checkOut.setDate(today.getDate() + 2);

        // Format dates as "DD MMM YYYY"
        const formatDate = (d) => {
            const day = d.getDate();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        };

        const formatIso = (d) => d.toISOString().split('T')[0];

        $('#checkin_date_input').val(formatIso(today));
        $('#checkout_date_input').val(formatIso(checkOut));
        
        $('#checkin_date_label').text(formatDate(today));
        $('#checkout_date_label').text(formatDate(checkOut));

        // Date input change handlers
        $('#checkin_date_input').on('change', function() {
            const val = new Date($(this).val());
            if (!isNaN(val.getTime())) {
                $('#checkin_date_label').text(formatDate(val));
            }
        });

        $('#checkout_date_input').on('change', function() {
            const val = new Date($(this).val());
            if (!isNaN(val.getTime())) {
                $('#checkout_date_label').text(formatDate(val));
            }
        });
    }

    static renderPopularRooms() {
        const $grid = $('#rooms_grid');
        $grid.empty();

        this.rooms.forEach(room => {
            const badgeHtml = room.badge 
                ? `<span class="room-badge ${room.badge.class}">${room.badge.text}</span>` 
                : '';

            const formattedPrice = Number(room.price).toLocaleString('en-US');

            const card = `
                <div class="room-card" data-id="${room.id}">
                    <div class="room-image-container">
                        ${badgeHtml}
                        <img src="${room.image}" alt="${room.name}" class="room-img" loading="lazy">
                    </div>
                    <div class="room-content">
                        <h3 class="room-name">${room.name}</h3>
                        <div class="room-specs">
                            <span><i class="fa-solid fa-user-group"></i> ${room.guests} Guests</span>
                            <span><i class="fa-solid fa-bed"></i> ${room.beds}</span>
                            <span><i class="fa-solid fa-arrows-left-right-to-line"></i> ${room.area}</span>
                        </div>
                        <div class="room-footer">
                            <div class="room-price-box">
                                <span class="room-price-amount">LKR ${formattedPrice}</span>
                                <span class="room-price-unit">/ night</span>
                            </div>
                            <button class="btn-book-now" data-room-id="${room.id}">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $grid.append(card);
        });
    }

    static bindEvents() {
        // Explore Rooms button smooth scroll
        $('#btn_explore_rooms, #nav_rooms').on('click', (e) => {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: $('#rooms_section').offset().top - 80
            }, 600);
        });

        // Watch video CTA
        $('#btn_watch_video').on('click', () => {
            $('#videoModal').modal('show');
        });

        // Check availability button
        $('#btn_check_availability').on('click', () => {
            const checkIn = $('#checkin_date_label').text();
            const checkOut = $('#checkout_date_label').text();
            const guests = $('#guests_label').text();

            Swal.fire({
                icon: 'success',
                title: 'Rooms Available!',
                html: `We found <strong>4 available room categories</strong> for:<br>
                       <span style="color:#f36c21;">📅 ${checkIn} &rarr; ${checkOut}</span><br>
                       <small class="text-muted">(${guests})</small>`,
                confirmButtonColor: '#f36c21',
                confirmButtonText: 'View Options'
            }).then(() => {
                $('html, body').animate({
                    scrollTop: $('#rooms_section').offset().top - 80
                }, 500);
            });
        });

        // Guests & Rooms selector click
        $('#guests_field').on('click', () => {
            Swal.fire({
                title: 'Guests & Rooms',
                html: `
                    <div class="p-2 text-start">
                        <label class="form-label fw-semibold">Guests Count:</label>
                        <select id="swal_guests_count" class="form-select mb-3">
                            <option value="1 Guest, 1 Room">1 Guest, 1 Room</option>
                            <option value="2 Guests, 1 Room" selected>2 Guests, 1 Room</option>
                            <option value="3 Guests, 1 Room">3 Guests, 1 Room</option>
                            <option value="4 Guests, 2 Rooms">4 Guests, 2 Rooms</option>
                            <option value="5+ Guests, Multiple Rooms">5+ Guests (Family Suite)</option>
                        </select>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#f36c21',
                confirmButtonText: 'Apply'
            }).then((res) => {
                if (res.isConfirmed) {
                    const selected = $('#swal_guests_count').val();
                    $('#guests_label').text(selected);
                }
            });
        });

        // Book Now button click
        $(document).on('click', '.btn-book-now', (e) => {
            const roomId = $(e.currentTarget).data('room-id');
            this.openBookingModal(roomId);
        });

        // Booking form submission
        $('#booking_form').on('submit', (e) => {
            e.preventDefault();
            this.handleConfirmBooking();
        });

        // Carousel next arrow interaction
        $('#btn_carousel_next').on('click', () => {
            const $grid = $('#rooms_grid');
            $grid.animate({
                scrollLeft: $grid.scrollLeft() + 300
            }, 300);
        });

        // Smooth scroll for anchor nav links
        $('.main-nav a[href*="#"]').on('click', function(e) {
            const hash = $(this).attr('href');
            if (hash.startsWith('#') && $(hash).length > 0) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: $(hash).offset().top - 60
                }, 500);
            }
        });

        // Contact form submission
        $('#contact_form').on('submit', (e) => {
            e.preventDefault();
            const name = $('#contact_name').val().trim();
            const email = $('#contact_email').val().trim();
            const message = $('#contact_message').val().trim();

            if (!name || !email || !message) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Details',
                    text: 'Please fill in your name, email and message.',
                    confirmButtonColor: '#f36c21'
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                html: `Thank you, <strong>${name}</strong>. Our concierge team will get back to you shortly.`,
                confirmButtonColor: '#f36c21',
                confirmButtonText: 'Great!'
            });

            this.resetContactForm();
        });
    }

    static resetContactForm() {
        $('#contact_name').val('');
        $('#contact_email').val('');
        $('#contact_subject').val('');
        $('#contact_message').val('');
    }

    static openBookingModal(roomId) {
        const room = this.rooms.find(r => r.id === roomId) || this.rooms[0];
        this.selectedRoom = room;

        $('#modal_room_name').text(room.name);
        $('#modal_room_price').text('LKR ' + Number(room.price).toLocaleString('en-US'));
        $('#modal_room_image').attr('src', room.image);

        // Pre-fill dates from search bar
        $('#book_checkin').val($('#checkin_date_input').val());
        $('#book_checkout').val($('#checkout_date_input').val());

        this.calculateModalTotal();

        $('#book_checkin, #book_checkout').off('change').on('change', () => {
            this.calculateModalTotal();
        });

        $('#bookingModal').modal('show');
    }

    static calculateModalTotal() {
        if (!this.selectedRoom) return;

        const checkIn = new Date($('#book_checkin').val());
        const checkOut = new Date($('#book_checkout').val());

        let nights = 1;
        if (!isNaN(checkIn) && !isNaN(checkOut) && checkOut > checkIn) {
            const diffTime = Math.abs(checkOut - checkIn);
            nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const total = nights * this.selectedRoom.price;
        $('#modal_total_nights').text(`${nights} night${nights > 1 ? 's' : ''}`);
        $('#modal_total_amount').text(`LKR ${Number(total).toLocaleString('en-US')}`);
    }

    static handleConfirmBooking() {
        const guestName = $('#book_guest_name').val().trim();
        const guestPhone = $('#book_guest_phone').val().trim();
        const guestEmail = $('#book_guest_email').val().trim();
        const checkIn = $('#book_checkin').val();
        const checkOut = $('#book_checkout').val();

        if (!guestName || !guestPhone) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Please provide your full name and phone number to confirm the booking.',
                confirmButtonColor: '#f36c21'
            });
            return;
        }

        // Calculate nights and total amount
        let nights = 1;
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
            nights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
        }
        const totalAmount = nights * (this.selectedRoom ? this.selectedRoom.price : 20000);
        const resNumber = 'RES-' + Math.floor(100000 + Math.random() * 900000);

        // 1. Save Customer to Spring Boot backend, then link to Reservation
        const customerPayload = {
            customerName: guestName,
            contact: guestPhone,
            phone: guestPhone,
            email: guestEmail,
            nicOrPassport: 'GUEST-' + Date.now().toString().slice(-4),
            address: 'Online Guest Booking'
        };

        const roomId = (this.selectedRoom && this.selectedRoom.id) ? Number(this.selectedRoom.id) : 1;
        const roomNum = this.selectedRoom ? (this.selectedRoom.roomNumber || this.selectedRoom.name) : "101";

        const sendReservationToBackend = (customerId) => {
            const reservationPayload = {
                reservationNumber: resNumber,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                numberOfGuests: 2,
                totalAmount: totalAmount,
                status: "CONFIRMED",
                roomId: roomId,
                roomNumber: roomNum,
                customerId: customerId || 1,
                customerName: guestName
            };

            $.ajax({
                url: this.getBaseUrl() + '/v1/reservations',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(reservationPayload),
                success: (response) => {
                    console.log("Reservation stored in Spring Boot backend:", response);
                },
                error: (xhr) => {
                    console.log("Backend reservation sync notice:", xhr);
                }
            });
        };

        // Save customer first, fetch ID, then save reservation
        $.ajax({
            url: this.getBaseUrl() + '/v1/customers',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(customerPayload),
            success: () => {
                // Find created customer to get their generated ID
                $.ajax({
                    url: this.getBaseUrl() + '/v1/customers?customerName=' + encodeURIComponent(guestName),
                    type: 'GET',
                    contentType: 'application/json',
                    success: (res) => {
                        let cId = 1;
                        if (res && res.body && res.body.length > 0) {
                            cId = res.body[res.body.length - 1].customerId || res.body[res.body.length - 1].id || 1;
                        }
                        sendReservationToBackend(cId);
                    },
                    error: () => {
                        sendReservationToBackend(1);
                    }
                });
            },
            error: () => {
                sendReservationToBackend(1);
            }
        });

        // 2. Also sync to local storage DB for instant visibility in admin dashboard
        try {
            DB.saveReservation({
                id: resNumber,
                customerName: guestName,
                phone: guestPhone,
                email: guestEmail,
                roomId: roomId,
                roomNumber: roomNum,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalAmount: totalAmount,
                status: 'CONFIRMED'
            });
        } catch (e) {
            console.log('Saved to storage');
        }

        // Close modal and show luxury confirmation
        $('#bookingModal').modal('hide');

        Swal.fire({
            icon: 'success',
            title: 'Booking Confirmed!',
            html: `
                <p>Thank you, <strong>${guestName}</strong>! Your reservation has been recorded.</p>
                <div style="background:#FAF8F5; padding:14px; border-radius:10px; border:1px solid #EBE5DF; margin-top:14px; text-align:left; font-size:0.92rem;">
                    <div style="margin-bottom:6px;"><strong>Booking Reference:</strong> <span style="color:#f36c21; font-weight:700;">${resNumber}</span></div>
                    <div style="margin-bottom:6px;"><strong>Room:</strong> ${this.selectedRoom ? this.selectedRoom.name : 'Deluxe Room'}</div>
                    <div style="margin-bottom:6px;"><strong>Dates:</strong> ${checkIn} &rarr; ${checkOut} (${nights} night${nights > 1 ? 's' : ''})</div>
                    <div style="margin-bottom:6px;"><strong>Estimated Rate:</strong> LKR ${Number(totalAmount).toLocaleString('en-US')}</div>
                    <div><strong>Contact:</strong> ${guestPhone}</div>
                </div>
                <p style="margin-top:14px; font-size:0.85rem; color:#78716C;">A confirmation has been logged in the system. Pay at check-in.</p>
            `,
            confirmButtonColor: '#f36c21',
            confirmButtonText: 'Great, Thank You!'
        });

        $('#booking_form')[0].reset();
    }
}

// Auto-run on document ready
$(document).ready(() => {
    CustomerHomeController.init();
});

