/* functionality for interacting with the messages
*/

$(function() {
    document.querySelector('#add-message-modal form#add-message-form').addEventListener( 'submit', async function(e) {
        e.preventDefault();

        let form = $(this);
        let form_inputs = $(this).serializeArray();

        let payload = {};
        form_inputs.forEach( function(value) {
            payload[value.name] = value.value;
        });

        let response = await addMessage(payload);

        const form_id = form[0].id;
        let name_input = document.querySelector(`#${form_id} #name`);
        let body_input = document.querySelector(`#${form_id} #body`);
        let active_input = document.querySelector(`#${form_id} #active`);

        const add_message_modal = bootstrap.Modal.getInstance('#add-message-modal');
        const error_modal = new bootstrap.Modal('#error-modal', { "backdrop": true });
        let error_message = document.querySelector(`#error-message`);

        add_message_modal.hide();
        form[0].reset();
        name_input.value = '';
        body_input = '';
        active_input = '';

        if ( response[0].ok === true ) {
            location.reload();
        }
        else {
            error_message.innerHTML = response[1].message;
            error_modal.show();
        }

        return;
    });

    document.querySelectorAll('a.delete-message').forEach( function(element) {
        element.addEventListener( 'click', async function(e) {
            e.preventDefault();

            const box_row = e.target.closest('div.box-row');
            const message_id = box_row.dataset.message_id;
            let alert_div =  document.querySelector('#alert');

            let response = await deleteMessage(message_id);
            if ( response[0].ok === true ) {
                location.reload();
            }
            else {
                if (response[1].message) {
                    alert_div.innerHTML = response[1].message;
                }
                else {
                    alert_div.innerHTML = 'Unable to delete message';
                }
                alert_div.classList.add('alert-danger');
                alert_div.classList.remove('d-none');
            }

            return;
        });
    });
});
