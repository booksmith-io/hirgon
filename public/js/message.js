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

        let name_input = document.querySelector('form#add-message-form #name');
        let body_input = document.querySelector('form#add-message-form #body');
        let active_input = document.querySelector('form#add-message-form #active');

        const add_message_modal = bootstrap.Modal.getInstance('#add-message-modal');
        const error_modal = new bootstrap.Modal('#error-modal', { "backdrop": true });
        let error_message = document.querySelector('#error-message');

        add_message_modal.hide();
        form[0].reset();
        name_input.value = '';
        body_input.innerHTML = '';
        active_input.checked = false;

        if ( response[0].ok === true ) {
            location.reload();
            return;
        }

        error_message.innerHTML = response[1].message;
        error_modal.show();

        return;
    });

    document.querySelectorAll('a.set-message-active').forEach( function(element) {
        element.addEventListener( 'click', async function(e) {
            e.preventDefault();

            const action = e.target.dataset.action;
            const box_row = e.target.closest('div.box-row');
            const message_id = box_row.dataset.message_id;
            let alert_div =  document.querySelector('#alert');

            let payload = {};
            if (action === 'inactive') {
                payload['active'] = false;
            }
            else {
                payload['active'] = true;
            }

            let response = await editMessage(message_id, payload);
            if ( response[0].ok === true ) {
                location.reload();
                return;
            }

            alert_div.innerHTML = 'Unable to set message ' + action;
            alert_div.classList.add('alert-danger');
            alert_div.classList.remove('d-none');

            return;
        });
    });

    document.querySelectorAll('a.edit-message').forEach( function(element) {
        element.addEventListener( 'click', async function(e) {
            const box_row = e.target.closest('div.box-row');
            const message_id = box_row.dataset.message_id;
            let alert_div = document.querySelector('#alert');

            let response = await getMessage(message_id);
            if ( response[0].ok !== true ) {
                alert_div.innerHTML = 'Unable to get message details';
                alert_div.classList.add('alert-danger');
                alert_div.classList.remove('d-none');
            }

            let input_message_id = document.querySelector('#edit-message-form input#message_id');
            let input_name = document.querySelector('#edit-message-form input#name');
            let textarea_body = document.querySelector('#edit-message-form textarea#body');
            let input_active = document.querySelector('#edit-message-form input#active');

            input_message_id.value = message_id;
            input_name.value = response[1]['name'];
            textarea_body.innerHTML = response[1]['body'];
            if (response[1].active) {
                input_active.checked = true;
            }
            else {
                input_active.checked = false;
            }

            return;
        });
    });

    document.querySelector('#edit-message-modal form#edit-message-form').addEventListener( 'submit', async function(e) {
        e.preventDefault();

        let form = $(this);
        const message_id = document.querySelector('form#edit-message-form #message_id').value;
        let form_inputs = $(this).serializeArray();
        const edit_message_modal = bootstrap.Modal.getInstance('#edit-message-modal');
        let alert_div =  document.querySelector('#alert');

        let payload = {};
        form_inputs.forEach( function(value) {
            payload[value.name] = value.value;
        });

        let response = await editMessage(message_id, payload);
        if ( response[0].ok === true ) {
            location.reload();
            return;
        }

        alert_div.innerHTML = 'Unable to update message';
        alert_div.classList.add('alert-danger');
        alert_div.classList.remove('d-none');

        let input_name = document.querySelector('form#edit-message-form #name');
        let input_body = document.querySelector('form#edit-message-form #body');
        let input_active = document.querySelector('form#edit-message-form #active');

        edit_message_modal.hide();
        form[0].reset();
        input_name.value = '';
        input_body = '';
        input_active = '';

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
                return;
            }

            alert_div.innerHTML = 'Unable to delete message';
            alert_div.classList.add('alert-danger');
            alert_div.classList.remove('d-none');

            return;
        });
    });

    document.querySelectorAll('div.toggle_truncate').forEach( function(element) {
        element.addEventListener( 'click', function(e) {
            let div_body = e.target;
            div_body.classList.toggle('ellipsis');
        });
    });
});
