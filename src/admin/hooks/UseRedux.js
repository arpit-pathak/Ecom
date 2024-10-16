import { useSelector, useDispatch } from "react-redux";

const useRedux = (selector) => {
    const dispatch = useDispatch();
    const selectedData = useSelector(selector);
    return { dispatch, selectedData}
}
export default useRedux;