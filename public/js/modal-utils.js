/* modal-utils
   functions for managing modals
*/

// detect keydown on escape key to dismiss the modal if displayed
document.onkeydown = function (e) {
    e = e || window.event;
    let is_escape = false;
    if ("key" in e) {
        is_escape = (e.key === "Escape" || e.key === "Esc");
    }
    else {
        is_escape = (e.keyCode === 27);
    }
    if (is_escape) {
        const shown_modal = bootstrap.Modal.getInstance("div.modal.fade.show");
        if (shown_modal) {
            shown_modal.hide();
        }
    }
};
