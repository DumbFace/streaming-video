"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  id: string;
}

export default function VideoPlayer({ id }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState("");
  useEffect(() => {

    fetch(`/api/videos/${id}`, {
      credentials: "include",
    })
      .then(async (res) => res.json())
      .then((data) => {
        console.log("data ", data)
        setSrc(data.data)
      });
  }, [id]);

  useEffect(() => {
    if (!src || !videoRef.current) return;
    const hls = new Hls({
      xhrSetup: (xhr) => {
        xhr.withCredentials = true;
      },
    });
    console.log("src: ", src);
    hls.loadSource(src);
    hls.attachMedia(videoRef.current);
    return () => hls.destroy();
  }, [src]);


  if (!src) return null;
  return (
    <video ref={videoRef} controls playsInline width="100%" height="100%" />
  );
}