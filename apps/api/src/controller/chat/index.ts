import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { ZodError } from "zod";
import { and, asc, desc, eq } from "@repo/database";

import { db, conversations, messages } from "@repo/database";

import {
  createConversationSchema,
  sendMessageBodySchema,
  sendMessageSchema,
} from "./model";

import { runAiAgent } from "../../agent";

export async function createConversation(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { message } = await createConversationSchema.parseAsync(req.body);

    const [conversation] = await db
      .insert(conversations)
      .values({
        userId,
        title: message.slice(0, 30),
      })
      .returning({
        id: conversations.id,
      });

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    await db.insert(messages).values({
      conversationId: conversation.id,
      role: "user",
      content: message,
    });

    const aiResponse = await runAiAgent({
      tenantId: userId,
      message,
    });

    await db.insert(messages).values({
      conversationId: conversation.id,
      role: "assistant",
      content: aiResponse,
    });

    return res.status(201).json({
      success: true,
      conversationId: conversation.id,
      response: aiResponse,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: error.flatten(),
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function listConversations(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: desc(conversations.updatedAt),
    });

    return res.status(200).json({
      success: true,
      conversations: userConversations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { conversationId } = await sendMessageSchema.parseAsync(req.params);

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const conversationMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: asc(messages.createdAt),
    });

    return res.status(200).json({
      success: true,
      messages: conversationMessages,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: error.flatten(),
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { conversationId } = await sendMessageSchema.parseAsync(req.params);

    const { message } = await sendMessageBodySchema.parseAsync(req.body);

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const priorMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: asc(messages.createdAt),
      columns: {
        role: true,
        content: true,
      },
    });

    const history = priorMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: message,
    });

    const aiResponse = await runAiAgent({
      tenantId: userId,
      message,
      history,
    });

    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return res.status(201).json({
      success: true,
      aiResponse,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: error.flatten(),
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
