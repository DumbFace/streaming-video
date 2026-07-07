import { StatusVideo, Video } from "@/src/lib/domain/entities/video";
import { ColumnDef } from "@tanstack/react-table";


export const videoColumns = (): ColumnDef<Video>[] => {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "image",
      header: "Thumbnail",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const statusValue = getValue<StatusVideo>();
        return StatusVideo[statusValue];
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
    },
  ];
};