
import { StatusVideo } from "@streaming-video/shared";

export const StatusVideoClass: Record<StatusVideo, string> = {
    [StatusVideo.processing]: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    [StatusVideo.completed]: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    [StatusVideo.canceled]: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}
