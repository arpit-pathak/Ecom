import { Modal } from '../../../customer/components/GenericComponents.js';


export default function AllowProductDuplication({
    showPopup,
    closePopup,
    onAllow,
}) {
   
    return (
        <>
            <Modal
                width="w-5/12 max-sm:w-3/4"
                open={showPopup}
                children={<div>
                    <p className='text-lg font-semibold mb-3'>Product Duplication</p>
                    <hr />
                    <p className='text-sm my-4 pr-7 mb-4'>
                        You have already added product with same name. Are you sure to continue ?
                    </p>
                   
                    <hr />
                    <div className='flex justify-end mt-5'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-3 mr-5'
                            onClick={onAllow}>
                            Yes
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35]
                         h-8 px-2'
                            onClick={closePopup}>
                           No
                        </button>
                    </div>
                </div>}
            />
        </>
    );
}