import './style.css';

import {
    IoIosArrowBack,
    IoIosArrowForward
} from 'react-icons/io';

export default function Pagination({ entries, changeEntries, toPage, perPage, pages, page, total }) {
    let pagination = [...Array(pages).keys()];
    pagination = pagination.slice(((page - 3) < 0) ? 0 : (page - 3), page + 3);

    return <>
        <div className='pagination'>
            <div className='entry'>
                <select id='list-entry' defaultValue={entries} onChange={e => changeEntries(e)}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                </select>
                <span>Entries per page</span>
            </div>

            <div className='pager'>
                <div className=' inline-block '>
                    {page > 1 && <div className='controls' onClick={e => toPage(page - 1)}>
                        <IoIosArrowBack />
                        <span>Prev</span>
                    </div>
                    }

                    {total > 0 && <>
                        <ul>
                            {/* full pagination */}
                            {pagination.map((itm, idx) => <li className={(page === (itm + 1)) ? 'active' : ''} onClick={e => toPage(itm + 1)} key={itm + "|" + idx}>{itm + 1}</li>)}
                        </ul>
                    </>}

                    {page < pages && <div className='controls' onClick={e => toPage(page + 1)}>
                        <span>Next</span>
                        <IoIosArrowForward />
                    </div>}
                </div>
            </div>

            <div className='showing'>
                Showing {(perPage * page) - (perPage - 1)} to {(pages === page) ? (total) : (perPage * page)} of {total} entries
            </div>
        </div>
    </>;
}