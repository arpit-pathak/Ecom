import "./style.css";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Pagination({
  entries,
  changeEntries,
  toPage,
  pages,
  page,
  total,
  from,
}) {
  let pagination = [...Array(pages).keys()];
  pagination = pagination.slice(page - 3 < 0 ? 0 : page - 3, page + 3);

  return (
    <>
      <div className="pagination">
        <div className="entry">
          {from === "Products" ? (
            total >= 50 ? (
              <select
                id="list-entry"
                defaultValue={entries}
                onChange={(e) => changeEntries(e)}
              >
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            ) : total >= 30 ? (
              <select
                id="list-entry"
                defaultValue={entries}
                onChange={(e) => changeEntries(e)}
              >
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            ) : total >= 20 ? (
              <select
                id="list-entry"
                defaultValue={entries}
                onChange={(e) => changeEntries(e)}
              >
                <option value={20}>20</option>
              </select>
            ) : (
              <select
                id="list-entry"
                defaultValue={entries}
                onChange={(e) => changeEntries(e)}
              >
                <option value={total}>{total}</option>
              </select>
            )
          ) : total >= 50 ? (
            <select
              id="list-entry"
              defaultValue={entries}
              onChange={(e) => changeEntries(e)}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          ) : total >= 25 ? (
            <select
              id="list-entry"
              defaultValue={entries}
              onChange={(e) => changeEntries(e)}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          ) : total >= 10 ? (
            <select
              id="list-entry"
              defaultValue={entries}
              onChange={(e) => changeEntries(e)}
            >
              <option value={10}>10</option>
            </select>
          ) : (
            <select
              id="list-entry"
              defaultValue={entries}
              onChange={(e) => changeEntries(e)}
            >
              <option value={total}>{total}</option>
            </select>
          )}
          <span>Entries out of {total}</span>
        </div>

        <div className="orders_pages_pager">
          <div>
            {page > 1 && (
              <div className="controls" onClick={(e) => toPage(page - 1)}>
                <IoIosArrowBack />
                <span>Prev</span>
              </div>
            )}

            {total > 0 && (
              <>
                <ul>
                  {/* full pagination */}
                  {pagination.map((itm, idx) => (
                    <li
                      className={page === itm + 1 ? "active" : ""}
                      onClick={(e) => toPage(itm + 1)}
                      key={itm + "|" + idx}
                    >
                      {itm + 1}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {page < pages && (
              <div className="controls" onClick={(e) => toPage(page + 1)}>
                <span>Next</span>
                <IoIosArrowForward />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
