"use client";

import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Inbox,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

export type DataTableColumn<T> = {
  key: string;

  header: string;

  accessor?: keyof T;

  render?: (
    row: T,
    index: number,
  ) => React.ReactNode;

  sortable?: boolean;

  className?: string;
};

type SortDirection =
  | "asc"
  | "desc";

type DataTableProps<T> = {
  data: T[];

  columns: DataTableColumn<T>[];

  rowKey: (
    row: T,
    index: number,
  ) => string;

  loading?: boolean;

  emptyMessage?: string;

  onRowClick?: (
    row: T,
  ) => void;

  selectable?: boolean;

  selectedRows?: string[];

  onSelectionChange?: (
    ids: string[],
  ) => void;

  pageSize?: number;

  pagination?: boolean;

  className?: string;
};

export default function DataTable<
  T,
>({
  data,
  columns,
  rowKey,

  loading = false,

  emptyMessage = "No records found.",

  onRowClick,

  selectable = false,

  selectedRows = [],

  onSelectionChange,

  pageSize = 10,

  pagination = true,

  className = "",
}: DataTableProps<T>) {
  const [
    sortKey,
    setSortKey,
  ] = useState<
    string | null
  >(null);

  const [
    sortDirection,
    setSortDirection,
  ] = useState<
    SortDirection
  >("asc");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const sortedData =
    useMemo(() => {
      if (!sortKey) {
        return data;
      }

      const column =
        columns.find(
          (item) =>
            item.key ===
            sortKey,
        );

      if (
        !column?.accessor
      ) {
        return data;
      }

      return [
        ...data,
      ].sort((a, b) => {
        const aValue =
          a[
            column.accessor!
          ];

        const bValue =
          b[
            column.accessor!
          ];

        if (
          aValue ===
          bValue
        ) {
          return 0;
        }

        const result =
          String(
            aValue ?? "",
          ).localeCompare(
            String(
              bValue ?? "",
            ),
            undefined,
            {
              numeric: true,
              sensitivity:
                "base",
            },
          );

        return sortDirection ===
          "asc"
          ? result
          : -result;
      });
    }, [
      data,
      columns,
      sortKey,
      sortDirection,
    ]);

  const totalPages =
    pagination
      ? Math.max(
          1,
          Math.ceil(
            sortedData.length /
              pageSize,
          ),
        )
      : 1;

  const visibleData =
    pagination
      ? sortedData.slice(
          (currentPage -
            1) *
            pageSize,
          currentPage *
            pageSize,
        )
      : sortedData;

  const allVisibleSelected =
    visibleData.length >
      0 &&
    visibleData.every(
      (row, index) =>
        selectedRows.includes(
          rowKey(
            row,
            index,
          ),
        ),
    );

  const handleSort = (
    column: DataTableColumn<T>,
  ) => {
    if (
      !column.sortable
    ) {
      return;
    }

    if (
      sortKey ===
      column.key
    ) {
      setSortDirection(
        (value) =>
          value ===
          "asc"
            ? "desc"
            : "asc",
      );
    } else {
      setSortKey(
        column.key,
      );

      setSortDirection(
        "asc",
      );
    }
  };

  const toggleAll = () => {
    if (
      !onSelectionChange
    ) {
      return;
    }

    if (
      allVisibleSelected
    ) {
      const visibleIds =
        visibleData.map(
          (row, index) =>
            rowKey(
              row,
              index,
            ),
        );

      onSelectionChange(
        selectedRows.filter(
          (id) =>
            !visibleIds.includes(
              id,
            ),
        ),
      );
    } else {
      const ids = [
        ...selectedRows,
      ];

      for (
        let index = 0;
        index <
        visibleData.length;
        index++
      ) {
        const id =
          rowKey(
            visibleData[
              index
            ],
            index,
          );

        if (
          !ids.includes(
            id,
          )
        ) {
          ids.push(id);
        }
      }

      onSelectionChange(
        ids,
      );
    }
  };

  const toggleRow = (
    row: T,
    index: number,
  ) => {
    if (
      !onSelectionChange
    ) {
      return;
    }

    const id =
      rowKey(
        row,
        index,
      );

    if (
      selectedRows.includes(
        id,
      )
    ) {
      onSelectionChange(
        selectedRows.filter(
          (item) =>
            item !== id,
        ),
      );
    } else {
      onSelectionChange([
        ...selectedRows,
        id,
      ]);
    }
  };

  if (loading) {
    return (
      <div
        className={`overflow-hidden rounded-xl border bg-white ${className}`}
      >
        <div className="space-y-3 p-5">
          {Array.from({
            length: 6,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-lg bg-gray-100"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      allVisibleSelected
                    }
                    onChange={
                      toggleAll
                    }
                    aria-label="Select all rows"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
              )}

              {columns.map(
                (column) => {
                  const active =
                    sortKey ===
                    column.key;

                  return (
                    <th
                      key={
                        column.key
                      }
                      className={[
                        "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500",
                        column.className ??
                          "",
                      ].join(
                        " ",
                      )}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleSort(
                              column,
                            )
                          }
                          className="inline-flex items-center gap-1 hover:text-gray-900"
                        >
                          {
                            column.header
                          }

                          {active ? (
                            sortDirection ===
                            "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                },
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {visibleData.map(
              (row, rowIndex) => {
                const id =
                  rowKey(
                    row,
                    rowIndex,
                  );

                const selected =
                  selectedRows.includes(
                    id,
                  );

                return (
                  <tr
                    key={id}
                    onClick={() =>
                      onRowClick?.(
                        row,
                      )
                    }
                    className={[
                      "transition",
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50"
                        : "",
                      selected
                        ? "bg-slate-50"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3"
                        onClick={(
                          event,
                        ) =>
                          event.stopPropagation()
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleRow(
                              row,
                              rowIndex,
                            )
                          }
                          aria-label={`Select row ${id}`}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                    )}

                    {columns.map(
                      (
                        column,
                      ) => (
                        <td
                          key={
                            column.key
                          }
                          className={[
                            "whitespace-nowrap px-4 py-3 text-sm text-gray-700",
                            column.className ??
                              "",
                          ].join(
                            " ",
                          )}
                        >
                          {column.render
                            ? column.render(
                                row,
                                rowIndex,
                              )
                            : column.accessor
                              ? String(
                                  row[
                                    column.accessor
                                  ] ??
                                    "",
                                )
                              : null}
                        </td>
                      ),
                    )}
                  </tr>
                );
              },
            )}

            {visibleData.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable
                      ? 1
                      : 0)
                  }
                >
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Inbox className="h-5 w-5 text-gray-400" />
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination &&
        sortedData.length >
          0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {Math.min(
                (currentPage -
                  1) *
                  pageSize +
                  1,
                sortedData.length,
              )}{" "}
              to{" "}
              {Math.min(
                currentPage *
                  pageSize,
                sortedData.length,
              )}{" "}
              of{" "}
              {
                sortedData.length
              }
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  currentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page -
                          1,
                      ),
                  )
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                {currentPage} /{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page +
                          1,
                      ),
                  )
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}