import VideoPlayer from "@/src/features/video/components/video-player";

export default async function DetailVideo({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("id: ", id);

    return <VideoPlayer id={id} />;

}


// 1785153719688-536474677