'use client'
import { BaseTableApp } from '@/src/components/base/table/base-table-app'
import { TypographyH1 } from '@/src/components/typographys/Typograpy'
import { Button } from '@/src/components/ui/button'
import { videoColumns } from '@/src/features/video/columns/columns'
import { Video } from '@/src/lib/domain/entities/video'
import { CirclePlus } from 'lucide-react'

interface IVdeoTableAppPros {
    data: Video[],
}

export const VideoTableApp = ({ data }: IVdeoTableAppPros) => {
    return (
        <div className="container w-auto mx-auto py-5 flex flex-col gap-y-5">
            <div className="container flex justify-between items-center">
                <TypographyH1 text='Video' />
                <Button>
                    <CirclePlus />
                    Add
                </Button>
            </div>

            <BaseTableApp
                columns={videoColumns()}
                data={data}
                pageCount={data.length}
                pagination={{ pageIndex: 0, pageSize: 10, }}
                onPaginationChange={() => { }}
            />
        </div>
    )
}
