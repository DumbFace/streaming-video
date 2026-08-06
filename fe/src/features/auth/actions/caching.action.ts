"use server";
import { FnResponse } from "@/src/lib/fn-response";
import redis from "@/src/lib/redis";
export const getTll = async ({
  key,
  prefix,
}: {
  key: string;
  prefix: string;
}) => {
  try {
    const result = await redis.ttl(`${prefix}:${key}`);

    return FnResponse.Succeed<number>("", result);
  } catch (err) {
    const error = err as Error;

    return FnResponse.Fail("", {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
};

export const getValue = async ({
  key,
  prefix,
}: {
  key: string;
  prefix: string;
}) => {
  try {
    const result = await redis.get(`${prefix}:${key}`);

    return FnResponse.Succeed<string | null>("", result);
  } catch (err) {
    const error = err as Error;

    return FnResponse.Fail("", {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
};

export const setEx = async ({
  data,
  ttl,
  key,
  prefix,
}: {
  data: any;
  ttl: number;
  key: string;
  prefix: string;
}) => {
  try {
    const result = await redis.setex(
      `${prefix}:${key}`,
      ttl,
      JSON.stringify(data),
    );

    return FnResponse.Succeed<string>("", result);
  } catch (err) {
    const error = err as Error;

    return FnResponse.Fail("", {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
};

export const rmKey = async ({
  key,
  prefix,
}: {
  key: string;
  prefix: string;
}) => {
  return await redis.del(`${prefix}:${key}`);
};
