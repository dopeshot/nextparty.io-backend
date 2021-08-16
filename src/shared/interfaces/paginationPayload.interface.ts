export interface PaginationPayload<T> {
    paging: {
        documentCount: number
        pageCount: number
        previous?: number
        currentPage: number
        next?: number,
        itemsCount: number
    },
    items: T[]
}