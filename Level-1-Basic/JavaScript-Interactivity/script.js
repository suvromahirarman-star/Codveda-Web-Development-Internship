/**
 * ==============================================================================
 * JAVASCRIPT LAB — INTERACTIVE PLAYGROUND
 * Author: Codveda Web Development Intern
 * Track: Level 1 — Task 2: Introduction to JavaScript
 *
 * Core Objectives Covered:
 * 1. Interactive Elements (Accessible Dropdown, Modal Dialog, Validated Form)
 * 2. Event Listeners & Functions (click, input, keydown, submit)
 * 3. Client-Side Input Validation (regex, lengths, matching, aria states)
 * 4. DOM Manipulation & Accessible Focus Management
 * ==============================================================================
 */

'use strict';

// Ensure all script logic executes safely once the DOM document is ready
document.addEventListener('DOMContentLoaded', () => {
  initDropdownStation();
  initModalStation();
  initFormValidationStation();
  initEventDemosStation();
});

/* ==============================================================================
   STATION 1: ACCESSIBLE DROPDOWN MENU
   Concepts: DOM Selection, Event Listeners, ARIA Toggling, Outside Click, Escape Key
   ============================================================================== */
function initDropdownStation() {
  const dropdownWrapper = document.getElementById('dropdown-component');
  const triggerBtn = document.getElementById('dropdown-trigger');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const dropdownLabel = document.getElementById('dropdown-label');
  const dropdownOutput = document.getElementById('dropdown-output');
  const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');

  if (!dropdownWrapper || !triggerBtn || !dropdownMenu) return;

  /**
   * Opens the dropdown menu and updates accessibility attributes.
   */
  function openDropdown() {
    dropdownMenu.removeAttribute('hidden');
    triggerBtn.setAttribute('aria-expanded', 'true');
    // Set focus to the first item for convenient keyboard navigation
    if (menuItems.length > 0) {
      menuItems[0].focus();
    }
  }

  /**
   * Closes the dropdown menu and updates accessibility attributes.
   */
  function closeDropdown() {
    dropdownMenu.setAttribute('hidden', '');
    triggerBtn.setAttribute('aria-expanded', 'false');
  }

  /**
   * Toggles menu state between open and closed.
   */
  function toggleDropdown() {
    const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  // 1. Toggle when the trigger button is clicked
  triggerBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  // 2. Select an option when a menu item is clicked
  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const selectedValue = item.getAttribute('data-value') || item.textContent.trim();

      // Update UI button label and feedback console
      dropdownLabel.textContent = selectedValue;
      dropdownOutput.textContent = `Selected: "${selectedValue}" (Action dispatched)`;

      closeDropdown();
      // Return focus back to trigger button
      triggerBtn.focus();
    });

    // Support keyboard Arrow navigation inside the dropdown
    item.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex].focus();
      }
    });
  });

  // 3. Close the dropdown if the user clicks anywhere outside the component
  document.addEventListener('click', (event) => {
    const isClickInside = dropdownWrapper.contains(event.target);
    const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';

    if (!isClickInside && isExpanded) {
      closeDropdown();
    }
  });

  // 4. Close the dropdown if the user presses the 'Escape' key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && triggerBtn.getAttribute('aria-expanded') === 'true') {
      closeDropdown();
      triggerBtn.focus();
    }
  });
}

/* ==============================================================================
   STATION 2: ACCESSIBLE MODAL DIALOG
   Concepts: Modal Overlay, Focus Trapping, Focus Restoration, Event Bubbling, Escape Key
   ============================================================================== */
function initModalStation() {
  const openModalBtn = document.getElementById('modal-open-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalWindow = document.getElementById('modal-window');
  const closeModalIcon = document.getElementById('modal-close-icon');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalStatusOutput = document.getElementById('modal-status-output');

  if (!openModalBtn || !modalBackdrop || !modalWindow) return;

  // Track the previously focused element to restore focus upon closing
  let previouslyFocusedElement = null;

  /**
   * Opens the modal dialog and traps focus.
   */
  function openModal() {
    previouslyFocusedElement = document.activeElement;
    modalBackdrop.removeAttribute('hidden');

    // Prevent background scrolling while the modal is open
    document.body.style.overflow = 'hidden';

    // Transfer focus to the first interactive element inside the modal
    closeModalIcon.focus();

    modalStatusOutput.textContent = 'Modal is open (Keyboard focus captured).';
  }

  /**
   * Closes the modal dialog and restores focus to the opener element.
   * @param {string} feedbackMessage - Descriptive feedback message
   */
  function closeModal(feedbackMessage) {
    modalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';

    modalStatusOutput.textContent = feedbackMessage || 'Modal closed.';

    // Restore focus to the element that triggered the modal
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  }

  // 1. Open modal on button click
  openModalBtn.addEventListener('click', () => {
    openModal();
  });

  // 2. Close modal via the top-right close icon
  closeModalIcon.addEventListener('click', () => {
    closeModal('Closed via top close icon (Focus restored).');
  });

  // 3. Close modal via action buttons
  modalCancelBtn.addEventListener('click', () => {
    closeModal('Dismissed via Cancel button.');
  });

  modalConfirmBtn.addEventListener('click', () => {
    closeModal('Confirmed sample action successfully.');
  });

  // 4. Close modal if user clicks on the darkened backdrop (outside the window)
  modalBackdrop.addEventListener('click', (event) => {
    // Only close if the click originated on the backdrop itself, not inside modalWindow
    if (event.target === modalBackdrop) {
      closeModal('Dismissed by clicking backdrop.');
    }
  });

  // 5. Handle Keyboard Trap & Escape Key inside Modal
  modalBackdrop.addEventListener('keydown', (event) => {
    // Check for Escape key
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal('Dismissed via Escape key.');
      return;
    }

    // Trap focus inside modal on Tab key
    if (event.key === 'Tab') {
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(modalWindow.querySelectorAll(focusableSelectors));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (Backward)
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (Forward)
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

/* ==============================================================================
   STATION 3: CLIENT-SIDE FORM VALIDATION
   Concepts: e.preventDefault(), Regex Testing, Form Controls, Dynamic Error Displays,
             ARIA Invalid States, Secure Memory Clearing
   ============================================================================== */
function initFormValidationStation() {
  const form = document.getElementById('registration-form');
  const nameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError = document.getElementById('confirm-error');

  const successBanner = document.getElementById('form-success-banner');
  const successDetails = document.getElementById('form-success-details');

  if (!form || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;

  /**
   * Helper: Displays an error message for an input and sets aria-invalid="true".
   */
  function showError(inputElement, errorElement, message) {
    inputElement.classList.add('is-invalid');
    inputElement.classList.remove('is-valid');
    inputElement.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
  }

  /**
   * Helper: Clears error styles and marks an input as valid.
   */
  function showValid(inputElement, errorElement) {
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    inputElement.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
  }

  /**
   * Helper: Resets input state back to initial neutral appearance.
   */
  function resetFieldState(inputElement, errorElement) {
    inputElement.classList.remove('is-invalid', 'is-valid');
    inputElement.removeAttribute('aria-invalid');
    errorElement.textContent = '';
  }

  /**
   * Validates Full Name field.
   * Rule: Required and at least 2 characters long.
   */
  function validateName() {
    const value = nameInput.value.trim();
    if (value === '') {
      showError(nameInput, nameError, 'Full name is required.');
      return false;
    }
    if (value.length < 2) {
      showError(nameInput, nameError, 'Full name must be at least 2 characters.');
      return false;
    }
    showValid(nameInput, nameError);
    return true;
  }

  /**
   * Validates Email Address field.
   * Rule: Required and matches standard email format.
   */
  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === '') {
      showError(emailInput, emailError, 'Email address is required.');
      return false;
    }
    if (!emailRegex.test(value)) {
      showError(emailInput, emailError, 'Please enter a valid email format (e.g. user@domain.com).');
      return false;
    }
    showValid(emailInput, emailError);
    return true;
  }

  /**
   * Validates Password field.
   * Rule: Required, at least 8 characters, and contains at least 1 number.
   */
  function validatePassword() {
    const value = passwordInput.value;
    if (value === '') {
      showError(passwordInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      showError(passwordInput, passwordError, 'Password must be at least 8 characters long.');
      return false;
    }
    if (!/\d/.test(value)) {
      showError(passwordInput, passwordError, 'Password must contain at least one number (0-9).');
      return false;
    }
    showValid(passwordInput, passwordError);

    // If confirm password has text, re-validate it against new password
    if (confirmPasswordInput.value.length > 0) {
      validateConfirmPassword();
    }
    return true;
  }

  /**
   * Validates Confirm Password field.
   * Rule: Required and must match password field exactly.
   */
  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    if (value === '') {
      showError(confirmPasswordInput, confirmError, 'Please confirm your password.');
      return false;
    }
    if (value !== passwordInput.value) {
      showError(confirmPasswordInput, confirmError, 'Passwords do not match.');
      return false;
    }
    showValid(confirmPasswordInput, confirmError);
    return true;
  }

  // Real-time input event listeners: clear errors dynamically as the user types
  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('is-invalid')) validateName();
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('is-invalid')) validateEmail();
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('is-invalid')) validatePassword();
  });

  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.classList.contains('is-invalid')) validateConfirmPassword();
  });

  // Handle Form Submission
  form.addEventListener('submit', (event) => {
    // Crucial: Prevent default browser behavior (page reload/navigation)
    event.preventDefault();

    // Run all validations
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();

    const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid;

    if (!isFormValid) {
      // Hide success banner if any error exists
      successBanner.setAttribute('hidden', '');

      // Focus the first invalid input for accessibility
      const firstInvalid = form.querySelector('.form-input.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // All validation passed: Show success feedback
    successDetails.textContent = `Registered user: "${nameInput.value.trim()}" (${emailInput.value.trim()}). Local verification succeeded!`;
    successBanner.removeAttribute('hidden');

    // Security practice: wipe sensitive password fields immediately from memory
    passwordInput.value = '';
    confirmPasswordInput.value = '';
    resetFieldState(passwordInput, passwordError);
    resetFieldState(confirmPasswordInput, confirmError);

    // Scroll to success banner smoothly
    successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Handle Form Reset
  form.addEventListener('reset', () => {
    successBanner.setAttribute('hidden', '');
    resetFieldState(nameInput, nameError);
    resetFieldState(emailInput, emailError);
    resetFieldState(passwordInput, passwordError);
    resetFieldState(confirmPasswordInput, confirmError);
  });
}

/* ==============================================================================
   STATION 4: ADDITIONAL EVENT LISTENERS & STATE DEMOS
   Concepts: input events, length computation, class toggling, state counters
   ============================================================================== */
function initEventDemosStation() {
  // Feature A: Live Character Counter
  const textarea = document.getElementById('feedback-text');
  const remainingText = document.getElementById('char-remaining-text');
  const countBadge = document.getElementById('char-count-badge');
  const maxLimit = 120;

  if (textarea && remainingText && countBadge) {
    textarea.addEventListener('input', () => {
      const currentLength = textarea.value.length;
      const remaining = maxLimit - currentLength;

      // Update remaining text and count badge
      remainingText.innerHTML = `Remaining: <strong>${remaining}</strong> characters`;
      countBadge.textContent = `${currentLength} / ${maxLimit}`;

      // Highlight when nearing capacity
      if (remaining <= 15) {
        countBadge.classList.add('limit-reached');
      } else {
        countBadge.classList.remove('limit-reached');
      }
    });
  }

  // Feature B: Interactive State Counter
  const counterDisplay = document.getElementById('counter-display');
  const decrementBtn = document.getElementById('counter-decrement');
  const incrementBtn = document.getElementById('counter-increment');
  const resetBtn = document.getElementById('counter-reset');
  const statusText = document.getElementById('counter-status-text');

  if (counterDisplay && decrementBtn && incrementBtn && resetBtn && statusText) {
    let count = 0; // Local state variable

    function updateCounterDisplay() {
      counterDisplay.textContent = count;

      if (count > 0) {
        statusText.textContent = `Current state: Positive (+${count})`;
        statusText.style.color = 'var(--accent-primary)';
      } else if (count < 0) {
        statusText.textContent = `Current state: Negative (${count})`;
        statusText.style.color = 'var(--color-error)';
      } else {
        statusText.textContent = 'Current state: Neutral (0)';
        statusText.style.color = 'var(--text-muted)';
      }
    }

    incrementBtn.addEventListener('click', () => {
      count += 1;
      updateCounterDisplay();
    });

    decrementBtn.addEventListener('click', () => {
      count -= 1;
      updateCounterDisplay();
    });

    resetBtn.addEventListener('click', () => {
      count = 0;
      updateCounterDisplay();
    });
  }
}

