# gRPC + TypeScript + Bazel + Web Example

This is an example/starter app that demonstrates how to use Bazel to combine:
- A Node.js gRPC server, in TypeScript
- A Node.js Express web server, in TypeScript
- A gRPC-web browser client, in TypeScript
- Bazel for building

## Why?

This example is the fruit of a frustrating journey through patchy documentation,
several alternatives with no guidance for choosing the most up-to-date, and so
on.

If you've had a similar experience trying to navigate the confused and rapidly
evolving world of using Bazel in the wild, this is a way to get started.

## Getting Started

You'll need Bazel installed. You're on your own for that part; there are good
distro packages and installers for Windows and Mac. (This sample probably won't
work on Windows, but let me know either way if you try it!)

Everything else, including installing Node and NPM tools, should be handled by
the Bazel workspace. So once you've got Bazel:

```
git clone https://github.com/shepheb/grpc-web-bazel-ts-example
cd grpc-web-bazel-ts-example
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

If you like, you can use `ibazel run` to make the fast-moving parts (the API
server and `ts_devserver` for the web) auto-reloading. The other components can
survive the others reloading underneath them.

## Architecture

The Express server in `//server` is trivial: it proxies all requests to the
ts_devserver. For production use, that could be replaced with statically serving
the prod mode, concatenated files.

The API server in `//api` is an interesting part you'll be expanding greatly,
of course to replace it all without your own APIs.

The API proxy at `//api:proxy` is pretty straightforward. It's a prebuilt binary
that translates gRPC-web requests for eg.
`http://localhost:5082/mypkg.MyService/SomeMethod` into gRPC TCP calls on
`localhost:5051`, the real `//api` server. Therefore that server doesn't need to
worry about API calls.

Be aware that the API proxy only supports unary (request/response) and
server-streaming methods, currently. Client streaming and duplex streaming are
not supported very well in gRPC-web.

The web code in `//web` shows how to include and use the generated proto files,
as well as the implicit dependencies needed by that generated code.

They are given the URL for the proxy server, currently, making a CORS request.

