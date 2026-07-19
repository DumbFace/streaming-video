'use client'
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type PaginationState,
    useReactTable
} from "@tanstack/react-table";

import { Button } from "@/src/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import React from "react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    pagination: PaginationState;
    onPaginationChange: (updater: any) => void;
}

export const BaseTable = <TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
}: DataTableProps<TData, TValue>) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: pageCount,

        state: {
            pagination,
        },
        onPaginationChange: onPaginationChange,
    });
    const [gotoIndex, setGotoIndex] = React.useState<number>(1);
    const handleGoToPage = () => {
        table.setPageIndex(gotoIndex - 1);
    }
    console.log("Re-render")
    return (
        <div>
            <div className="overflow-hidden rounded-md border">
                <Table className="min-w-150">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-center space-x-2 py-4">

                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    <>
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </>

                </div>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>


                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
                <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight />
                </Button>

                <Input
                    type="number"
                    min={1}
                    max={table.getPageCount() - 1}
                    placeholder="Go to..."
                    value={gotoIndex}
                    onChange={(e) => setGotoIndex(Number(e.target.value))}
                    className="w-20"
                />

                <Button onClick={handleGoToPage} size="sm">
                    Go
                </Button>
            </div>
        </div>
    );
};
