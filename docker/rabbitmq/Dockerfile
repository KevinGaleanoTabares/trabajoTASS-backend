FROM rabbitmq:3.13-management-alpine

RUN apk add --no-cache gettext

COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY definitions.json /etc/rabbitmq/definitions.template.json
COPY tass-entrypoint.sh /usr/local/bin/tass-entrypoint.sh

RUN chmod 755 /usr/local/bin/tass-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/tass-entrypoint.sh"]
CMD ["rabbitmq-server"]
