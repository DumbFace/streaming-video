import { FnResponse } from "@/src/lib/fn-response";
import redis from "@/src/lib/redis";

export default async function ({
  cacheKey,
  data,
}: {
  cacheKey: string;
  data: any;
}) {
  try {
    const result = await redis.setex(cacheKey, 300, JSON.stringify(data));
  } catch (err) {
    const error = err as Error;

    return FnResponse.Fail("", {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
  return;
}
