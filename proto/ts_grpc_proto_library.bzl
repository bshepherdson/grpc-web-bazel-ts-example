load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "JSNamedModuleInfo", "NodeRuntimeDepsInfo")

def _ts_grpc_proto_library(ctx):
    proto_file = ctx.file.proto.basename
    basename = proto_file[:-6]
    pbjs = ctx.actions.declare_file(basename + "_pb.js")
    pbdts = ctx.actions.declare_file(basename + "_pb.d.ts")
    grpc_pbjs = ctx.actions.declare_file(basename + "_grpc_pb.js")
    grpc_pbdts = ctx.actions.declare_file(basename + "_grpc_pb.d.ts")
    output_dir = pbjs.dirname

    tools = []
    tools.extend(ctx.files._protoc)
    tools.extend(ctx.files._grpc_node_plugin)
    tools.extend(ctx.files._protoc_gen_ts)

    inputs = [ctx.file.proto]

    ctx.actions.run(
        outputs = [pbjs, grpc_pbjs],
        inputs = inputs,
        tools = tools,
        executable = ctx.executable._protoc,
        arguments = [
            "--plugin=protoc-gen-grpc=" + ctx.executable._grpc_node_plugin.path,
            "--js_out=import_style=commonjs,binary:" + output_dir,
            "--grpc_out=" + output_dir,
            "-I",
            ctx.file.proto.dirname,
            ctx.file.proto.path,
        ],
        progress_message = "Compiling Node.js libraries for $<",
    )

    ctx.actions.run(
        outputs = [pbdts, grpc_pbdts],
        inputs = depset(
            direct = inputs,
            transitive = [ctx.attr._protoc_gen_ts[NodeRuntimeDepsInfo].deps],
        ),
        tools = tools,
        executable = ctx.executable._protoc,
        arguments = [
            "--plugin=protoc-gen-grpc=" + ctx.executable._grpc_node_plugin.path,
            "--plugin=protoc-gen-ts=" + ctx.executable._protoc_gen_ts.path,
            "--ts_out=" + output_dir,
            "--grpc_out=" + output_dir,
            "-I",
            ctx.file.proto.dirname,
            ctx.file.proto.path,
        ],
        progress_message = "Compiling Node.js TS libraries for $<",
    )

    declarations = depset([pbdts, grpc_pbdts])
    es5_sources = depset([pbjs, grpc_pbjs])
    es6_sources = depset([])
    return struct(
        providers = [
            DefaultInfo(files = depset([pbjs, grpc_pbjs, pbdts, grpc_pbdts])),
            DeclarationInfo(
                declarations = declarations,
                transitive_declarations = declarations,
                type_blacklisted_declarations = depset([]),
            ),
            JSNamedModuleInfo(
                direct_sources = es5_sources,
                sources = es5_sources,
            ),
        ],
        typescript = struct(
            declarations = declarations,
            transitive_declarations = declarations,
            type_blacklisted_declarations = depset(),
            es5_sources = es5_sources,
            transitive_es5_sources = es5_sources,
            es6_sources = depset(),
            transitive_es6_sources = depset(),
        ),
    )


ts_grpc_proto_library = rule(
    implementation = _ts_grpc_proto_library,
    attrs = {
        "proto": attr.label(
            mandatory = True,
            allow_single_file = [".proto"],
            providers = [ProtoInfo],
        ),
        "_grpc_node_plugin": attr.label(
            allow_single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@grpc_node_plugin//:bin/grpc_node_plugin"),
        ),
        "_protoc_gen_ts": attr.label(
            allow_files = True,
            executable = True,
            cfg = "host",
            default = Label("@npm//grpc_tools_node_protoc_ts/bin:protoc-gen-ts"),
        ),
        "_protoc": attr.label(
            allow_single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@com_google_protobuf//:protoc"),
        ),
    },
)


def _ts_grpc_web_proto_library(ctx):
    proto_file = ctx.file.proto.basename
    basename = proto_file[:-6]
    webname = basename + "_web"

    copy = ctx.actions.declare_file(webname + ".proto")

    pbjs = ctx.actions.declare_file(webname + "_pb.js")
    grpc_pbjs = ctx.actions.declare_file(webname + "_grpc_web_pb.js")
    pbdts = ctx.actions.declare_file(webname + "_pb.d.ts")
    grpc_pbdts = ctx.actions.declare_file(webname + "_grpc_web_pb.d.ts")

    output_dir = pbjs.dirname

    tools = []
    tools.extend(ctx.files._protoc)
    tools.extend(ctx.files._grpc_web_plugin)

    ctx.actions.run_shell(
        outputs = [copy],
        inputs = [ctx.file.proto],
        command = "cp '%s' '%s'" % (ctx.file.proto.path, copy.path),
    )

    ctx.actions.run(
        outputs = [pbjs, grpc_pbjs, pbdts, grpc_pbdts],
        inputs = [copy],
        tools = tools,
        executable = ctx.executable._protoc,
        arguments = [
            "--plugin=protoc-gen-grpc-web=" + ctx.executable._grpc_web_plugin.path,
            "--js_out=import_style=commonjs:" + output_dir,
            "--grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:" + output_dir,
            "-I=" + ctx.file.proto.dirname,
            "-I=" + copy.dirname,
            copy.path,
        ],
        progress_message = "Compiling gRPC-web libraries for $<",
    )

    declarations = depset([pbdts, grpc_pbdts])
    es5_sources = depset([pbjs, grpc_pbjs])
    es6_sources = depset([])
    return struct(
        providers = [
            DefaultInfo(files = depset([pbjs, grpc_pbjs, pbdts, grpc_pbdts])),
            DeclarationInfo(
                declarations = declarations,
                transitive_declarations = declarations,
                type_blacklisted_declarations = depset([]),
            ),
            JSNamedModuleInfo(
                direct_sources = es5_sources,
                sources = es5_sources,
            ),
        ],
        typescript = struct(
            declarations = declarations,
            transitive_declarations = declarations,
            type_blacklisted_declarations = depset(),
            es5_sources = es5_sources,
            transitive_es5_sources = es5_sources,
            es6_sources = depset(),
            transitive_es6_sources = depset(),
        ),
    )


ts_grpc_web_proto_library = rule(
    implementation = _ts_grpc_web_proto_library,
    attrs = {
        "proto": attr.label(
            mandatory = True,
            allow_single_file = [".proto"],
            providers = [ProtoInfo],
        ),
        "_grpc_web_plugin": attr.label(
            allow_single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@grpc_web_plugin//file:protoc-gen-grpc-web"),
        ),
        #"_protoc_gen_ts": attr.label(
        #    allow_files = True,
        #    executable = True,
        #    cfg = "host",
        #    default = Label("@npm//grpc_tools_node_protoc_ts/bin:protoc-gen-ts"),
        #),
        "_protoc": attr.label(
            allow_single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@com_google_protobuf//:protoc"),
        ),
    },
)
