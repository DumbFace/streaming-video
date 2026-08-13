import { useEffect } from 'react'

import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { FileUploadDirectUpload } from '@/src/features/video/components/video-uploader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { Field, FieldGroup } from '@/src/components/ui/field';
import { DialogMode, useVideoDialogStore } from '@/src/features/video/shared/dialogStore';
import { toast } from 'sonner';
import { useUpdateVideoMutation } from '@/src/features/video/hooks/useUpdateVideoMutation';
import { useAddVideoMutation } from '@/src/features/video/hooks/useAddVideoMutation';

import { Spinner } from '@/src/components/ui/spinner';
export const VideoForm = () => {
    const { data, state, setState } = useVideoDialogStore((store) => store);
    const updateVideoMutation = useUpdateVideoMutation();
    const addVideoMuation = useAddVideoMutation();

    type VideoFormValues = z.infer<typeof videoFormSchema>

    const defaultValue: VideoFormValues = {
        title: "",
        description: "",
        videoFile: []
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
            .refine((files) => {
                if (state === DialogMode.Edit) return true;

                return files && files.length > 0
            },
                {
                    message: "A video file asset is required"
                })
    })

    useEffect(() => {
        form.reset(data ?? defaultValue)
    }, [data]);

    const form = useForm<z.infer<typeof videoFormSchema>>({
        resolver: zodResolver(videoFormSchema),
        defaultValues: defaultValue,
    });

    async function handleSubmit(formVideoData: VideoFormValues) {
        state === DialogMode.Edit ?
            await updateVideo(formVideoData) :
            await addVideo(formVideoData)

        setState(DialogMode.Close);
    }

    async function addVideo(formVideoData: VideoFormValues) {
        var response = await addVideoMuation.mutateAsync(formVideoData);
        toast(response.message);
    }

    async function updateVideo(formVideoData: z.infer<typeof videoFormSchema>) {
        if (!data?.id) {
            return
        }

        var response = await updateVideoMutation.mutateAsync({ id: data.id, data: formVideoData })

        if (response?.success) {
            toast(response.message);
        } else {
            console.error('Upload failed:', response);
        }
    }

    const { errors } = form.formState;

    return (
        <FormProvider  {...form}>
            <form id="form-rhf-demo" onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup>
                    <Field>
                        <Label>Title</Label>
                        <Input {...form.register("title")} />
                        {errors.title && (
                            <span className="text-sm text-red-500">{errors.title.message}</span>
                        )}
                    </Field>
                    <Field>
                        <Label>Description</Label>
                        <Input {...form.register("description")} />
                        {errors.description && (
                            <span className="text-sm text-red-500">{errors.description.message}</span>
                        )}
                    </Field>
                    <Field>
                        <FileUploadDirectUpload />
                        {errors.videoFile && (
                            <span className="text-sm text-red-500">{errors.videoFile.message}</span>
                        )}
                    </Field>
                    <Field orientation="horizontal" className="justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={addVideoMuation.isPending || updateVideoMutation.isPending}
                        >
                            Reset
                        </Button>
                        <Button type="submit" form="form-rhf-demo">
                            {addVideoMuation.isPending || updateVideoMutation.isPending ? (
                                <Spinner />
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </FormProvider>
    )
}

