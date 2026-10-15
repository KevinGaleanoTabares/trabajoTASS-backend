#!/bin/sh
set -eu

: "${RABBITMQ_ADMIN_PASSWORD:?Define RABBITMQ_ADMIN_PASSWORD}"
: "${RABBITMQ_BACKEND_PASSWORD:?Define RABBITMQ_BACKEND_PASSWORD}"

admin_hash_output="$(rabbitmqctl hash_password "$RABBITMQ_ADMIN_PASSWORD")"
backend_hash_output="$(rabbitmqctl hash_password "$RABBITMQ_BACKEND_PASSWORD")"
admin_hash="$(printf '%s\n' "$admin_hash_output" | tail -n 1)"
backend_hash="$(printf '%s\n' "$backend_hash_output" | tail -n 1)"
unset admin_hash_output backend_hash_output

case "$admin_hash:$backend_hash" in
  *[!A-Za-z0-9+/=:]*|:|*:)
    printf '%s\n' 'Unable to generate RabbitMQ credential hashes.' >&2
    exit 1
    ;;
esac

export RABBITMQ_ADMIN_PASSWORD_HASH="$admin_hash"
export RABBITMQ_BACKEND_PASSWORD_HASH="$backend_hash"
envsubst '$RABBITMQ_ADMIN_PASSWORD_HASH $RABBITMQ_BACKEND_PASSWORD_HASH' \
  < /etc/rabbitmq/definitions.template.json \
  > /tmp/tass-definitions.json
chown rabbitmq:rabbitmq /tmp/tass-definitions.json
chmod 640 /tmp/tass-definitions.json

exec /usr/local/bin/docker-entrypoint.sh "$@"
