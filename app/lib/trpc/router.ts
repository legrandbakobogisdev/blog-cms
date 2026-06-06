// src/lib/trpc/router.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/lib/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

// ─── Context ────────────────────────────────────────────────────────────────
export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(authOptions);
  return { db, session };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

// ─── Middleware ──────────────────────────────────────────────────────────────
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.session?.user?.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

// ─── Posts Router ────────────────────────────────────────────────────────────
const postsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        category: z.string().optional(),
        tag: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, category, tag, status } = input;
      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          status: status ?? "PUBLISHED",
          ...(category && { categories: { some: { slug: category } } }),
          ...(tag && { tags: { some: { slug: tag } } }),
        },
        include: { author: true, categories: true, tags: true, _count: { select: { comments: true } } },
        orderBy: { publishedAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        nextCursor = posts.pop()!.id;
      }

      return { posts, nextCursor };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { slug: input.slug },
        include: { author: true, categories: true, tags: true, comments: { include: { author: true, replies: { include: { author: true } } }, where: { parentId: null }, orderBy: { createdAt: "asc" } } },
      });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        coverImage: z.string().url().optional(),
        status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
        categoryIds: z.array(z.string()).optional(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { categoryIds, tagIds, ...data } = input;
      return ctx.db.post.create({
        data: {
          ...data,
          authorId: ctx.session.user.id,
          publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
          categories: categoryIds ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
          tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), content: z.string().optional(), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.post.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({ where: { id: input.id } });
    }),
});

// ─── Comments Router ─────────────────────────────────────────────────────────
const commentsRouter = router({
  create: protectedProcedure
    .input(z.object({ postId: z.string(), content: z.string().min(1).max(2000), parentId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: { ...input, authorId: ctx.session.user.id },
        include: { author: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findUnique({ where: { id: input.id } });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.authorId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.comment.delete({ where: { id: input.id } });
    }),
});

// ─── App Router ──────────────────────────────────────────────────────────────
export const appRouter = router({
  posts: postsRouter,
  comments: commentsRouter,
});

export type AppRouter = typeof appRouter;
