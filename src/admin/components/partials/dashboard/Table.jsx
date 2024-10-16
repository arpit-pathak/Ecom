import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { classNames } from "../../../utils/Utils";
import { useState, useEffect, useRef } from "react";
import ls from "local-storage";
import { useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Define a default search input , returns the search value in a callback
function SearchFilter({ onSearchChange }) {
  const [value, setValue] = useState();
  const location = useLocation();

  const onChange = useAsyncDebounce((value) => {
    onSearchChange(value || undefined);
    ls("searchValue", value);
  }, 200);

  useEffect(() => {
    let currentPath = ls("currentPath");
    if (currentPath === location.pathname) {
      setValue(ls("searchValue") ?? "");
      onChange(ls("searchValue") ?? "");
    } else {
      ls("currentPath", location.pathname);
      ls("searchValue", "");
    }
  }, []);

  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-700">Search: </span>
      <input
        type="text"
        className="block w-full px-1 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />
    </label>
  );
}

// This is a custom filter UI for selecting, returns the filter value in a callback
export function SelectColumnFilter({
  column: { id, render },
  choices,
  onFilterChange,
  initialValue,
  custom = false,
  all = true,
}) {
  // Render a multi-select box
  return (
    <label className="flex gap-x-2 items-baseline">
      {custom ? (
        <span className="text-gray-700">{render} </span>
      ) : (
        <span className="text-gray-700">{render("Header")}: </span>
      )}
      <select
        className="block w-full px-1 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
        name={id}
        id={id}
        value={initialValue || ""}
        onChange={(e) => {
          onFilterChange(e.target.value || "");
        }}
      >
        {all && <option value="">All</option>}
        {choices &&
          choices.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </label>
  );
}

export function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : "unknown";

  return (
    <span
      className={classNames(
        "px-2 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        status.startsWith("active") || status.startsWith("approve")
          ? "bg-green-100 text-green-800"
          : null,
        status.startsWith("inactive") ? "bg-gray-400 text-gray-800" : null,
        status.startsWith("block") ? "bg-yellow-100 text-yellow-800" : null,
        status.startsWith("delete") ? "bg-orange-100 text-orange-800" : null,
        status.startsWith("ban") || status.startsWith("reject")
          ? "bg-red-100 text-red-800"
          : null
      )}
    >
      {status}
    </span>
  );
}

function Button({ children, className, ...rest }) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function PageButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export const DragDropTable = ({
  columns,
  data,
  fetchData,
  numOfPages,
  onSearchChange,
  defaultSearch = true,
  pagination = true,
  sortDataUpdate,
  idAccessor
}) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, //Only the rows for the active page
    canPreviousPage,
    nextPage,
    previousPage,
    pageOptions, //For different page number
    canNextPage,
    // pageCount,
    // gotoPage,
    setPageSize,
    state,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
      },
      manualPagination: true,
      autoResetPage: false,
      pageCount: numOfPages,
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    // If dropped outside the list, do nothing
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      data,
      result.source.index,
      result.destination.index
    );

    sortDataUpdate(reorderedItems, state.pageIndex + 1, state.pageSize);
  };

  const pageInfoRef = useRef({
    pageIndex: state.pageIndex, // Create a ref to store the previous page index
    pageSize: state.pageSize, // Create a ref to store the previous page size
  });
  const isInitialRender = useRef(true); // Flag to track the initial render
  const searchRef = useRef(null); // Create a ref to store the search callback

  useEffect(() => {
    // Check if the page index has changed and it's not the initial render
    if (
      (state.pageIndex !== pageInfoRef.current.pageIndex ||
        state.pageSize !== pageInfoRef.current.pageSize) &&
      !isInitialRender.current
    ) {
      fetchData(state.pageIndex + 1, state.pageSize, searchRef.current);
    }
    // Update the previous page index and reset the initial render flag
    pageInfoRef.current.pageIndex = state.pageIndex;
    pageInfoRef.current.pageSize = state.pageSize;
    isInitialRender.current = false;
  }, [fetchData, state.pageIndex, state.pageSize]);

  // Render the UI for table
  return (
    <>
      {/* Search & Filters */}
      <div className="sm:flex sm:gap-x-2">
        {defaultSearch && (
          <SearchFilter
            onSearchChange={(searchValue) => {
              searchRef.current = searchValue;
              onSearchChange(searchValue);
            }}
          />
        )}
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map(
            (column) =>
              column.Filter && (
                <div className="mt-2 sm:mt-0" key={column.id}>
                  {column.render("Filter")}
                </div>
              )
          )
        )}
      </div>

      {/* Table Header & Body */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 min-w-full overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <DragDropContext onDragEnd={onDragEnd}>
                <table
                  {...getTableProps()}
                  className="min-w-full divide-y divide-gray-200"
                >
                  <thead className="bg-gray-50">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps()}
                            scope="col"
                            className="group px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.Header === "Check Box" && (
                              <input
                                type="checkbox"
                                name="check_box"
                                className="w-4 h-4"
                              />
                            )}
                            {column.Header !== "Check Box" &&
                              column.render("Header")}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <tbody
                        {...getTableBodyProps()}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-white divide-y divide-gray-200"
                      >
                        {page.map((row, i) => {
                          prepareRow(row);
                          return (
                            <Draggable
                              key={row.original?.[idAccessor]}
                              draggableId={row.original?.[idAccessor].toString()}
                              index={i}
                            >
                              {(provided) => (
                                <tr
                                  {...row.getRowProps()}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    cursor: "move",
                                  }}
                                >
                                  <td
                                    {...provided.dragHandleProps}
                                    className="drag-handle px-3"
                                    title="Drag to reorder"
                                  >
                                    ::
                                  </td>
                                  {row.cells.map((cell) => {
                                    return (
                                      <>
                                        {cell.column.id !== "dragHandler" && (
                                          <td
                                            {...cell.getCellProps()}
                                            className="px-3 py-2 text-sm"
                                            role="cell"
                                          >
                                            {cell.render("Cell", {
                                              pageIndex: state.pageIndex,
                                            })}
                                          </td>
                                        )}
                                      </>
                                    );
                                  })}
                                </tr>
                              )}
                            </Draggable>
                          );
                        })}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
              Previous
            </Button>
            <Button onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-baseline">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{state.pageIndex + 1}</span>{" "}
                of <span className="font-medium">{pageOptions.length}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="mt-1 block w-full py-1 px-1 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={state.pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[10, 25, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <PageButton
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Previous</span>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </PageButton>
                <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                  <span className="sr-only">Next</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </PageButton>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Table = ({
  columns,
  data,
  fetchData,
  numOfPages,
  onSearchChange,
  defaultSearch = true,
  pagination = true,
}) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, //Only the rows for the active page
    canPreviousPage,
    nextPage,
    previousPage,
    pageOptions, //For different page number
    canNextPage,
    // pageCount,
    // gotoPage,
    setPageSize,
    state,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
      },
      manualPagination: true,
      autoResetPage: false,
      pageCount: numOfPages,
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  const pageInfoRef = useRef({
    pageIndex: state.pageIndex, // Create a ref to store the previous page index
    pageSize: state.pageSize, // Create a ref to store the previous page size
  });
  const isInitialRender = useRef(true); // Flag to track the initial render
  const searchRef = useRef(null); // Create a ref to store the search callback

  useEffect(() => {
    // Check if the page index has changed and it's not the initial render
    if (
      (state.pageIndex !== pageInfoRef.current.pageIndex ||
        state.pageSize !== pageInfoRef.current.pageSize) &&
      !isInitialRender.current
    ) {
      fetchData(state.pageIndex + 1, state.pageSize, searchRef.current);
    }
    // Update the previous page index and reset the initial render flag
    pageInfoRef.current.pageIndex = state.pageIndex;
    pageInfoRef.current.pageSize = state.pageSize;
    isInitialRender.current = false;
  }, [fetchData, state.pageIndex, state.pageSize]);

  // Render the UI for table
  return (
    <>
      {/* Search & Filters */}
      <div className="sm:flex sm:gap-x-2">
        {defaultSearch && (
          <SearchFilter
            onSearchChange={(searchValue) => {
              searchRef.current = searchValue;
              onSearchChange(searchValue);
            }}
          />
        )}
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map(
            (column) =>
              column.Filter && (
                <div className="mt-2 sm:mt-0" key={column.id}>
                  {column.render("Filter")}
                </div>
              )
          )
        )}
      </div>

      {/* Table Header & Body */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 min-w-full overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table
                {...getTableProps()}
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps()}
                          scope="col"
                          className="group px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.Header === "Check Box" && (
                            <input
                              type="checkbox"
                              name="check_box"
                              className="w-4 h-4"
                            />
                          )}
                          {column.Header !== "Check Box" &&
                            column.render("Header")}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-gray-200"
                >
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-3 py-2 text-sm"
                            role="cell"
                          >
                            {cell.render("Cell", {
                              pageIndex: state.pageIndex,
                            })}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
              Previous
            </Button>
            <Button onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-baseline">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{state.pageIndex + 1}</span>{" "}
                of <span className="font-medium">{pageOptions.length}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="mt-1 block w-full py-1 px-1 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={state.pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[10, 25, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <PageButton
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Previous</span>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </PageButton>
                <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                  <span className="sr-only">Next</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </PageButton>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
