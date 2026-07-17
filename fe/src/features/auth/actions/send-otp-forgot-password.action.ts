"use server";
import { setEx } from "@/src/features/auth/actions/caching.action";
import { ForgotPasswordFormValues } from "@/src/features/auth/components/forgot-password-form";
import { RedisPrefix } from "@/src/features/auth/constants/redis-prefix";
import { FnResponse } from "@/src/lib/fn-response";
import { generateOTP } from "@/src/lib/utils";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { _success } from "zod/v4/core";

export async function SendMail({
  to = [],
  subject = "",
  body = "",
  signal,
}: {
  to?: string[];
  subject?: string;
  body?: string;
  signal?: AbortSignal;
}): Promise<void> {
  const server = process.env.SMTP_SERVER;
  const port = Number(process.env.SMTP_PORT);
  const from = process.env.SMTP_FROM;
  const defaultTo = process.env.SMTP_TO;
  const password = process.env.SMTP_PASSWORD;

  if (!server || !port || !from || !defaultTo) {
    throw new Error("Cannot read config or config null");
  }

  const transporter = nodemailer.createTransport({
    host: server,
    port: port,
    auth: {
      user: from,
      pass: password,
    },
  });

  const recipients = to.length > 0 ? to.join(", ") : defaultTo;

  const mailOptions = {
    from: from,
    to: recipients,
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
}

export async function SendOTPForgotpasswordAction({
  formData,
}: {
  formData: ForgotPasswordFormValues;
}) {
  try {
    const otp = generateOTP();
    // await SendMail({
    //   to: [formData.email],
    //   subject: "OTP",
    //   body: otp,
    // });
    console.log("otp: ", otp);
    const response = await setEx({
      prefix: RedisPrefix.FORGOT_PASSWORD,
      key: formData.email,
      ttl: 120,
      data: { email: formData.email, otp: otp },
    });

    if (!response.success) return FnResponse.Fail("There is something wrong!");

    return FnResponse.Succeed<void>("Send OTP successful", undefined);
  } catch (err) {
    const error = err as Error;
    return FnResponse.Fail("Send OTP unsuccessful", {
      name: error.name,
      message: error.message,
      code: 0,
    });
  }
}
