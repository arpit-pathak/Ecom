import { CommonStrings } from "../../utils";

const NoAccess = () => {
    return (
        <div className="relative bg-white p-4 sm:p-6 rounded-sm overflow-hidden mb-8">
            <div className="relative">
                <h1 className="text-l md:text-l text-red-500 font-bold mb-1 text-center">{CommonStrings.PAGE_NO_PERMISSION}</h1>
            </div>
        </div>
    );
};

export default NoAccess;


