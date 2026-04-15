#!/usr/bin/env bash
set -e

host="$1"
port="$2"
shift 2

if [ -z "$host" ] || [ -z "$port" ]; then
  echo "Usage: $0 host port -- command"
  exit 1
fi

echo "Waiting for database at $host:$port..."
until bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1; do
  printf '.'
  sleep 2
done

echo "Database is available, starting application."
exec "$@"
