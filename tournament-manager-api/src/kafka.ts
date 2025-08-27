import { Kafka, Message, Producer, ProducerBatch, TopicMessages } from 'kafkajs'
import {iTournamentMessage} from "./iTournamentMessage"

// Base on: https://kafka.js.org/docs/producer-example
export default class ProducerFactory {
  private producer: Producer;
  private topic: string;
  private broker: string;
  private connected: boolean = false; 

  constructor(kafkaTopic: string, kafkaBroker: string) {
    this.topic = kafkaTopic;
    this.broker = kafkaBroker;
    this.producer = this.createProducer();
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
      console.log('✅✅✅ Kafka Producer conectado ✅✅✅');
      this.connected = true; // connected is TRUE
    } catch (error) {
      console.error("❌ Error conectando el Kafka Producer:", error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect();
    console.log("🛑 Kafka Producer desconectado");
  }

  public async sendBatch(messages: iTournamentMessage[]): Promise<void> {
    const kafkaMessages: Message[] = messages.map((msg) => ({
      key: String(msg._id),
      value: JSON.stringify(msg),
    }));

    const topicMessages: TopicMessages = {
      topic: this.topic,
      messages: kafkaMessages,
    };

    const batch: ProducerBatch = {
      topicMessages: [topicMessages],
    };

    await this.producer.sendBatch(batch);
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: 'kafkajs',
      brokers: [this.broker],
    });

    return kafka.producer();
  }

  public isConnected(): boolean {
     return this.connected;
  }
}
