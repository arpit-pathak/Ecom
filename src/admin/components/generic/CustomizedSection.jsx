// import { MdArrowDropDown } from "react-icons/md";

const CustomizedSection = ({ title, form, isOpen }) => {
    return (
      <details className="mb-4 bg-white rounded shadow group" open={isOpen}>
        <summary className="list-none flex flex-wrap items-center cursor-pointer focus-visible:outline-none focus-visible:ring focus-visible:ring-pink-500 rounded group-open:rounded-b-none group-open:z-[1] relative">
          <h3 className="flex flex-1 p-4 font-bold">{title}</h3>
          <div className="flex items-center justify-center w-10">
            <div className="ml-2 transition-transform origin-left border-8 border-transparent border-l-gray-700 
            group-open:rotate-90"></div>
          </div>
        </summary>
        <div className="p-4">
          {form}
        </div>
      </details>
    );
  };
  
  export default CustomizedSection;
  