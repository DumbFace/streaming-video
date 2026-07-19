import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/src/components/ui/field";
import { Progress } from "@/src/components/ui/progress";
import { StatusVideoClass } from "@/src/features/video/components/badge-color";
import { VideoFormData } from "@/src/features/video/components/dialog";
import { DialogMode, useVideoDialogStore } from "@/src/features/video/shared/dialogStore";
import { IVideo, StatusVideo } from "@streaming-video/shared";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Link2, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";

export const videoColumns = (): ColumnDef<IVideo>[] => {
  const { setState, setData } = useVideoDialogStore((store) => store);

  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },

    {
      accessorKey: "title",
      header: "title".toUpperCase(),
    },
    {
      accessorKey: "description",
      header: "Description".toUpperCase(),
    },
    {
      accessorKey: "masterPlaylistUrl",
      header: "Url".toUpperCase(),
      cell: ({ row }) => {
        const url = row.original.masterPlaylistUrl;
        return url ? (<Link href={url}> <Link2 /> </Link>) : (<></>)
      }
    },
    {
      accessorKey: "status",
      header: "Status".toUpperCase(),
      cell: ({ row }) => {
        const statusValue = row.original.status;
        const statusValueAsString = StatusVideo[statusValue].toUpperCase();
        return <Badge className={StatusVideoClass[statusValue as StatusVideo]}>{statusValueAsString}</Badge>;
      },
    },
    {
      accessorKey: "totalChunks",
      header: "Progress".toUpperCase(),
      cell: ({ row }) => {
        const totalChunk = row.original.totalChunks;
        const currentProgress = row.original.segments?.length ?? 0;

        const data = Math.round(currentProgress / totalChunk * 100);
        return (
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="progress-upload">
              <span className="ml-auto">{data}%</span>
            </FieldLabel>
            <Progress value={data} className="w-full max-w-sm" />
          </Field>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date".toUpperCase(),
      cell: ({ getValue }) => {
        const date = getValue<string>();
        return format(new Date(date), 'dd-MM-yyyy hh:mm:ss');
      }
    },
    {
      id: "actions",
      cell: ({ row, getValue }) => {
        const data: VideoFormData = {
          id: (row.original as any)._id,
          title: row.original.title,
          description: row.original.description,
          videoFile: []
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setData(data)
                setState(DialogMode.Edit)
              }}>
                <SquarePen />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setData(data)
                setState(DialogMode.Delete)
              }}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];
};

