
import { BaseTableApp } from "@/src/components/base/table/base-table-app";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { VideoTableApp } from "@/src/features/video/components/video-table-app";
import connectDB from "@/src/lib/db";
import { StatusVideo, Video } from "@/src/lib/domain/entities/video";
import { TableFeatureType } from '../../features/column-registry';

export default async function VideoListPage() {
    const dataSample: Array<Video> = [
        {
            title: "Introduction to Next.js App Router",
            description: "Learn the foundational concepts of Next.js, layout structures, and file-based routing mechanisms.",
            status: StatusVideo.Canceled, // Assuming your enum is named Status based on the first prompt
            image: "/images/nextjs-intro.png",
            masterPlaylistUrl: "/videos/nextjs-intro-stream.mp4",
            createdAt: new Date(), // Returns a proper Date object representing current time
            updatedAt: new Date()  // Returns a proper Date object representing current time
        },
        {
            title: "Advanced Domain-Driven Design in TypeScript",
            description: "Deep dive into building complex aggregates, value objects, and domain services in enterprise Node apps.",
            status: StatusVideo.Processed, // Mapped from "Published" to your enum
            image: "/images/typescript-ddd.png",
            masterPlaylistUrl: "/videos/typescript-ddd-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Implementing Single-Table Design in NoSQL",
            description: "How to structure overloaded partition keys and generic sort keys for highly performant query flows.",
            status: StatusVideo.Processed,
            image: "/images/nosql-single-table.png",
            masterPlaylistUrl: "/videos/nosql-single-table-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Video Processing with FFmpeg and Node.js",
            description: "Automate slicing raw mp4 streams into HLS video chunks ready for scalable dynamic delivery networks.",
            status: StatusVideo.Processing, // Mapped from "Draft"
            image: "/images/ffmpeg-processing.png",
            masterPlaylistUrl: "/videos/ffmpeg-processing-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Clean Architecture Boundaries in Next.js",
            description: "Protecting your core application logic from web frameworks using strict dependency inversion principles.",
            status: StatusVideo.Canceled, // Mapped from "Archived"
            image: "/images/clean-architecture.png",
            masterPlaylistUrl: "/videos/clean-architecture-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Understanding TanStack Query Data Fetching",
            description: "Mastering client-side server state management, automated refetch intervals, and query cache validation.",
            status: StatusVideo.Processed,
            image: "/images/tanstack-query.png",
            masterPlaylistUrl: "/videos/tanstack-query-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Building Layouts with Shadcn UI Components",
            description: "Leveraging primitives like sidebars, menus, and customizable tables to craft responsive dashboard layouts.",
            status: StatusVideo.Processed,
            image: "/images/shadcn-layouts.png",
            masterPlaylistUrl: "/videos/shadcn-layouts-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Handling Concurrent Database Mutations safely",
            description: "An architectural deep-dive into resolving distributed transactions and complex transactional boundary states.",
            status: StatusVideo.Processing,
            image: "/images/database-mutations.png",
            masterPlaylistUrl: "/videos/database-mutations-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Managing Global Contexts Across Hot-Reloads",
            description: "Caching stateful backend infrastructure instances to avoid active connection limits leaks in development mode.",
            status: StatusVideo.Processed,
            image: "/images/global-caching.png",
            masterPlaylistUrl: "/videos/global-caching-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Setting Up Path Aliases in Large TypeScript Codebases",
            description: "Eliminating multi-level deep relative paths by configuring standardized compiler module matching defaults.",
            status: StatusVideo.Processed,
            image: "/images/path-aliases.png",
            masterPlaylistUrl: "/videos/path-aliases-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Structuring Monorepos with Modern Build Tooling",
            description: "Decoupling shared business models, data clients, and frontend delivery setups into atomic build spaces.",
            status: StatusVideo.Processing,
            image: "/images/monorepos-setup.png",
            masterPlaylistUrl: "/videos/monorepos-setup-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Vertical HTML Table Component Structures",
            description: "Flipping generic layout elements by inserting specialized header row indicators to present static properties safely.",
            status: StatusVideo.Processed,
            image: "/images/vertical-tables.png",
            masterPlaylistUrl: "/videos/vertical-tables-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Developing Adaptive Bitrate Streaming Applications",
            description: "Encoding multi-resolution assets dynamically to guarantee clean streaming performance for low bandwidth viewings.",
            status: StatusVideo.Canceled,
            image: "/images/abr-streaming.png",
            masterPlaylistUrl: "/videos/abr-streaming-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Deploying Fullstack Next.js Apps to Secure Linux Environments",
            description: "Managing memory footprint limits, container configurations, and environment variables safely inside server containers.",
            status: StatusVideo.Processed,
            image: "/images/linux-deployment.png",
            masterPlaylistUrl: "/videos/linux-deployment-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Integrating Autocomplete Tools in Modern IDE Environments",
            description: "Configuring settings preference overrides to achieve fast code formatting rules across shared file trees.",
            status: StatusVideo.Processed,
            image: "/images/ide-integration.png",
            masterPlaylistUrl: "/videos/ide-integration-stream.mp4",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    return (
        <VideoTableApp data={dataSample} />
    );
}