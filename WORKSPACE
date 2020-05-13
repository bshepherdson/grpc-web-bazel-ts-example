workspace(
    # How this workspace would be referenced with absolute labels from another workspace
    name = "tpt",
    # Map the @npm bazel workspace to the node_modules directory.
    # This lets Bazel use the same node_modules as other local tooling.
    managed_directories = {"@npm": ["node_modules"]},
)

# Top-level setup
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

http_archive(
    name = "build_bazel_rules_nodejs",
    urls = [
        "https://github.com/bazelbuild/rules_nodejs/releases/download/1.6.1/rules_nodejs-1.6.1.tar.gz",
        #"https://github.com/bazelbuild/rules_nodejs/archive/9428fc47ce7701c3b000435d40c1351491635aa6.zip",
    ],
    #strip_prefix = "rules_nodejs-9428fc47ce7701c3b000435d40c1351491635aa6",
)

# Node version is the default
load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    package_json = ["//:package.json"],
    #node_version = "12.13.0",
)

# Dependencies: Bazel-managed by Yarn
yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Install any Bazel rules which were extracted earlier by the yarn_install rule.
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

# TypeScript toolchain
load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")

ts_setup_workspace()

# Experimental: rules-proto-grpc!
# Apparently I have to hand-include the Closure libraries for @bazel/labs?
http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "7d206c2383811f378a5ef03f4aacbcf5f47fd8650f6abbc3fa89f3a27dd8b176",
    strip_prefix = "rules_closure-0.10.0",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_closure/archive/0.10.0.tar.gz",
        "https://github.com/bazelbuild/rules_closure/archive/0.10.0.tar.gz",
    ],
)

load("@io_bazel_rules_closure//closure:repositories.bzl", "rules_closure_dependencies", "rules_closure_toolchains")

rules_closure_dependencies()

rules_closure_toolchains()

# Base proto rules
http_archive(
    name = "rules_proto",
    sha256 = "602e7161d9195e50246177e7c55b2f39950a9cf7366f74ed5f22fd45750cd208",
    strip_prefix = "rules_proto-97d8af4dc474595af3900dd85cb3a29ad28cc313",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_proto/archive/97d8af4dc474595af3900dd85cb3a29ad28cc313.tar.gz",
        "https://github.com/bazelbuild/rules_proto/archive/97d8af4dc474595af3900dd85cb3a29ad28cc313.tar.gz",
    ],
)

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

# @bazel/labs ts_proto_library
load("@npm_bazel_labs//:package.bzl", "npm_bazel_labs_dependencies")

npm_bazel_labs_dependencies()

# gRPC proto rules
http_archive(
    name = "rules_proto_grpc",
    urls = ["https://github.com/rules-proto-grpc/rules_proto_grpc/archive/1.0.2.tar.gz"],
    sha256 = "5f0f2fc0199810c65a2de148a52ba0aff14d631d4e8202f41aff6a9d590a471b",
    strip_prefix = "rules_proto_grpc-1.0.2",
)

load("@rules_proto_grpc//:repositories.bzl", "rules_proto_grpc_toolchains", "rules_proto_grpc_repos")

rules_proto_grpc_toolchains()

rules_proto_grpc_repos()

# Needed for the gRPC-web parts
load(
    "@rules_proto_grpc//github.com/grpc/grpc-web:repositories.bzl",
    rules_proto_grpc_grpc_web_repos = "grpc_web_repos",
)

rules_proto_grpc_grpc_web_repos()

load(
    "@io_bazel_rules_closure//closure:repositories.bzl",
    "rules_closure_dependencies",
    "rules_closure_toolchains",
)

rules_closure_dependencies(omit_com_google_protobuf = True)

rules_closure_toolchains()
# End Experimental

# Go rules
http_archive(
    name = "io_bazel_rules_go",
    sha256 = "7b9bbe3ea1fccb46dcfa6c3f3e29ba7ec740d8733370e21cdc8937467b4a4349",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.22.4/rules_go-v0.22.4.tar.gz",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.22.4/rules_go-v0.22.4.tar.gz",
    ],
)

load("@io_bazel_rules_go//go:deps.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()

# Gazelle, Go BUILD file generator
http_archive(
    name = "bazel_gazelle",
    sha256 = "d8c45ee70ec39a57e7a05e5027c32b1576cc7f16d9dd37135b0eddde45cf1b10",
    urls = [
        "https://storage.googleapis.com/bazel-mirror/github.com/bazelbuild/bazel-gazelle/releases/download/v0.20.0/bazel-gazelle-v0.20.0.tar.gz",
        "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.20.0/bazel-gazelle-v0.20.0.tar.gz",
    ],
)

load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies", "go_repository")

gazelle_dependencies()

# Go gRPC-web Proxy server, as a prebuilt binary for Linux x86_64
http_archive(
    name = "grpcwebproxy",
    urls = ["https://github.com/improbable-eng/grpc-web/releases/download/v0.12.0/grpcwebproxy-v0.12.0-linux-x86_64.zip"],
    sha256 = "8c6383d4f299c202a2626bc480d3f4493bda34198e585c4939f1d9f61b6a6d5b",
    build_file = "//:grpcwebproxy.BUILD.bazel",
)

# Proto toolchain
http_archive(
    name = "com_google_protobuf",
    strip_prefix = "protobuf-master",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/master.zip"],
)

load("@com_google_protobuf//:protobuf_deps.bzl", "protobuf_deps")

protobuf_deps()

# Hack: I can't use grpc-tools' node wrappers properly, they don't like being
# used as a plugin by the ts_grpc_proto_library rules.
# So I depend directly on the plugin as a binary.
http_archive(
    name = "grpc_node_plugin",
    urls = [" https://node-precompiled-binaries.grpc.io/grpc-tools/v1.8.1/linux-x64.tar.gz"],
    sha256 = "ddfc9081c2993d574216870760775703fd974282dfd1cf417f89f58bdc08f1ed",
    build_file = "//:grpc_node_plugin.BUILD.bazel",
)

http_file(
    name = "grpc_web_plugin",
    executable = True,
    downloaded_file_path = "protoc-gen-grpc-web",
    urls = [" https://github.com/grpc/grpc-web/releases/download/1.0.7/protoc-gen-grpc-web-1.0.7-linux-x86_64"],
    sha256 = "0b9a0a62f6e8d486e3afcfa172ced25bd584b56ad218e90ecf64f65e4f9457bd",
)

# Docker setup
http_archive(
    name = "io_bazel_rules_docker",
    strip_prefix = "rules_docker-0.14.1",
    sha256 = "dc97fccceacd4c6be14e800b2a00693d5e8d07f69ee187babfd04a80a9f8e250",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.14.1/rules_docker-v0.14.1.tar.gz"],
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)

container_repositories()

load(
    "@io_bazel_rules_docker//nodejs:image.bzl",
    _nodejs_image_repos = "repositories",
)

_nodejs_image_repos()

# Go repositories
go_repository(
    name = "org_golang_x_text",
    importpath = "golang.org/x/text",
    sum = "h1:tW2bmiBqwgJj/UpqtC8EpXEZVYOwU0yG4iWbprSVAcs=",
    version = "v0.3.2",
)

go_repository(
    name = "org_golang_x_net",
    importpath = "golang.org/x/net",
    sum = "h1:QBjCr1Fz5kw158VqdE9JfI9cJnl/ymnJWAdMuinqL7Y=",
    version = "v0.0.0-20200506145744-7e3656a0809f",
)

go_repository(
    name = "org_golang_google_grpc",
    importpath = "google.golang.org/grpc",
    sum = "h1:EC2SB8S04d2r73uptxphDSUG+kTKVgjRPF+N3xpxRB4=",
    version = "v1.29.1",
)
