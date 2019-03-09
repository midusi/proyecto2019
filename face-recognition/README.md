# Face Recognition

This project was bootstrapped with [ReactReduxWebpackStarter](https://github.com/ulises-jeremias/react-redux-webpack-starter). You can read the following [documentation](https://github.com/ulises-jeremias/react-redux-webpack-starter/blob/master/README.md) to learn more about how to prepare the development environment.

## Quickstart

### Requirements

The following software is required to be installed on your system:

-   Node v10.x
-   Yarn v1.7.0 or later

Type the following commands in the terminal to verify your `node` and `yarn` versions:

$ node -v
$ yarn -v

### Install dependencies

```bash
$ git clone git@github.com:midusi/proyecto2019.git
$ cd proyecto2019
$ yarn # or `npm install`
```

### Development

After confirming that your environment meets the above [requirements](#requirements),
you can run the application in localhost on port 8091 by running the following commands:

```bash
$ yarn start # Start the development server (or `npm run start`)
```

### Using Docker

#### Generación de las imágenes docker

_Note: It is recommended to add your user to the docker group to avoid the need to run docker with sudo. This can be done by running:_

```bash
$ sudo usermod -a -G docker $USER
```

You can run the application in development mode by executing the following commands:

```bash
$ yarn docker:build
$ yarn docker:start
```
