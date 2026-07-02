import amqp from "amqplib"
import config from "./index.js"
import logger from "./logger.js"

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    async connect() {

        //If already connected: Don't reconnect
        if (this.channel) {
            return this.channel;
        }

        //Someone else is already connecting then wait
        if (this.isConnecting) {
            //create custom promise that resolve only when isConnecting become false
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        resolve()
                    }
                }, 100)//checks every: 100ms
            })
            return this.channel
        }

        try {
            //marks : Connection in progress
            this.isConnecting = true;

            // Connecting to RabbitMQ amqp://localhost:5672
            logger.info("Connecting to RabbitMQ", config.rabbitmq.url)
            
            //create connection
            this.connection = await amqp.connect(config.rabbitmq.url);
            
            //create channel
            //All sending and receiving happens through channels.
            this.channel = await this.connection.createChannel();

            // Creating key | Queue name
            const dlqName = `${config.rabbitmq.queue}.dlq` // api_hits | api_hits.dlq

            // DL Queue
            //Failed messages move here
            //durable: true
            // Means: RabbitMQ restart, Queue survives
            await this.channel.assertQueue(dlqName, {
                durable: true
            })

            // Normal Queue 
            //This tells RabbitMQ: If message fails, Send to DLQ
            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName
                }
            })

            //Connection established.
            logger.info("RabbitMQ connected, queue:", config.rabbitmq.queue)

            //When RabbitMQ restarts
            //Connection breaks.
            this.connection.on("close", () => {
                logger.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            })

            //Connection errors, Authentication errors, Network issues
            this.connection.on("error", (err) => {
                logger.error('RabbitMQ connection err', err);
                this.connection = null;
                this.channel = null;
            })
            
            //Now other waiting requests can continue.
            this.isConnecting = false;
            return this.channel

        } 
        catch (error) {
            this.isConnecting = false;
            logger.error("Failed to connect to RabbitMQ", error)
            throw error
        }
    }

    getChannel() {
        return this.channel;
    }

    //get status of connection
    getStatus() {
        if (!this.connection || !this.channel) return "disconnected";
        if (this.connection.closing) return "closing";
        return "connected"
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            logger.info("RabbitMQ connection closed")
        } catch (error) {
            logger.error("Error in closing RabbitMQ connection:", error)
        }
    }
}

export default new RabbitMQConnection()