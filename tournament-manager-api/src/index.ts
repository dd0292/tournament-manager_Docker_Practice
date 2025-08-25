import express from "express";
import mongoose, { model, Schema } from "mongoose";
import ProducerFactory from "./kafka";
import { iTournamentMessage, iPlayer } from "./iTournamentMessage"

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tournament_designer";

const kafkaBroker = process.env.KAFKA_BROKER || "localhost:9092";  // Defaults form the compose
const kafkaTopic = process.env.KAFKA_TOPIC || "torneos";  // Defaults form the compose

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});


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

// ---------------------- Kafka Setup/Connection ----------------------
// KafkaJS Man: https://kafka.js.org/docs/getting-started

const kafkaProducer = new ProducerFactory(kafkaTopic, kafkaBroker); 

(async () => {
  await kafkaProducer.start();

  app.listen(PORT, () => {
    console.log(`Kafka's server running on port ${kafkaBroker}`);
  });

})();

// ---------------------- Kafka Setup/Connection ----------------------

// ========================= POST /upload-data =========================
app.post("/upload-data", async (req, res) => {
  try {
    const data = req.body;
    const created = await Tournament.insertMany(data);

    if (!kafkaProducer.isConnected()) {
      console.warn("⚠️ Kafka producer desconectado, reconectando...");
      await kafkaProducer.start();
    }

    // Interface to send Data
    const tournamentMessages: iTournamentMessage[] = created.map(doc => ({
      _id: doc._id.toString(),
      title: doc.title,
      type: doc.type,
      roster: doc.roster.map((player: iPlayer) => ({
        id: player.id,
        name: player.name,
        weight: player.weight,
        age: player.age,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    await kafkaProducer.sendBatch(tournamentMessages);

    res.status(201).json({
      ok: true,
      inserted: created.length,
      ids: created.map(doc => doc._id),
      message: "Torneos registrados en Mongo y encolados en Kafka",
    });

  } catch (err) {
    console.error("Error en /upload-data:", err);
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// ================== POST /upload-data ==================

// app.post('/upload-data', async (req, res) => {
//   const data = req.body;
//   // Here you would handle the data upload logic
//   console.log("Data received:", data);

//   await Tournament.insertMany(req.body);
//   res.status(201).json({ message: `Inserted ${req.body.length} tournaments!` });
// });

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
