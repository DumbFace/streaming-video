'use client'
import { BaseTable } from '@/src/components/base/table/BaseTable'
import { TypographyH1 } from '@/src/components/typographys/Typograpy'
import { Button } from '@/src/components/ui/button'
import { getVideos } from '@/src/features/video/actions/get-videos.action'
import { videoColumns } from '@/src/features/video/columns/columns'
import VideoDialog from '@/src/features/video/components/dialog'
import { DefaultPagination } from '@/src/features/video/constants/pagination.constant'
import { DialogMode, useVideoDialogStore } from '@/src/features/video/shared/dialogStore'
import { IVideo } from '@streaming-video/shared'
import { useQuery } from '@tanstack/react-query'

import { CirclePlus } from 'lucide-react'



export const VideoTableApp = () => {
    const { setState, pagination, onPaginationChange } = useVideoDialogStore((store) => store);

    const { data: videos = [] } = useQuery<IVideo[], Error, IVideo[]>({
        queryKey: ['videos', { pageIndex: pagination.pageIndex, pageSize: DefaultPagination.PageSize }],
        queryFn: async () => await getVideos(pagination.pageIndex, DefaultPagination.PageSize),
        staleTime: Infinity
    })

    const { data: pageVideoCount } = useQuery<number, Error, number>({
        queryKey: ['videoPageCount'],
        queryFn: async () => 0,
        staleTime: Infinity
    })

    const handleOpenDialog = () => setState(DialogMode.Add);

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
                data={videos}
                pageCount={Math.ceil((pageVideoCount ?? 0) / DefaultPagination.PageSize)}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            <VideoDialog />
        </div>
    )
}
