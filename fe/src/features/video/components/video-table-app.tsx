'use client'
import { BaseTable } from '@/src/components/base/table/BaseTable'
import { TypographyH1 } from '@/src/components/typographys/Typograpy'
import { Button } from '@/src/components/ui/button'
import { getVideos } from '@/src/features/video/actions/get-videos.action'
import { videoColumns } from '@/src/features/video/columns/columns'
import VideoDialog from '@/src/features/video/components/dialog'
import { DefaultPagination } from '@/src/features/video/constants/pagination.constant'
import { DialogMode, useVideoDialogStore } from '@/src/features/video/shared/dialogStore'
import { useQuery } from '@tanstack/react-query'

import { CirclePlus } from 'lucide-react'
import { useEffect } from 'react'

import { useSession } from "next-auth/react"


export const VideoTableApp = () => {
    const { data: session, status } = useSession()
    console.log("session: ", session);

    useEffect(() => {
        const eventSource = new EventSource(
            'http://localhost:3005/worker/test-sse',
        );

        eventSource.onmessage = ({ data }) => {
            console.log('New message:', JSON.parse(data));
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const { setState, pagination, onPaginationChange } = useVideoDialogStore((store) => store);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["videos", { pageIndex: pagination.pageIndex, pageSize: DefaultPagination.PageSize }],
        queryFn: () => getVideos(pagination.pageIndex, DefaultPagination.PageSize),
    });

    const handleOpenDialog = () => setState(DialogMode.Add);
    const pageCount = Math.ceil((data?.totalPages ?? 0) / DefaultPagination.PageSize) || 1;

    return (
        <div className="container w-auto mx-auto py-5 flex flex-col gap-y-5">
            <div className="container flex justify-between items-center">
                <TypographyH1 text='Video' />
                <Button onClick={handleOpenDialog}>
                    <CirclePlus />
                    Add
                </Button>
            </div>

            <BaseTable
                columns={videoColumns()}
                data={data?.data ?? []}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            <VideoDialog />
        </div>
    )
}
