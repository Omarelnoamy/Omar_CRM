export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export function buildPagination(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
    hasMore: page * pageSize < total,
  };
}
