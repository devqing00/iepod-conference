import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import dns from "dns";

// Ensure Node.js resolves SRV records reliably on Windows/local networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if already configured or restricted
}

let rawUri = process.env.MONGODB_URL || "";

// If SRV format is provided, dynamically convert it to the direct replica set format
// preserving the exact credentials and parameters from process.env.MONGODB_URL
if (rawUri.startsWith("mongodb+srv://") && rawUri.includes("cluster0.qrykl.mongodb.net")) {
  const match = rawUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(?:\/([^?]*))?(?:\?(.*))?$/);
  if (match) {
    const auth = match[1];
    const db = match[3] || "iesa_db";
    rawUri = `mongodb://${auth}@cluster0-shard-00-00.qrykl.mongodb.net:27017,cluster0-shard-00-01.qrykl.mongodb.net:27017,cluster0-shard-00-02.qrykl.mongodb.net:27017/${db}?ssl=true&replicaSet=atlas-ckzs89-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
}

const uri = rawUri;
const dbName = process.env.MONGODB_DB || "iesa_db";
export const CONFERENCE_EVENT_ID =
  process.env.CONFERENCE_EVENT_ID || "69b5c531f5e02c6de5ccb6b0";

export interface UserDoc {
  _id: ObjectId;
  firstName?: string;
  lastName?: string;
  name?: string;
  matricNumber?: string;
  email?: string;
  level?: string;
  department?: string;
  phone?: string;
  [key: string]: any;
}

export interface PaymentDoc {
  _id: ObjectId;
  title?: string;
  description?: string;
  amount?: number;
  /**
   * CRITICAL: Stored as 24-char hex strings (`string[]`), NOT BSON ObjectId!
   * The main Python/FastAPI backend validates this as `str` in Pydantic v2 (PaymentWithStatus).
   * Pushing a BSON ObjectId here crashes the main site payments API with a 500 error.
   */
  paidBy?: string[];
  [key: string]: any;
}

export interface ConferenceCheckinDoc {
  _id?: ObjectId;
  eventId: string;
  studentId: ObjectId;
  studentName: string;
  matricNumber: string;
  email: string;
  level?: string;
  department?: string;
  institution?: string;
  tagType?: "paid_vip" | "regular";
  checkedInAt: Date;
  checkedInBy: string;
  method: "qr_scan" | "manual_lookup" | "registration";
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error("Please add your MONGODB_URL to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (err) {
    console.warn("Re-establishing MongoClient connection...", err);
    const fallbackClient = new MongoClient(uri);
    global._mongoClientPromise = fallbackClient.connect();
    clientPromise = global._mongoClientPromise;
    const client = await clientPromise;
    return client.db(dbName);
  }
}

let indexEnsured = false;

export async function getCheckinsCollection(): Promise<Collection<ConferenceCheckinDoc>> {
  const db = await getDatabase();
  const collection = db.collection<ConferenceCheckinDoc>("conference_checkins");

  if (!indexEnsured) {
    try {
      await collection.createIndex(
        { eventId: 1, studentId: 1 },
        { unique: true, name: "idx_event_student_unique" }
      );
      indexEnsured = true;
    } catch (err) {
      console.warn("Index creation check note:", err);
    }
  }

  return collection;
}

export async function getPaymentsCollection(): Promise<Collection<PaymentDoc>> {
  const db = await getDatabase();
  return db.collection<PaymentDoc>("payments");
}

export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDatabase();
  return db.collection<UserDoc>("users");
}
