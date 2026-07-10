

import { TypographyH4 } from '@/src/components/typographys/Typograpy';
import { Button } from '@/src/components/ui/button'
import { DialogFooter } from '@/src/components/ui/dialog'
import { Spinner } from '@/src/components/ui/spinner';
import { useDeleteVideoMutation } from '@/src/features/video/hooks/useDeleteVideoMutation';
import { DialogMode, useVideoDialogStore } from '@/src/features/video/shared/dialogStore';
import { toast } from 'sonner';

export const DeleteVideo = () => {
    const deleteVideoMuation = useDeleteVideoMutation();
    const { data, setState } = useVideoDialogStore((store) => store);

    if (!data) {
        return null;
    }

    const handleDelete = async () => {
        if (!data.id)
            return;
        var response = await deleteVideoMuation.mutateAsync(data.id);

        if (response.success) {
            toast(response.message)
        }
        setState(DialogMode.Close);
    }
    return (
        <>
            <TypographyH4 text={`Delete video ${data.title}`} />
            <DialogFooter>
                <Button type="button" onClick={handleDelete}>
                    {deleteVideoMuation.isPending ?
                        <Spinner></Spinner> : "Delete"
                    }
                </Button>
            </DialogFooter>
        </>
    )

}
