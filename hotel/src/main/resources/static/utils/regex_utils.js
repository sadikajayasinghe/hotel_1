/**
 * Regex Validation Patterns and Helpers for Hotel Lanka
 */

export const REGEX_PATTERNS = {
    // 3 to 50 alphabetic characters & spaces
    NAME: /^[A-Za-z\s]{3,50}$/,

    // Standard email pattern
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

    // Sri Lankan mobile: 07XXXXXXXX, +947XXXXXXXX, 947XXXXXXXX
    PHONE: /^(?:0|94|\+94)?7[0-9]{8}$/,

    // Sri Lankan NIC: 9 digits + V/v/X/x (old) or 12 digits (new)
    NIC: /^([0-9]{9}[vVxX]|[0-9]{12})$/,

    // Address: minimum 5 characters
    ADDRESS: /^[A-Za-z0-9\s,./#'-]{5,100}$/,

    // Room Number: e.g., 101, 204, R-101
    ROOM_NUMBER: /^[A-Za-z0-9-]{1,10}$/,

    // Positive currency / price: e.g. 15000 or 15000.00
    PRICE: /^[0-9]+(\.[0-9]{1,2})?$/,

    // Positive integer
    INTEGER: /^[1-9][0-9]*$/
};

/**
 * Validate a specific value against a regex pattern
 * @param {string} value 
 * @param {RegExp} pattern 
 * @returns {boolean}
 */
export function isValid(value, pattern) {
    if (!value || typeof value !== 'string') return false;
    return pattern.test(value.trim());
}

/**
 * Apply live validation styling to an input element
 * @param {jQuery|string} inputSelector 
 * @param {RegExp} pattern 
 * @param {string} errorSelector 
 * @param {string} errorMsg 
 * @returns {boolean}
 */
export function validateInput(inputSelector, pattern, errorSelector, errorMsg) {
    const $input = $(inputSelector);
    const $error = $(errorSelector);
    const value = $input.val() ? $input.val().trim() : '';

    if (!pattern.test(value)) {
        $input.addClass('is-invalid').removeClass('is-valid');
        if ($error.length) {
            $error.text(errorMsg).show();
        }
        return false;
    } else {
        $input.addClass('is-valid').removeClass('is-invalid');
        if ($error.length) {
            $error.text('').hide();
        }
        return true;
    }
}

/**
 * Reset input validation styling
 * @param {jQuery|string} formSelector 
 */
export function resetValidation(formSelector) {
    const $form = $(formSelector);
    $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    $form.find('.invalid-feedback').text('').hide();
}

