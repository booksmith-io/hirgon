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

        let alert_message = 'Unable to add message';
        if (response[1]['message']) {
            alert_message = `${alert_message}: ${response[1]['message']}`;
        }

        error_message.innerHTML = alert_message;
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
                payload['active'] = 0;
            }
            else {
                payload['active'] = 1;
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
            e.preventDefault();

            const box_row = e.target.closest('div.box-row');
            const message_id = box_row.dataset.message_id;
            let alert_div = document.querySelector('#alert');

            let response = await getMessage(message_id);

            if ( response[0].ok !== true ) {
                alert_div.innerHTML = 'Unable to get message details';
                alert_div.classList.add('alert-danger');
                alert_div.classList.remove('d-none');

                return false;
            }

            let input_message_id = document.querySelector('#edit-message-form input#message_id');
            let input_name = document.querySelector('#edit-message-form input#name');
            let textarea_body = document.querySelector('#edit-message-form textarea#body');
            let schedule_div = document.querySelector(`#edit-message-form .schedule`);
            let input_schedule_date = document.querySelector(`#edit-message-form .schedule-date`);
            let input_schedule_time = document.querySelector(`#edit-message-form .schedule-time`);
            let input_active = document.querySelector('#edit-message-form input#active');

            // ensure we always start out with unset values since users can flip between messages
            // without submitting the form.
            input_schedule_date.value = '';
            input_schedule_time.value = '';

            input_message_id.value = message_id;
            input_name.value = response[1]['name'];
            textarea_body.innerHTML = response[1]['body'];

            if (response[1]['scheduled_at']) {
                [input_schedule_date.value, input_schedule_time.value] = response[1]['scheduled_at'].split(' ');
            }

            const ancestor = find_ancestor(input_active, 'modal');
            let id;
            if (ancestor) {
                id = ancestor.getAttribute('id');
            }

            if (response[1].active === 1) {
                input_active.checked = true;
                toggle_active(input_active, id);
            }
            else {
                input_active.checked = false;
                toggle_active(input_active, id);
            }

            const edit_message_modal = new bootstrap.Modal('#edit-message-modal', { "backdrop": true });
            edit_message_modal.show();

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

        let alert_message = 'Unable to update message';
        if (response[1]['message']) {
            alert_message = `${alert_message}: ${response[1]['message']}`;
        }

        alert_div.innerHTML = alert_message;
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

            let alert_message = 'Unable to delete message';
            if (response[1]['message']) {
                alert_message = `${alert_message}: ${response[1]['message']}`;
            }

            alert_div.innerHTML = alert_message;
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

    function find_ancestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    function toggle_active(button, parent_id) {
        let prefix = '';
        if (parent_id) {
            prefix = `#${parent_id} `;
        }

        const schedule_div = document.querySelector(`${prefix}.schedule`);
        const schedule_date_input = document.querySelector(`${prefix}.schedule-date`);
        const schedule_time_input = document.querySelector(`${prefix}.schedule-time`);

        const now_seconds = get_now_seconds();
        const now_top_of_hour = get_top_of_hour(now_seconds);
        const next_top_of_hour = get_top_of_next_hour(now_seconds);

        if ( button.checked ) {
            button.value = 1;
            schedule_div.classList.add('d-none');
            schedule_date_input.value = '';
            schedule_time_input.value = '';
        }
        else {
            button.value = '';
            schedule_div.classList.remove('d-none');
        }

        return;
    }

    document.querySelectorAll('#active').forEach( function(element) {
        element.addEventListener( 'change', function(e) {
            const button = e.target;
            const ancestor = find_ancestor(button, 'modal');
            let id;
            if (ancestor) {
                id = ancestor.getAttribute('id');
            }
            toggle_active(button, id);

            return;
        });
    });
});
