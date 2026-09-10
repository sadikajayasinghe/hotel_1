/**
 * SettingsController.js
 * Stores hotel information and app preferences in localStorage.
 * Read-only "About & System" panel shows the current session details.
 */

export class SettingsController {
    static STORAGE_KEY = 'hotel_settings';

    static getDefaults() {
        return {
            hotelName: 'Hotel Lanka',
            hotelAddress: '',
            hotelPhone: '',
            hotelEmail: '',
            currency: 'LKR',
            taxRate: 0,
            receiptFooter: 'Thank you for staying with us!'
        };
    }

    static getUrl(path) {
        return window.location.origin.includes('8080')
            ? '/v1' + path
            : 'http://localhost:8080/v1' + path;
    }

    static init() {
        this.bindEvents();

        $(document).on('section:shown:settings_content', () => {
            this.loadSettings();
            this.loadSystemInfo();
        });
    }

    static bindEvents() {
        $('#btn_save_settings').on('click', () => {
            this.saveSettings();
        });

        $('#btn_reset_settings').on('click', () => {
            Swal.fire({
                title: 'Reset Settings?',
                text: 'This will restore all settings to their defaults.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, Reset'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem(this.STORAGE_KEY);
                    this.loadSettings();
                    Swal.fire({
                        icon: 'success',
                        title: 'Settings Reset',
                        text: 'All settings restored to defaults.',
                        timer: 1400,
                        showConfirmButton: false
                    });
                }
            });
        });
    }

    static loadSettings() {
        let settings;
        try {
            settings = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        } catch (e) {
            settings = null;
        }
        settings = { ...this.getDefaults(), ...(settings || {}) };

        $('#set_hotel_name').val(settings.hotelName || '');
        $('#set_hotel_address').val(settings.hotelAddress || '');
        $('#set_hotel_phone').val(settings.hotelPhone || '');
        $('#set_hotel_email').val(settings.hotelEmail || '');
        $('#set_currency').val(settings.currency || 'LKR');
        $('#set_tax_rate').val(settings.taxRate != null ? settings.taxRate : 0);
        $('#set_receipt_footer').val(settings.receiptFooter || '');
    }

    static saveSettings() {
        const settings = {
            hotelName: $('#set_hotel_name').val().trim() || 'Hotel Lanka',
            hotelAddress: $('#set_hotel_address').val().trim(),
            hotelPhone: $('#set_hotel_phone').val().trim(),
            hotelEmail: $('#set_hotel_email').val().trim(),
            currency: $('#set_currency').val(),
            taxRate: parseFloat($('#set_tax_rate').val()) || 0,
            receiptFooter: $('#set_receipt_footer').val().trim()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));

        Swal.fire({
            icon: 'success',
            title: 'Settings Saved',
            text: 'Hotel information and preferences have been updated.',
            timer: 1500,
            showConfirmButton: false
        });
    }

    static loadSystemInfo() {
        $('#set_about_version').text('Hotel Lanka v1.0');
        $('#set_about_api').text(window.location.origin.includes('8080')
            ? 'same-origin /v1'
            : 'http://localhost:8080/v1');

        const currentUser = DB.getCurrentUser && DB.getCurrentUser();
        if (currentUser && (currentUser.userName || currentUser.username)) {
            const name = currentUser.userName || currentUser.username || '-';
            const role = (currentUser.role || '').toLowerCase();
            $('#set_about_user').text(`${name}${role ? ' (' + role + ')' : ''}`);
        } else {
            $('#set_about_user').text(localStorage.getItem('userId') ? 'User #' + localStorage.getItem('userId') : 'Not signed in');
        }
    }
}