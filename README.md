# NodeJS JWT Authentication sample

This is a NodeJS API that supports username and password authentication with JWTs.


## Available APIs

### User APIs

#### POST `/register`

You can do a POST to `/register` to create a new user.


The body must have:

* `email`: The email
* `password`: The password

It returns the following:

```json
{
  "message": "Success message Or Error message",
}
```

The `message` will depend on the execution if the email already exists, it will be an error message otherwise it will tell you that the registration was successful and that you will have to confirm it with the confirmation email.


#### POST `/login`

You can do a POST to `/login` to log.


The body must have:

* `email`: The email
* `password`: The password

It returns the following:

```json
{
  "access_token": {jwt},
  "refresh_token": {jwt},
}
```

#### GET `/verify/:token`

You can do a GET to `/verify/:token` to confirm your registration.

It returns the following:

```json
{
  "access_token": {jwt},
  "refresh_token": {jwt},
  "message": "success message",
}
```

#### GET `/refreshToken`

You can do a GET to `/refreshToken` to refresh your access token.

The JWT - `refresh_token` must be sent on the `Authorization` header as follows: `Authorization: Bearer {jwt}`

It returns the following:

```json
{
  "access_token": {jwt}
}
```

## Running it

Just clone the repository, run `npm install` and then `node server.js`. That's it :).


## Issue Reporting

If you have found a bug or if you have a feature request, please contact me. 


## Author

[MAOUCHE Yacine](https://github.com/maouche)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.