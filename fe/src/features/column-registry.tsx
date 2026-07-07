// src/components/base/table/column-registry.ts
import { videoColumns } from "@/src/features/video/columns/columns";

export const columnRegistry = {
    video: videoColumns,
} as const;

export type TableFeatureType = keyof typeof columnRegistry;