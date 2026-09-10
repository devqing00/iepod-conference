import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface StageQuestion {
  _id?: string | ObjectId;
  sessionId: string;
  sessionTitle: string;
  attendeeName: string;
  department: string;
  question: string;
  answered: boolean;
  upvotes: number;
  createdAt: Date | string;
}

// In-memory fallback for question feed if DB is connecting
const inMemoryQuestions: StageQuestion[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const db = await getDatabase();
    const collection = db.collection("stage_questions");

    const query: any = {};
    if (sessionId && sessionId !== "all") {
      query.sessionId = sessionId;
    }

    const questions = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      questions: questions,
    });
  } catch (error) {
    // Graceful fallback
    return NextResponse.json({
      success: true,
      questions: inMemoryQuestions,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionTitle, attendeeName, department, question } =
      body;

    if (!question || typeof question !== "string" || question.trim().length < 4) {
      return NextResponse.json(
        { error: "Please enter a valid question (at least 4 characters)" },
        { status: 400 }
      );
    }

    const docToInsert = {
      sessionId: sessionId || "general",
      sessionTitle: sessionTitle || "Live Stage Session",
      attendeeName: attendeeName?.trim() || "Audience Member",
      department: department?.trim() || "KAAF Auditorium",
      question: question.trim(),
      answered: false,
      upvotes: 0,
      createdAt: new Date(),
    };

    let generatedId: any = `q-${Date.now()}`;

    try {
      const db = await getDatabase();
      const collection = db.collection("stage_questions");
      const result = await collection.insertOne(docToInsert);
      generatedId = result.insertedId;
    } catch (dbErr) {
      console.warn("Questions DB insert fallback:", dbErr);
    }

    const newQuestion: StageQuestion = {
      ...docToInsert,
      _id: generatedId,
    };
    inMemoryQuestions.unshift(newQuestion);

    return NextResponse.json({
      success: true,
      message: "Question sent directly to stage moderator!",
      question: newQuestion,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit stage question" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, action } = body;

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
    }

    try {
      const db = await getDatabase();
      const collection = db.collection("stage_questions");

      const queryFilter: any = ObjectId.isValid(questionId)
        ? { _id: new ObjectId(questionId) }
        : { _id: questionId };

      if (action === "toggleAnswered") {
        const doc = await collection.findOne(queryFilter);
        if (doc) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { answered: !doc.answered } }
          );
        }
      } else if (action === "upvote") {
        await collection.updateOne(queryFilter, { $inc: { upvotes: 1 } });
      }
    } catch (e) {
      // In-memory fallback
      const found = inMemoryQuestions.find((q) => q._id === questionId);
      if (found) {
        if (action === "toggleAnswered") found.answered = !found.answered;
        if (action === "upvote") found.upvotes += 1;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    const db = await getDatabase();
    const collection = db.collection("stage_questions");

    if (questionId) {
      const queryFilter: any = ObjectId.isValid(questionId)
        ? { _id: new ObjectId(questionId) }
        : { _id: questionId };
      await collection.deleteOne(queryFilter);
    } else {
      await collection.deleteMany({});
    }

    inMemoryQuestions.length = 0;
    return NextResponse.json({ success: true, message: "Questions cleared" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete questions" },
      { status: 500 }
    );
  }
}
