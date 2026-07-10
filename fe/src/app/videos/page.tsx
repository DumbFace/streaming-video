
import getQueryClient from "@/src/app/getQueryClient";
import { getVideos } from "@/src/features/video/actions/get-videos.action";
import { VideoTableApp } from "@/src/features/video/components/video-table-app";
import { DefaultPagination } from "@/src/features/video/constants/pagination.constant";
import ModelVideo from "@/src/features/video/models/video";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function VideoListPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['videos', { pageIndex: DefaultPagination.PageIndex, pageSize: DefaultPagination.PageSize }],
        queryFn: async () => await getVideos(DefaultPagination.PageIndex, DefaultPagination.PageSize),
    });

    await queryClient.prefetchQuery({
        queryKey: ['videoPageCount'],
        queryFn: async () => {
            const videoPageCount = await ModelVideo.find().countDocuments();
            console.log("videoPageCount: ", videoPageCount);
            return videoPageCount;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <VideoTableApp />
        </HydrationBoundary>
    );
}