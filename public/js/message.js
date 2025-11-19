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

        if ( response[0].ok ) {
            const add_message_modal = bootstrap.Modal.getInstance('#add-message-modal');
            add_message_modal.hide();

            form[0].reset();
            const form_id = form[0].id;
            let name_input = document.querySelector(`#${form_id} #name`);
            let body_input = document.querySelector(`#${form_id} #body`);
            let active_input = document.querySelector(`#${form_id} #active`);
            name_input.value = '';
            body_input = '';
            active_input = '';

            location.reload();
        }
        else {
            // TODO: do something better with the error so the user knows what's wrong
            console.log(response);
        }

        return;
    });
});
