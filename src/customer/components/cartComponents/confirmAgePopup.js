import { Modal } from '../GenericComponents.js';


export default function ShowConfirmAgePopup({
    showPopup,
    confirmPlacingOrder,
    cancelPlacingOrder
}) {
   
    return (
        <>
            <Modal
                width="w-5/12 max-sm:w-3/4"
                open={showPopup}
                children={<div>
                    <p className='text-lg font-semibold mb-3'>Please confirm your age</p>
                    <hr />
                    <p className='text-sm my-4 pr-7 mb-4'>
                        It is an offence to buy liquor under the age of 18 years. The offence is punishable by a fine
                        not exceed $10,000.
                    </p>
                   
                    <hr />
                    <div className='flex justify-end mt-5'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-3 mr-5'
                            onClick={confirmPlacingOrder}>
                            I AM OVER 18
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35]
                         h-8 px-2'
                            onClick={cancelPlacingOrder}>
                           I AM NOt 18 YET
                        </button>
                    </div>
                </div>}
            />
        </>
    );
}