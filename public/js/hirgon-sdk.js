/* functions for interacting with the hirgon site
*/

async function addMessage(payload) {
    return await makeAPICall(`/api/message`, 'post', payload);
}

async function getMessage(message_id) {
    return await makeAPICall(`/api/message/${message_id}`, 'get');
}

async function editMessage(message_id, payload) {
    return await makeAPICall(`/api/message/${message_id}`, 'post', payload);
}

async function deleteMessage(message_id) {
    return await makeAPICall(`/api/message/${message_id}`, 'delete');
}

async function makeAPICall(endpoint, method, payload) {
    const requestUri = endpoint;

    let request = {
        method: method,
    };

    if (method === 'post') {
        request.headers = {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
