import { Kafka } from "kafkajs";

const broker = process.env.KAFKA_BROKER || "kafka:9092";
const topic  = process.env.KAFKA_TOPIC  || "torneos";

const kafka = new Kafka({ brokers: [broker] });
const consumer = kafka.consumer({ groupId: "kafkajs" });

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`[job] listening on ${topic} @ ${broker}`);

  await consumer.run({
    eachMessage: async ({ message }) => {

      console.log("[job] got:", message.key?.toString(), message.value?.toString());
      
    },
  });
})();
