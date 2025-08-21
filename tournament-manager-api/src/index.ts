import express from "express";
import mongoose, { model, Schema } from "mongoose";
import { Kafka } from "kafkajs";   // kafkajs library; see Dockerfile

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tournament_designer";

const kafkaBroker = process.env.KAFKA_BROKER || "kafka:9092";  // Defaults form the compose
const kafkaTopic = process.env.KAFKA_TOPIC || "torneos";  // Defaults form the compose

app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));


const tournamentSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    roster: [{
      id: { type: Number, required: true },
      name: { type: String, required: true },
      weight: { type: Number, required: true },
      age: { type: Number, required: true },
    }]
  },
  { timestamps: true }
);

const Tournament = model("Tournament", tournamentSchema);

// -------------------- Kafka Setup --------------------
// KafkaJS Man: https://kafka.js.org/docs/getting-started

const kafka = new Kafka({
  clientId: 'kafkajs', //[TODO: Check This Code] 
  brokers: [kafkaBroker] 
});

const producer = kafka.producer();

async function initKafka() {
  try {
    await producer.connect();
    console.log("Conectado a Kafka");
  } catch (err) {
    console.error("Error conectando a Kafka:", err);
  }
}

initKafka();
// -------------------- Kafka Setup --------------------

// ================== POST /registrar ==================
app.post("/registrar", async (req, res) => {
  try {
    const torneo = req.body;

    const created = await Tournament.create(torneo);

    await producer.send({
      topic: kafkaTopic,
      messages: [
        {
          key: String(created._id), // Mongo id as key
          value: JSON.stringify(created),  // tournament as JSON
        },
      ],
    });

    res.status(201).json({
      ok: true,
      id: created._id,
      message: "Torneo registrado en Mongo y encolado en Kafka",
    });
  } catch (err) {
    console.error("Error en /registrar:", err);
    
    // Type guard to check if it's an Error
    if (err instanceof Error) {
      res.status(500).json({ ok: false, error: err.message });
    } else {
      res.status(500).json({ ok: false, error: "Unknown error occurred" });
    }
  }
});
// ================== POST /registrar ==================

app.post('/upload-data', async (req, res) => {
  const data = req.body;
  // Here you would handle the data upload logic
  console.log("Data received:", data);

  await Tournament.insertMany(req.body);
  res.status(201).json({ message: `Inserted ${req.body.length} tournaments!` });
});

app.get('/fetch-tournaments', async (req, res) => {
  const tournaments = await Tournament.find();
  res.status(200).json(tournaments);
});

app.get("/", (req, res) => {
  res.json({ message: "Tournament Designer API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
