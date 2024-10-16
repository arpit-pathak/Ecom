import { useEffect, useState } from "react";
import "./pagination.css";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function CustomerPagination({
  entries,
  changeEntries,
  setCurrentPage,
  pages,
  currentPage,
  total,
  from,
}) {
  // console.log("pages",pages)
  // console.log("current page",currentPage)
  // console.log("total entries",total)
  // console.log("number of entries per page",entries)
  // console.log("changeEntries",changeEntries)
  // console.log("setCurrentPage",setCurrentPage)
  const [pageArray, setPageArray] = useState([]);
  //create an array with number of pages
  //if the number of entries, current page, or total entries changes, update the array
  useEffect(() => {
    //if current page = 1 and theres less than 3 pages. set
    let tempArr = [];
    if (parseInt(currentPage) === 1 && parseInt(pages) < 3) {
      console.log(pages);
      for (let i = 1; i <= pages; i++) {
        tempArr.push(i);
      }
      setPageArray(tempArr);
    }
    //if current page = 1 and there are
    else if (parseInt(currentPage) === 1 && parseInt(pages) > 3) {
      for (let i = 1; i <= 3; i++) {
        tempArr.push(i);
      }
      setPageArray(tempArr);
    }
    //if current page is not 1, and its not the last page
    else if (
      parseInt(currentPage) !== 1 &&
      parseInt(currentPage) !== parseInt(pages)
    ) {
      tempArr = [currentPage - 1, currentPage, currentPage + 1];
      setPageArray(tempArr);
    }
  }, [entries, currentPage, total]);
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <select
          className="border border-black rounded w-[45px] text-[12px]"
          value={entries}
          onChange={(e) => changeEntries(e.target.value)}
        >
          {total < 10 && (
            <option className="text-[10px]" value={total}>
              {total}
            </option>
          )}
          {total >= 10 && (
            <option className="text-[12px]" value={10}>
              10
            </option>
          )}
          {total >= 25 && <option value={25}>25</option>}
          {total >= 50 && <option value={50}>50</option>}
        </select>

        <span className="text-[12px]">Entries out of {total}</span>
      </div>
      {/* {console.log(currentPage)}
        {console.log(pageArray)} */}
      <div className="flex gap-4">
        {currentPage > 1 && (
          <div
            className="flex underline items-center text-[#2a2a2ab3] text-[14px]"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <IoIosArrowBack />
            <span>Prev</span>
          </div>
        )}
        {pageArray.map((page) => {
          return (
            <button
              value={page}
              onClick={() => setCurrentPage(page)}
              className={`${
                currentPage === page
                  ? "bg-[#F5AB35] text-white"
                  : "bg-[#F5AB351A] text-black"
              } px-[12px] py-[5px]  border-none rounded-lg`}
            >
              {page}
            </button>
          );
        })}
        {currentPage < pages ? (
          <button
            className="flex underline items-center text-[#2a2a2ab3] text-[14px]"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <span>Next</span>
            <IoIosArrowForward />
          </button>
        ) : (
          <div className="flex underline items-center text-[#2a2a2ab3] text-[14px]">
            <span className="w-[44.33px]"></span>
          </div>
        )}
      </div>
    </div>
  );
}
