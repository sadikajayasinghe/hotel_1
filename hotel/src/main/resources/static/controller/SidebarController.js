/**
 * SidebarController.js
 * Manages sidebar navigation, active pill styling, sidebar collapse/expand, and logout.
 */

import { LoginController } from './LoginController.js';

export class SidebarController {
    static init() {
        this.bindNavigation();
        this.bindToggle();
        this.bindLogout();
    }

    static bindNavigation() {
        $('.sidebar-menu .nav-link').on('click', function (e) {
            e.preventDefault();

            const targetSectionId = $(this).data('target');
            if (!targetSectionId) return;

            // Update active pill state matching screenshot
            $('.sidebar-menu .nav-link').removeClass('active');
            $(this).addClass('active');

            // Hide all content sections, show targeted section
            $('.content-section').hide();
            $(`#${targetSectionId}`).fadeIn(200);

            // Trigger section-specific refresh event if available
            $(document).trigger(`section:shown:${targetSectionId}`);

            // On mobile screen, auto close sidebar after selection
            if (window.innerWidth < 992) {
                $('body').removeClass('sidebar-mobile-open');
            }
        });
    }

    static bindToggle() {
        $('#menu_btn').on('click', () => {
            if (window.innerWidth < 992) {
                $('body').toggleClass('sidebar-mobile-open');
            } else {
                $('body').toggleClass('sidebar-collapsed');
            }
        });
    }

    static bindLogout() {
        $('#logout_btn, #profile_logout_btn').on('click', (e) => {
            e.preventDefault();
            LoginController.logout();
        });
    }
}

