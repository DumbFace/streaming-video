import connectDB from "@/lib/db";
import Video from "@/lib/models/Videos";

export default async function VideoListPage() {
    // Ensure the database is connected
    await connectDB();

    // Fetch documents directly on the server
    const videos = await Video.find({}).lean();

    return (
        <div>
            {videos.map((video) => (
                <p key={video._id.toString()}>{video.title}</p>
            ))}
        </div>
    );
}