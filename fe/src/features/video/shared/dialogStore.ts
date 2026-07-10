import { create } from "zustand";
import { VideoFormData } from "../components/dialog";
import { Dialog } from "radix-ui";
import { DefaultPagination } from "@/src/features/video/constants/pagination.constant";
import {
  PaginationDefaultOptions,
  PaginationTableState,
} from "@tanstack/react-table";

export const DialogMode = {
  Add: "add",
  Edit: "edit",
  Delete: "delete",
  Close: "close",
} as const;

export type DialogModeType = (typeof DialogMode)[keyof typeof DialogMode];

export type DialogState = {
  state: DialogModeType;
  isOpen: boolean;
  setState: (state: DialogModeType) => void;
};

export type DialogVideoState = {
  data?: VideoFormData;
  setData: (newData: VideoFormData) => void;
} & DialogState &
  PaginationTableState &
  PaginationDefaultOptions;

export const useVideoDialogStore = create<DialogVideoState>((set) => ({
  state: DialogMode.Add,
  isOpen: false,
  data: undefined,
  pagination: {
    pageIndex: DefaultPagination.PageIndex,
    pageSize: DefaultPagination.PageSize,
  },
  onPaginationChange: (newPagination) =>
    set((state) => ({
      pagination:
        typeof newPagination === "function"
          ? newPagination(state.pagination)
          : newPagination,
    })),
  setData: (newData) =>
    set(() => {
      return { data: newData };
    }),

  setState: (newState) =>
    set(() => {
      if (newState === DialogMode.Close) {
        return { state: DialogMode.Close, isOpen: false, data: undefined };
      }

      return { state: newState, isOpen: true };
    }),
}));
