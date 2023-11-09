# Event Registration

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/bolte-17/coterie-event-registration?quickstart=1)

Toy project for Coterie Insurance application process.

Simulates a microservice for validating, storing, and retrieving event registrations.

## Development Environment
A [Development Container](https://containers.dev/) configuration is provided within the [/.devcontainer](.devcontainer) folder. Development Containers make use of Docker to containerize the development environment and reduce the need for manual configuration.

Visual Studio Code (via the recommended [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension) and Github Codespaces both support this format and should automatically detect the configuration.

The main application container is built using the typescript-node devcontainer image, as seen in the [Node.js and Typescript](https://github.com/devcontainers/templates/tree/main/src/typescript-node) template.

The development container also uses the Azure Cosmos Emulator as an associated docker-compose service.

### Environment Configuration
Environment variables along with the [dotenv](https://github.com/motdotla/dotenv) library are used to configure the environment. The provided [.env](.env) file has initial configuration that works for the devcontainer environment, and will need to be appropriately updated for a non-container development environment.

For development outside a development container, you will need to have the Azure Cosmos Emulator or an actual Azure Cosmos db available and update the `COSMOS_` environment values as is appropriate.

For a "production" deployment, dotenv prioritizes actual environment variables over any set in a file, so it is assumed that appropriate values will be set at time of deployment, notably including appropriately-secured secrets for the JWT key and the Cosmos DB key.

## Building

This project was developed with Node v20 and TypeScript. The Typescript compiler (tsc) is installed as a dev dependency along with other prerequisites. 

Install:
```sh
$ npm install
```

Build:
```sh
$ npm run build
```

Watch mode is available to automatically rebuild when changes to source files are saved:
```sh
$ npm run watch-ts
```

## Testing

[AVA](https://github.com/avajs/ava) is used as the test runner for this project, and will be installed as a dev dependency.

With prerequisites installed and project built, 
```sh
$ npm test
```

AVA also supports a watch mode to rerun tests upon source file changes, and a convenience alias is provided as an npm script:
```sh
$ npm run watch-test
```

## Running

With prerequisites installed and project built, start the node server:
```sh
$ npm start
```

For development purposes, watch mode can be useful to immediately rebuild and restart the server.

```sh
$ npm run watch
```

## Making Requests

As many of the requests expected by this application are not simple GET requests, the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for VSCode is recommended and provided within the dev container. This allows for the [requests.http](requests.http) file to provide for easy composition of requests with custom Authorization headers or POST bodies- basically a very simplified, in-editor [Postman](https://www.postman.com/) if you are familiar with that.

