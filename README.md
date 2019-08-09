# Http

This package provides a simple interface to handle `Ajax` requests for `Falak JS` framework.

# Installation
`flk install flk-http`

OR 

Alias: `http`.

> This package is automatically installed once you create new workspace so you don't need to install it.


# Configurations 

All `http` configurations in `config.js` file are under `http` namespace.

# Usage

As mentioned earlier, this package is responsible for sending ajax requests with a simple layout for usage.

# send
`send(options: object): Promise`

Send ajax request based on the given options.


## Options 

These options are applied in `send` or any `shorthand` method except `url`, `data`, and `method` as it is based on the `shorthand` method.

| Key           | Type       | Default | Configuration key | Required | Description                                                                                                                                                                                                                                                                                             |
| ------------- | ---------- | ------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url           | `string`   | `N/a`   | `N/a`             | `true`   | The request url.                                                                                                                                                                                                                                                                                        |
| method        | `string`   | `N/a`   | `N/a`             | `true`   | The request method, It could be `GET`, `POST`, `PATCH`, `DELETE`, `PUT` OR `OPTIONS`.                                                                                                                                                                                                                   |
| datatype      | `string`   | `auto`  | `N/a`             | `false`  | Set the expecting response type, `json`, `html`, `xml`, `text`, default to `auto` which will try to guess the type of the response and act accordingly.                                                                                                                                                 |
| data          | `string`   | `N/a`   | `N/a`             | `false`  | The request body data., this could be a `plain object`, a `HTMLFormElement` object, a `FormData` object or a `query string`.                                                                                                                                                                            |
| headers       | `object`   | `N/a`   | `N/a`             | `false`  | Set request headers.                                                                                                                                                                                                                                                                                    |
| progress      | `Function` | `N/a`   | `N/a`             | `false`  | A callback function can be passed to `progress` key to see the request progress, value in `percentage`.                                                                                                                                                                                                 |
| uploadablePut | `boolean`  | `true`  | `uploadablePut`   | `false`  | Set it to true if you've a `PUT` request with files to be uploaded, this will convert the request to `POST` request and add a `_method` key to the body with a `PUT` as a workaround, default to `true`. [More details here](https://github.com/laravel/framework/issues/13457#issuecomment-239451567). |

# Response output

As any request returns a `Promise` object, the response of any request in `then` or `catch` methods are:

- **statusCode** `integer`: Response status code.
- **statusText** `string`: Response status text.
- **xhr** `object`: XHR object.
- **body** `any`: Response body, if response is in `json` format, so it will automatically converted to object.

So the final schema of the response object will be:

```json
{
  "statusCode": "integer",
  "statusText": "text",
  "xhr": "object",
  "body": "any"
}
```

### Example

```js
let http = DI.resolve('http');

http.send({
  url: 'https://sitename.com',
}).then(response => {
  //  do something with response 
  console.log(response.statusCode); // 200
});
```

### Json Responses
For the `JSON` responses, There's a special case here as the `Response` object will merge the `Request response keys` with it.

For example if the coming response from the request is something like:

```json
{
  "user": {
    "id": 513124583,
    "name": "John Doe",
    "email": "foo@bar.com"
  }
}
```

Then the `user` key will be automatically used directly from the `Response` object.

### Example

```js
let http = DI.resolve('http');

http.send({
  url: 'https://sitename.com/get/1',
}).then(response => {
  // if the response is request is an object, all keys will be automatically used form the `response` object
  //  do something with response 
  console.log(response.user); // {"id": 513124583,"name": "John Doe","email":"foo@bar.com"}

  // to get the entire response body
  console.log(response.body);
});
```

# get
`get(url: string, options: object): Promise`

Send a `GET` request to the given url.

This is a shorthand method to send `GET` request to the given url.

### Example

```js
let http = DI.resolve('http');

http.get('https://sitename.com').then(response => {
  //  do something with response 
});

```

# post
`post(url: string, data: string|object|FormData|HTMLFormElement, options: object): Promise`

Send a `POST` request to the given url.

You can pass any type of previously mentioned data.

### Example

```js
let http = DI.resolve('http');

http.post('https://sitename.com/login', {
  email: 'foo@ar.com',
  password: '123456',
}).then(response => {
  //  do something with response 
});

```

# put
`put(url: string, data: string|object|FormData|HTMLFormElement, options: object): Promise`

Send a `PUT` request to the given url.

You can pass any type of previously mentioned data.

> If the data contains a file, the request method will automatically be converted to `POST` request with additional request body `_method=POST`, this behavior is acceptable at most popular backend frameworks like **Laravel**, you can override this behavior by setting in third argument `uploadablePut` to **false**. 

### Example

```js
let http = DI.resolve('http');

http.put('https://sitename.com/users/12', document.getElementById('update-form')).then(response => {
  //  do something with response 
});
```

# patch
`patch(url: string, data: string|object|FormData|HTMLFormElement, options: object): Promise`

Send a `PATCH` request to the given url.

### Example

```js
let http = DI.resolve('http');

http.patch('https://sitename.com/users/12/activate').then(response => {
  //  do something with response 
});
```

# options
`options(url: string options: object): Promise`

Send a `OPTIONS` request to the given url.

### Example

```js
let http = DI.resolve('http');

http.options('https://sitename.com').then(response => {
  //  do something with response 
});
```

# Events

The `Http` handler triggers events for various positions.

## Before sending request

Event name: `http.sending`

This event is triggered exactly before sending the ajax request.

The callback function accepts two arguments, request `url` and [Request Options](#options).
```js

let events = DI.resolve('events');

events.on('http.sending', (url, options) => {
  // do something before sending
});
```

> if any callback returns `false` the request **won't be sent**.

## On Response back

Event name: `http.done`

This event is triggered when the response is returned back, on `success` or `failure`.

The callback function accepts two arguments, The [Response object](#response-output) and [Request Options](#options).

```js

let events = DI.resolve('events');

events.on('http.done', (response, options) => {
  if (response.statusCode == 200) {
    // success response
  }
});
```
