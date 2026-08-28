export type ID = string;

export type ISODateString = string;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

export type SelectOption<
  TValue extends string | number = string,
> = {
  label: string;
  value: TValue;
};

export type SortDirection =
  | "asc"
  | "desc";

export type SortConfig = {
  field: string;
  direction: SortDirection;
};