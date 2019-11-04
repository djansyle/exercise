# exercise

## Run the test

`npm install && HTTP_PORT=8000 npm test`

When running the test make sure that the `service` bounded port and the and test `HTTP_PORT` does not clash.

## Build and Run the server

Make sure that the file `build.sh` is executable.

Then execute the command.
`./build && docker run -p 8000:80 exercise`

It should show log that the server is running at port `80`.

## Running the client

Make sure that you have already installed the dependencies with `npm install`.

Then you can execute the client by:
`ENDPOINT=<service endpoint> ./node_modules/.bin/ts-node client.ts`

`service endpoint` is something like `http://localhost:8000/graphql`
