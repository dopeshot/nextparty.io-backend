import { Injectable, NotFoundException } from '@nestjs/common'
import { Category } from 'src/category/entities/category.entity'
import { PaginationPayload } from './interfaces/paginationPayload.interface'

@Injectable()
export class SharedService {
    createPayloadWithPagination(
        documentCount: number,
        page: number,
        limit: number,
        items: any[],
    ): PaginationPayload<any> {
        const pageCount = Math.floor(documentCount / limit)

        if (page > pageCount) throw new NotFoundException()

        const previous = page - 1 >= 0 ? page - 1 : null
        const next = page + 1 < pageCount ? page + 1 : null

        return {
            paging: {
                documentCount,
                pageCount,
                ...(previous !== null && { previousPage: previous }),
                currentPage: page,
                ...(next && { nextPage: next }),
                itemsCount: items.length
            },
            items,
        }
    }
}
