class Http {
    /**
    * Constructor
    *
    */
    constructor(events) {
        this.events = events;
    }

    /**
     * Send GET request
     * 
     * @param string|object url
     * @param object data
     * @returns Promise
     */
    get(url, options = {}) {
        return this._optimize('GET', ...arguments);
    }

    /**
     * Send POST request
     * 
     * @param string|object url
     * @param object data
     * @returns Promise
     */
    post(url, data, options = {}) {
        options.data = data || {};
        return this._optimize('POST', url, options);
    }

    /**
     * Send PUT request
     * 
     * @param string|object url
     * @param object data
     * @returns Promise
     */
    put(url, data, options = {}) {
        options.data = data || {};
        return this._optimize('PUT', url, options);
    }

    /**
     * Send PATCH request
     * 
     * @param string|object url
     * @param object data
     * @returns Promise
     */
    patch(url, data, options = {}) {
        options.data = data || {};
        return this._optimize('PATCH', url, options);
    }

    /**
     * Send DELETE request
     * 
     * @param string|object url
     * @returns Promise
     */
    delete(url) {
        return this._optimize('DELETE', ...arguments);
    }

    /**
     * Optimize request then send it
     * 
     * @param string method
     * @param object url
     * @param object options
     */
    _optimize(method, url, options = {}) {
        options.url = url;
        options.method = method;
        return this.send(options);
    }

    /**
     * Send an http request 
     * 
     * @param object options
     * @returns jQUeryAjax
     */
    send(options) {
        options.method = (options.method || 'GET').toUpperCase();

        // if the given data is a jquery element
        // then we will assume it is a jquery form element

        // because PATCH and PUT requests don't accept form data
        // so it will be exclusively to POST request
        if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
            if (!Is.empty(options.data)) {
                if (Is.formElement(options.data[0])) {
                    options.data = options.data[0];
                }

                if (Is.formElement(options.data)) {
                    options.data = new FormData(options.data);
                }
            }

            if (Is.formData(options.data)) {
                options.cache = false;
                options.processData = false;
                options.contentType = false;
            }

            // a fix for sending form-data to back-end if the request method is PUT
            // as uploading files is not supported in the PUT requests
            if (options.method == 'PUT') {
                let uploadablePut = Object.get(options, 'uploadablePut', Config.get('http.uploadablePut', true));
                if (uploadablePut) {
                    options.method = 'POST';
                    if (Is.formData(options.data)) {
                        options.data.set('_method', 'PUT');
                    } else if (Is.plainObject(options.data)) {
                        options.data._method = 'PUT';
                    }
                }
            }
        }

        if (this.events.trigger('http.sending', options.url, options) === false) return;

        if (options.progress) {
            ajaxOptions.xhr = () => {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable && options.progress) {
                        var percentComplete = evt.loaded / evt.total;
                        /* Do something with upload progress here */
                        if (options.progress) {
                            options.progress(percentComplete);
                        }
                    }
                }, false);
                return xhr;
            };
        }

        let jqXHR = $.ajax(options);

        return new Promise((resolve, reject) => {
            jqXHR.then((response, statusText, xhr) => {
                let finalResponse = this.getResponseOf(response, xhr);
                if (this.events.trigger('http.done', finalResponse, options) === false) return;
                resolve(finalResponse);
            }).catch(xhr => {
                let response = xhr.responseJSON || xhr.responseText;
                let finalResponse = this.getResponseOf(response, xhr);

                if (this.events.trigger('http.done', finalResponse, options) === false) return;

                reject(finalResponse);
            });
        });
    }

    /**
     * Get the final response for the given response and xhr object
     * 
     * @param   object|string response
     * @param   object xhr
     * @returns object
     */
    getResponseOf(response, xhr) {
        let finalResponse = {
            xhr,
            body: response,
            statusCode: xhr.status,
            statusText: xhr.statusText,
            originalResponse: response,
        };

        if (Is.object(response)) {
            finalResponse = Object.merge(finalResponse, response);
        }

        return finalResponse;
    }
}

DI.register({
    class: Http,
    alias: 'http',
});