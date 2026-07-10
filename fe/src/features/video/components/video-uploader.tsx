"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadItemProgress,
    FileUploadList,
    type FileUploadProps,
    FileUploadTrigger,
} from "@/src/components/ui/file-upload";
import { useController, useFormContext } from "react-hook-form";
import { VideoFormValues } from "@/src/features/video/components/dialog";
import { useVideoDialogStore } from "@/src/features/video/shared/dialogStore";

export function FileUploadDirectUpload() {
    const { data } = useVideoDialogStore((store) => store);

    const { control } = useFormContext<VideoFormValues>();
    const {
        field
    } = useController({
        name: "videoFile",
        control,
    });

    const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
        async (incomingFiles, { onProgress, onSuccess, onError }) => {
            try {
                const uploadPromises = incomingFiles.map(async (file) => {
                    try {
                        const totalChunks = 10;
                        let uploadedChunks = 0;

                        for (let i = 0; i < totalChunks; i++) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, Math.random() * 200 + 100),
                            );

                            uploadedChunks++;
                            const progress = (uploadedChunks / totalChunks) * 100;
                            onProgress(file, progress);
                        }

                        await new Promise((resolve) => setTimeout(resolve, 500));
                        onSuccess(file);

                    } catch (error) {
                        onError(
                            file,
                            error instanceof Error ? error : new Error("Upload failed"),
                        );
                    }
                });

                await Promise.all(uploadPromises);
                field.onChange(incomingFiles);

            } catch (error) {
                console.error("Unexpected error during upload:", error);
            }
        },
        [field],
    );

    const onFileReject = React.useCallback((file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        });
    }, []);

    return (
        <FileUpload
            value={field.value}
            onValueChange={field.onChange}
            onUpload={onUpload}
            onFileReject={onFileReject}
            maxFiles={1}
            disabled={!!data?.id}
        >
            <FileUploadDropzone>
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">Drag & drop files here</p>
                    <p className="text-muted-foreground text-xs">
                        Or click to browse (max 1 files)
                    </p>
                </div>
                <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                        Browse files
                    </Button>
                </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
                {field.value?.map((file, index) => (
                    <FileUploadItem key={index} value={file} className="flex-col">
                        <div className="flex w-full items-center gap-2">
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                    <X />
                                </Button>
                            </FileUploadItemDelete>
                        </div>
                        <FileUploadItemProgress />
                    </FileUploadItem>
                ))}
            </FileUploadList>
        </FileUpload>
    );
}