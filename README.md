# gRPC + TypeScript + Bazel + Web Example

This is an example/starter app that demonstrates how to use Bazel to combine:
- A Node.js Express web server, in TypeScript
- A Node.js gRPC server, in TypeScript
- A gRPC-web browser client, in TypeScript
- Bazel for building everything

## Why?

This example is the fruit of a frustrating journey through patchy documentation,
trying to choose between several alternatives with no guidance on which is the
most up-to-date, or which one works with the other components, and so on.

If you've had a similar experience trying to navigate the confused and rapidly
evolving world of using Bazel in the wild, this is a way to get started.

## Getting Started

You need Node and either NPM or Yarn installed initially.

Then you can `npm install` or `yarn install` in this directory, and then
`node_modules/.bin/bazel` will work as your `bazel` command.

If you like, you can install Bazel from a distro package, or globally install
Bazelisk using Node. It's a version manager like `nvm` for Node:

```
npm install -g @bazel/bazelisk
```

Then you have a global `bazel` command in your `PATH`.

This sample probably won't work on Windows, but let me know either way if you
try it!

Note that the Bazel configuration uses its own Node and NPM, not the host ones!
(You can customize that in the `WORKSPACE` file, but the default is the latest
LTS, which is usually fine.)

Everything else, including installing Node and NPM tools, should be handled by
the Bazel workspace. So once you've got Bazel:

```
git clone https://github.com/shepheb/grpc-web-bazel-ts-example
cd grpc-web-bazel-ts-example
yarn install    # or npm install
```

Then run each of these in separate terminals. The order shouldn't matter, though
the proxy server complains that it can't find the backend.

```
# Separate terminals
bazel run //api:dev
bazel run //api:proxy
bazel run //server:dev
bazel run //web:devserver
```

Then you should be able to point your browser at `http://localhost:5080` and see
the example page, which makes an RPC and posts the results in the JS console.

If you like, you can use `ibazel run` to make the fast-moving parts (the API
server and `ts_devserver` for the web) auto-reloading. The other components can
survive the others reloading underneath them.

## Architecture

Here's an overview of how the components fit together. Of these, the protobufs,
API server and web app are the "user code", while the Express server and API
proxy server are pretty generic, reusable components.

### Protocol buffers

These are defined in `proto/greeter.proto`, giving the service definitions.
`proto/BUILD.bazel` shows how to generate code from these protos for both the
Node.js server and the gRPC-web side.

### Express server

`//server:dev`, port 5080.

This server is just a frontend for routing.
- `/api/*` requests are proxied to the API proxy server on port 5082.
- Everything else goes to the ts_devserver on port 5081.

You could add your own Express handlers as necessary. Be careful that you don't
`app.use` middleware above the `/api` proxy that will interfere with it.

Otherwise, there should be little need to modify this component.

### API Proxy server

`//api:proxy`, port 5082

This is a prebuilt binary configured with flags, there's no code for it in this
example. This proxy translates between gRPC-web HTTP requests for
`/mypkg.MyService/SomeMethod` and backend gRPC calls.

Be aware that this proxy server only supports unary (request-response) and
server streaming gRPC methods. Client streaming and full-duplex streaming are
not well supported by gRPC-web generally, and not supported at all by this
proxy.

There should be little need to modify this component.

### API server

`//api:dev`, port 5051

This is a Node.js gRPC server for the services you've defined in `//proto`. This
is user code, part of your application, and one of the main places you'll be
writing new code.

See the note above about gRPC-web not supporting client or duplex streaming.

### Web code

`//web:devserver`, port 5081

This target is a `ts_devserver` that handles hot-reloading nicely when used with
`ibazel`.

`web/index.ts` shows how to import and use the gRPC-web generated code to make
RPCs to the backend.


## Using the Template

Quick guides to various tasks you might need to do.

### Adding Node.js dependencies

```
# Either:
yarn add some-npm-package       # Needed at runtime
yarn add -D some-npm-package    # Only needed at build time
```

The Node dependencies are managed by Bazel; once you declare the dependency with
the above commands,

