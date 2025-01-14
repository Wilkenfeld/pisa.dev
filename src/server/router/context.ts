import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "@/server/db/client";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

interface CreateContextOptions {
  session?: Session | null;
  next?: {
    req: NextApiRequest;
    res: NextApiResponse;
  };
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {
  return {
    session: _opts.session,
    next: _opts.next,
    prisma,
  };
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions
): Promise<Context> {
  // for API-response caching see https://trpc.io/docs/caching
  const session = await unstable_getServerSession(
    opts.req,
    opts.res,
    authOptions
  );
  return await createContextInner({
    session,
    next: {
      req: opts.req,
      res: opts.res,
    },
  });
}

export const createRouter = () => trpc.router<Context>();
