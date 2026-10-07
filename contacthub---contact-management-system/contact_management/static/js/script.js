/**
 * Contact Management System - Client-side JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Setup Delete Confirmation Modal dynamically
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            if (!button) return;
            
            const contactId = button.getAttribute('data-id');
            const contactName = button.getAttribute('data-name');
            
            const deleteContactNameElem = document.getElementById('deleteContactName');
            const deleteForm = document.getElementById('deleteForm');
            
            if (deleteContactNameElem && contactName) {
                deleteContactNameElem.textContent = contactName;
            }
            if (deleteForm && contactId) {
                deleteForm.setAttribute('action', '/delete/' + contactId);
            }
        });
    }

    // 2. Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 5000);
    });

    // 3. Simple phone input cleanup
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function () {
            // Trim whitespace
            this.value = this.value.trim();
        });
    }
});
