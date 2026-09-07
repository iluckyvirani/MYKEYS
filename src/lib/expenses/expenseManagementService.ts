import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateExpenseInput = {
  propertyId: string;
  title: string;
  description?: string | null;
  amount: number;
  expenseDate: string | Date;
};

export type ExpenseFilters = {
  propertyId?: string | null;
  /** YYYY-MM */
  month?: string | null;
};

function monthRange(month: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(month.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const mon = Number(m[2]);
  if (mon < 1 || mon > 12) return null;
  const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0));
  return { start, end };
}

function buildWhere(
  ownerId: string,
  filters: ExpenseFilters
): Prisma.PropertyExpenseWhereInput {
  const where: Prisma.PropertyExpenseWhereInput = { ownerId };

  if (filters.propertyId) {
    where.propertyId = filters.propertyId;
  }

  if (filters.month) {
    const range = monthRange(filters.month);
    if (range) {
      where.expenseDate = { gte: range.start, lt: range.end };
    }
  }

  return where;
}

export const expenseManagementService = {
  async listOwnerProperties(ownerId: string) {
    return prisma.property.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        city: true,
        status: true,
      },
      orderBy: { title: "asc" },
    });
  },

  async listExpenses(ownerId: string, filters: ExpenseFilters = {}) {
    const where = buildWhere(ownerId, filters);

    const expenses = await prisma.propertyExpense.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true, city: true, status: true },
        },
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });

    return expenses;
  },

  async getStats(ownerId: string, filters: ExpenseFilters = {}) {
    const where = buildWhere(ownerId, filters);

    const [agg, count, byProperty] = await Promise.all([
      prisma.propertyExpense.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      prisma.propertyExpense.count({ where }),
      prisma.propertyExpense.groupBy({
        by: ["propertyId"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
    ]);

    const propertyIds = byProperty.map((p) => p.propertyId);
    const props =
      propertyIds.length > 0
        ? await prisma.property.findMany({
            where: { id: { in: propertyIds }, ownerId },
            select: { id: true, title: true },
          })
        : [];
    const titleMap = new Map(props.map((p) => [p.id, p.title]));

    // This month total (calendar month, ignoring filter month if set — or use filter)
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthRange = monthRange(
      filters.month && filters.month.length === 7 ? filters.month : thisMonthKey
    )!;

    const thisMonthWhere: Prisma.PropertyExpenseWhereInput = {
      ownerId,
      expenseDate: { gte: thisMonthRange.start, lt: thisMonthRange.end },
      ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    };

    const thisMonthAgg = await prisma.propertyExpense.aggregate({
      where: thisMonthWhere,
      _sum: { amount: true },
      _count: { _all: true },
    });

    return {
      totalAmount: agg._sum.amount || 0,
      averageAmount: agg._avg.amount || 0,
      count,
      thisMonthAmount: thisMonthAgg._sum.amount || 0,
      thisMonthCount: thisMonthAgg._count._all || 0,
      byProperty: byProperty.map((row) => ({
        propertyId: row.propertyId,
        title: titleMap.get(row.propertyId) || "Property",
        total: row._sum.amount || 0,
        count: row._count._all,
      })),
    };
  },

  async createExpense(ownerId: string, input: CreateExpenseInput) {
    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, ownerId },
      select: { id: true, title: true },
    });
    if (!property) {
      throw Object.assign(new Error("Property not found"), { status: 404 });
    }

    const title = input.title?.trim();
    if (!title) {
      throw Object.assign(new Error("Title is required"), { status: 400 });
    }

    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw Object.assign(new Error("Amount must be greater than 0"), {
        status: 400,
      });
    }

    const expenseDate = new Date(input.expenseDate);
    if (Number.isNaN(expenseDate.getTime())) {
      throw Object.assign(new Error("Invalid expense date"), { status: 400 });
    }

    return prisma.propertyExpense.create({
      data: {
        ownerId,
        propertyId: property.id,
        title,
        description: input.description?.trim() || null,
        amount,
        expenseDate,
      },
      include: {
        property: {
          select: { id: true, title: true, city: true, status: true },
        },
      },
    });
  },

  async updateExpense(
    ownerId: string,
    expenseId: string,
    input: Partial<CreateExpenseInput>
  ) {
    const existing = await prisma.propertyExpense.findFirst({
      where: { id: expenseId, ownerId },
      select: { id: true },
    });
    if (!existing) {
      throw Object.assign(new Error("Expense not found"), { status: 404 });
    }

    const data: Prisma.PropertyExpenseUpdateInput = {};

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
    if (input.amount !== undefined) {
      const amount = Number(input.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw Object.assign(new Error("Amount must be greater than 0"), {
          status: 400,
        });
      }
      data.amount = amount;
    }
    if (input.expenseDate !== undefined) {
      const expenseDate = new Date(input.expenseDate);
      if (Number.isNaN(expenseDate.getTime())) {
        throw Object.assign(new Error("Invalid expense date"), { status: 400 });
      }
      data.expenseDate = expenseDate;
    }
    if (input.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: input.propertyId, ownerId },
        select: { id: true },
      });
      if (!property) {
        throw Object.assign(new Error("Property not found"), { status: 404 });
      }
      data.property = { connect: { id: property.id } };
    }

    return prisma.propertyExpense.update({
      where: { id: expenseId },
      data,
      include: {
        property: {
          select: { id: true, title: true, city: true, status: true },
        },
      },
    });
  },

  async deleteExpense(ownerId: string, expenseId: string) {
    const existing = await prisma.propertyExpense.findFirst({
      where: { id: expenseId, ownerId },
      select: { id: true },
    });
    if (!existing) {
      throw Object.assign(new Error("Expense not found"), { status: 404 });
    }
    await prisma.propertyExpense.delete({ where: { id: expenseId } });
    return { id: expenseId };
  },
};
