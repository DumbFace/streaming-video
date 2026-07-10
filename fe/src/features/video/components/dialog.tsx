import React, { useEffect } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'

import * as z from "zod";
import { VideoForm } from '@/src/features/video/components/form';
import { DeleteVideo } from '@/src/features/video/components/deleteDialog';
import { DialogMode, DialogModeType, useVideoDialogStore } from '@/src/features/video/shared/dialogStore';

export type VideoFormData = {
    id?: string,
    title: string,
    description: string,
    videoFile?: File[]
}

export const VideoDialogTitle: Partial<Record<DialogModeType, string>> = {
    [DialogMode.Add]: DialogMode.Add,
    [DialogMode.Edit]: DialogMode.Edit,
    [DialogMode.Delete]: DialogMode.Delete,
}

export const VideoDialogContent: Partial<Record<DialogModeType, React.JSX.Element>> = {
    [DialogMode.Add]: <VideoForm />,
    [DialogMode.Edit]: <VideoForm />,
    [DialogMode.Delete]: <DeleteVideo />,
}

const videoFormSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(200, "Title must be at most 200 characters."),
    description: z.string()
        .min(1, "Description  is required")
        .max(500, "Description must be at most 500 characters."),
    videoFile: z
        .custom<File[] | undefined>()
        .refine((files) => files && files.length > 0, {
            message: "A video file asset is required"
        })
});

export type VideoFormValues = z.infer<typeof videoFormSchema>

const VideoDialog = () => {
    const { isOpen, setState, state } = useVideoDialogStore((store) => store);

    return (
        <Dialog open={isOpen} onOpenChange={() => setState(DialogMode.Close)}>
            <DialogContent className="lg:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {VideoDialogTitle[state]?.toLocaleUpperCase() ?? ""}
                    </DialogTitle>
                </DialogHeader>

                {VideoDialogContent[state]}

            </DialogContent>
        </Dialog >
    )
}

export default VideoDialog;

