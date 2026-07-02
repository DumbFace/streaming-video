import { NextResponse } from "next/server";

interface VideoRequest {
  title: string;
  url: string;
}

export async function GET() {
  const videos = [
    { id: 1, title: "Video 1" },
    { id: 2, title: "Video 2" },
  ];
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  try {
    const body: VideoRequest = await request.json();

    console.log(`Creating video with title: ${body.title}`);

    return NextResponse.json(
      { success: true, message: "Video created!" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
