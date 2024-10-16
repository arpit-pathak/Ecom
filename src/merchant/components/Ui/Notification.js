//isclass false if functional component
//setState is this if functional and setHaveError if functional
export const Notification = ({ haveError, errorType, errorMsg, setState, isClass }) => {
    return <>
        {haveError && <>
            {errorType === 0 &&
                <div className='notification bg-green-400' onClick={e => (isClass) ? setState.setState({ haveError: false }) : setState(false)}> {errorMsg}</div>
            }

            {errorType === 1 &&
                <div className='notification bg-yellow-400' onClick={e => (isClass) ? setState.setState({ haveError: false }) : setState(false)}> {errorMsg}</div>
            }

            {errorType === 2 &&
                <div className='notification bg-red-400' onClick={e => (isClass) ? setState.setState({ haveError: false }) : setState(false)}> {errorMsg}</div>
            }
        </>}
    </>;
};