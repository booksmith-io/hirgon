/* functions for interacting with the hirgon site
*/

async function add_message (payload) {
    return await make_api_call("/api/message", "post", payload);
}

async function get_message (message_id) {
    return await make_api_call(`/api/message/${message_id}`, "get");
}

async function edit_message (message_id, payload) {
    return await make_api_call(`/api/message/${message_id}`, "post", payload);
}

async function delete_message (message_id) {
    return await make_api_call(`/api/message/${message_id}`, "delete");
}

async function make_api_call (endpoint, method, payload) {
    const requestUri = endpoint;

    let csrf_token = "";
    const csrf_meta = document.querySelector("meta[name=\"csrf-token\"]");
    if (csrf_meta) {
        csrf_token = csrf_meta.getAttribute("content");
    } else {
        const csrf_input = document.querySelector("input[name=\"_csrf\"]");
        if (csrf_input) {
            csrf_token = csrf_input.value;
        }
    }

    let request = {
        method: method,
    };

    if (method === "post" || method === "delete") {
        request.headers = {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-CSRF-Token": csrf_token,
        };

        if (payload) {
            request.body = new URLSearchParams(payload);
        }
    }

    let response, body;
    try {
        response = await fetch(requestUri, request);

        if (response.body) {
            body = await response.text();
            if (body) {
                body = JSON.parse(body);
            }
        }
    } catch (error) {
        return [error];
    }

    return [response, body];
}
