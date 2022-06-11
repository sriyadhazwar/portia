import copy
import json
import logging
import os
import sys
import traceback

from amqpstorm import Connection
from amqpstorm import Message
from dotenv import load_dotenv

logger = logging.getLogger('scheduler_log')


def get_category_link(category):
    try:
        with open('./category/' + category + '.json', 'r') as f:
            category_link = json.load(f)

        return category_link
    except:
        logger.error(traceback.format_exc())
        return None


def publish_message(payload_list):
    try:
        # load config from config file
        load_dotenv()

        hostname = os.getenv("RABBITMQ_HOSTNAME")
        username = os.getenv("RABBITMQ_USERNAME")
        password = os.getenv("RABBITMQ_PASSWORD")
        port = os.getenv("RABBITMQ_PORT")

        queue_name = os.getenv("RABBITMQ_QUEUENAME")

        connection = Connection(hostname=hostname, port=int(port),
                                username=username, password=password)
        channel = connection.channel()

        # Message Properties.
        properties = {
            'content_type': 'text/plain',
            'headers': {'key': 'value'},
        }

        for body in payload_list:
            try:
                body_string = json.dumps(body)

                # Create the message.
                message = Message.create(channel=channel, body=body_string, properties=properties)
                message.publish(routing_key=queue_name)

                logger.info("Success publish message for link: " + body['job']['url'])
            except:
                logger.error(traceback.format_exc())
    except:
        logger.error(traceback.format_exc())


def get_list_payload(category):
    # return list of payload in dict
    payload_list = []
    payload_dict = {}
    category_link = get_category_link(category)

    for key in category_link:
        try:
            with open('./feeder/' + key + '-feeder-message.json', 'r') as f:
                payload_dict = json.load(f)

            for link in category_link[key]:
                payload_dict['job']['url'] = link
                new_payload = copy.deepcopy(payload_dict)
                payload_list.append(new_payload)
        except:
            logger.error(traceback.format_exc())
    return payload_list


def main(argv):
    payload_list = get_list_payload(argv[0])

    publish_message(payload_list)


def init_logger():
    global logger
    logger = logging.getLogger('scheduler_log')
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.setFormatter(formatter)

    file_handler = logging.FileHandler('logs.log')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(stdout_handler)


if __name__ == "__main__":
    init_logger()
    logger.info('Scheduler Running')
    main(sys.argv[1:])
    logger.info('Scheduler Stopping')
