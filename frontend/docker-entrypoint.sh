#!/bin/sh
cat > /usr/share/nginx/html/pod.json << EOF
{"hostname":"${HOSTNAME}","node":"${NODE_NAME}"}
EOF
exec "$@"
