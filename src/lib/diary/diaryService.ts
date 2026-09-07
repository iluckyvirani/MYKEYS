import { DiaryPriority, DiaryStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/notifications/notificationService";
import { emailService } from "@/lib/email/emailService";
import {
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "@/types/notification";

export type DiaryInput = {
  title: string;
  description?: string | null;
  priority?: DiaryPriority | string;
  status?: DiaryStatus | string;
  dueDate: string | Date;
};

const PRIORITIES: DiaryPriority[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: DiaryStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function parsePriority(value?: string): DiaryPriority {
  const v = String(value || "MEDIUM").toUpperCase();
  if (PRIORITIES.includes(v as DiaryPriority)) return v as DiaryPriority;
  throw Object.assign(new Error("Invalid priority"), { status: 400 });
}

function parseStatus(value?: string): DiaryStatus {
  const v = String(value || "PENDING").toUpperCase();
  if (STATUSES.includes(v as DiaryStatus)) return v as DiaryStatus;
  throw Object.assign(new Error("Invalid status"), { status: 400 });
}

function dayBounds(d = new Date()) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export const diaryService = {
  async list(userId: string, opts?: { status?: string }) {
    const where: Prisma.DiaryTaskWhereInput = { userId };
    if (opts?.status) {
      where.status = parseStatus(opts.status);
    }
    return prisma.diaryTask.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });
  },

  async create(userId: string, input: DiaryInput) {
    const title = input.title?.trim();
    if (!title) {
      throw Object.assign(new Error("Title is required"), { status: 400 });
    }
    const dueDate = new Date(input.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      throw Object.assign(new Error("Invalid date"), { status: 400 });
    }

    return prisma.diaryTask.create({
      data: {
        userId,
        title,
        description: input.description?.trim() || null,
        priority: parsePriority(input.priority),
        status: parseStatus(input.status),
        dueDate,
      },
    });
  },

  async update(userId: string, id: string, input: Partial<DiaryInput>) {
    const existing = await prisma.diaryTask.findFirst({
      where: { id, userId },
      select: { id: true, dueDate: true },
    });
    if (!existing) {
      throw Object.assign(new Error("Diary item not found"), { status: 404 });
    }

    const data: Prisma.DiaryTaskUpdateInput = {};
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) {
        throw Object.assign(new Error("Title is required"), { status: 400 });
      }
      data.title = title;
    }
    if (input.description !== undefined) {
      data.description = input.description?.trim() || null;
    }
    if (input.priority !== undefined) {
      data.priority = parsePriority(input.priority);
    }
    if (input.status !== undefined) {
      data.status = parseStatus(input.status);
    }
    if (input.dueDate !== undefined) {
      const dueDate = new Date(input.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw Object.assign(new Error("Invalid date"), { status: 400 });
      }
      data.dueDate = dueDate;
      // Allow reminder again if date changed
      const oldKey = existing.dueDate.toISOString().slice(0, 10);
      const newKey = dueDate.toISOString().slice(0, 10);
      if (oldKey !== newKey) {
        data.reminderSentAt = null;
      }
    }

    return prisma.diaryTask.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.diaryTask.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      throw Object.assign(new Error("Diary item not found"), { status: 404 });
    }
    await prisma.diaryTask.delete({ where: { id } });
    return { id };
  },

  /**
   * Daily: email + in-app notification for tasks due today (not completed/cancelled).
   */
  async processDueReminders(now = new Date()) {
    const { start, end } = dayBounds(now);

    const tasks = await prisma.diaryTask.findMany({
      where: {
        dueDate: { gte: start, lt: end },
        status: { in: ["PENDING", "IN_PROGRESS"] },
        reminderSentAt: null,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true } },
      },
      take: 200,
    });

    let sent = 0;
    for (const task of tasks) {
      try {
        await emailService.sendDiaryReminderEmail({
          to: task.user.email,
          firstName: task.user.firstName,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
        });

        await notificationService.create({
          userId: task.userId,
          type: NotificationType.REMINDER,
          title: "Diary reminder",
          message: `"${task.title}" is due today (${task.priority.toLowerCase()} priority).`,
          priority:
            task.priority === "HIGH"
              ? NotificationPriority.HIGH
              : NotificationPriority.NORMAL,
          category: NotificationCategory.ACTION_REQUIRED,
          data: { diaryTaskId: task.id },
        });

        await prisma.diaryTask.update({
          where: { id: task.id },
          data: { reminderSentAt: now },
        });
        sent += 1;
      } catch (err) {
        console.error(`Diary reminder failed for ${task.id}:`, err);
      }
    }

    return { checked: tasks.length, sent };
  },
};
