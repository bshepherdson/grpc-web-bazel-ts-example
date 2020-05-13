#!/bin/bash

../grpcwebproxy/dist/grpcwebproxy-v0.12.0-linux-x86_64 \
  --backend_addr=localhost:5051 \
  --run_tls_server=false \
  --server_http_debug_port=5082
  #--allow_all_origins

