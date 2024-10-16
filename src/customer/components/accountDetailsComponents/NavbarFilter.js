import { Link } from "react-router-dom";
import uuid from "react-uuid";

export default function NavbarFilter({navLinks, handleActiveButton, activeIndex}) {

  return (
    <nav className="hidden sm:flex overflow-x-auto justify-between border-[1px] border-solid border-gray-300 rounded-[4px] sm:gap-2 md:gap-4 p-[10px] py-4 w-full">
      {navLinks.map((data, index) => {
        return (
          <div
            key={index}
            className="flex justify-center items-center  gap-[10px] "
          >
            <div
              key={uuid()}
              className="text-black whitespace-nowrap cp font-poppins font-[500px] sm:text-[14px] text-[16px] leading-6 py-[6px] px-[18px]"
              onClick={() => {
                handleActiveButton(index);
              }}
              style={{
                color: index === activeIndex ? "orange" : "black",
                borderBottom:
                  index === activeIndex ? "2px solid #F5AB35" : "none",
              }}
            >
              {data.text}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
