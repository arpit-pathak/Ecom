import React from 'react';
import ls from 'local-storage';
import srv from 'simple-react-validator';
import Select from 'react-select';
//import { MerchantRoutes } from '../../Routes.js';
import { Constants } from '../utils/Constants.js';
import { ApiCalls, Apis } from '../utils/ApiCalls.js';
import { isBtnLoading } from '../../Utils.js';

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import onboarding from '../../assets/onboarding.png';
import successGif from '../../assets/success.gif';
import { MerchantRoutes } from '../../Routes.js';

class OnBoard extends React.Component {
    constructor(props) {
        super(props);

        this.validator = new srv();
        this.validator2 = new srv();
        this.pickupValidator = new srv();
        this.validator3 = new srv();

        this.generalSettings = JSON.parse(ls("settings"));
        //console.log(this.generalSettings);

        var user = ls(Constants.localStorage.user);
        if (user) user = JSON.parse(user);
        // console.log(user);

        var onboarding = ls("onboarding")
        if (onboarding) onboarding = JSON.parse(onboarding)
        //console.log(onboarding);

        this.state = {
            user: user,
            currentStep: (onboarding && onboarding.currentStep) ? onboarding.currentStep : 2,

            //form 1
            accountType: (onboarding) ? onboarding.accountType : '',
            businessName: (onboarding) ? onboarding.businessName : '',
            uen: (onboarding) ? onboarding.uen : '',
            my_url: (onboarding) ? onboarding.my_url : '',
            contact_number: user?.contact_number,

            //form 2
            isPickup: (onboarding) ? onboarding.isPickup : '',
            ownerName: (onboarding) ? onboarding.ownerName : '',
            postalCode: (onboarding) ? onboarding.postalCode : '',
            astate: (onboarding) ? onboarding.astate : '',
            city: (onboarding) ? onboarding.city : '',
            address: (onboarding) ? onboarding.address : '',

            ppostalCode: (onboarding) ? onboarding.ppostalCode : '',
            pastate: (onboarding) ? onboarding.pastate : '',
            pcity: (onboarding) ? onboarding.pcity : '',
            paddress: (onboarding) ? onboarding.paddress : '',

            //form 3
            bank: (onboarding) ? onboarding.bank : '',
            bankId: (onboarding) ? onboarding.bankId : '',
            fullName: (onboarding) ? onboarding.fullName : '',
            accountNumber: (onboarding) ? onboarding.accountNumber : '',

            //if onboarding is done
            isDone: false,
        };

        this.handleChange = this.handleChange.bind(this);
    }
    setAccountType = (e, val) => {
        this.setState({ accountType: val });
    }
    setPickup = (e, val) => {
        this.setState({ isPickup: val });
    }
    setBank = (val) => {
        this.setState({ bank: val.name, bankId: val.id });
    }

    //input on change
    handleChange = (e, which) => {
        if (which === "businessName") this.setState({ businessName: this.businessName.value })
        if (which === "uen") this.setState({ uen: this.uen.value })
        if (which === "my_url") this.setState({ my_url: this.my_url.value })
        if (which === "contact_number") this.setState({ contact_number: this.contact_number.value })

        if (which === "ownerName") this.setState({ ownerName: this.ownerName.value })
        if (which === "postalCode") this.setState({ postalCode: this.postalCode.value })
        if (which === "astate") this.setState({ astate: this.astate.value })
        if (which === "city") this.setState({ city: this.city.value })
        if (which === "address") this.setState({ address: this.address.value })

        if (which === "ppostalCode") this.setState({ ppostalCode: this.ppostalCode.value })
        if (which === "pastate") this.setState({ pastate: this.pastate.value })
        if (which === "pcity") this.setState({ pcity: this.pcity.value })
        if (which === "paddress") this.setState({ paddress: this.paddress.value })

        if (which === "fullName") this.setState({ fullName: this.fullName.value })
        if (which === "accountNumber") this.setState({ accountNumber: this.accountNumber.value })
    };
    backForm = (e) => {
        var onboarding = ls("onboarding");
        if (onboarding === null) return;

        onboarding = JSON.parse(onboarding)
        onboarding.currentStep = onboarding.currentStep - 1;

        ls("onboarding", JSON.stringify(onboarding));
        this.setState({ currentStep: onboarding.currentStep });
    }
    nextForm = (e) => {
        var currentStep = this.state.currentStep;
        if (currentStep === 2 && !this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return;
        }

        if (currentStep === 3) {
            if (!this.validator2.allValid()) {
                this.validator2.showMessages();
                this.forceUpdate();
                return;
            }

            if (this.state.isPickup === "No" && !this.pickupValidator.allValid()) {

                this.pickupValidator.showMessages();
                this.forceUpdate();
                return;

            }
        }

        if (currentStep === 4) {
            // if (this.state.bank === "") {
            //     this.props.togglePop("Oops, something went wrong.", "Please select a bank.", 'error');
            //     return;
            // }
            // if (!this.validator3.allValid()) {
            //     this.validator3.showMessages();
            //     this.forceUpdate();
            //     return;
            // }

            //submit
           this.submitOnboarding(e);
            return;
        }

        var state = this.state;
        state.currentStep = state.currentStep + 1;
        ls("onboarding", JSON.stringify(state));
        this.setState({ currentStep: state.currentStep });
    }
    submitOnboarding = (e) => {
        if (isBtnLoading(e.target)) return;


        var fd = new FormData();
        fd.append("contact_number", this.state.contact_number);

        fd.append("account_type", (this.state.accountType === "Corporate") ? 1 : 0);
        fd.append("name_field", this.state.businessName);
        fd.append("number_field", this.state.uen);
        // fd.append("shop_url", this.state.my_url);

        fd.append("owner_name", this.state.ownerName);
        fd.append("postal_code", this.state.postalCode);
        fd.append("state", this.state.astate);
        fd.append("city", this.state.city);
        fd.append("address", this.state.address);
        fd.append("is_pickup_address", this.state.isPickup === "No" ? false : true);

        if (this.state.isPickup === "No") {
            fd.append("pickup_postal_code", this.state.ppostalCode);
            fd.append("pickup_state", this.state.pastate);
            fd.append("pickup_city", this.state.pcity);
            fd.append("pickup_address", this.state.paddress);
        }

        fd.append("full_name", this.state.fullName);
        fd.append("account_number", this.state.accountNumber);
        fd.append("bank_id", this.state.bankId);

        ApiCalls(fd, Apis.onboarding, 'POST', {
            "Authorization": "Bearer " + this.state.user.access
        }, this.processRes, e.target);
    }
    processRes = (res, api, isRefreshed) => {
        if (isRefreshed) {
            this.forceUpdate();
            return;
        }

        var rdata = res.data;
        //console.log(rdata);

        if (rdata.result === "FAIL") {
            if ((rdata.message + "").toLowerCase().indexOf("merchant is already registered") > -1) {
                //udpate is_registered
                let user = this.state.user;
                user.is_registered = true;
                ls(Constants.localStorage.user, JSON.stringify(user));
                //show success
                this.setState({ isDone: true });
            }
            this.props.togglePop("Oops, something went wrong.", rdata.message, 'error');
            return;
        }

        //success
        if (api === Apis.onboarding) {
            //udpate is_registered
            let user = this.state.user;
            user.is_registered = true;
            ls(Constants.localStorage.user, JSON.stringify(user));
            //show success
            this.setState({ isDone: true });
        }

    }
    createForm = () => {
        var fields = <div></div>;
        var currentStep = this.state.currentStep;
        var banks = this.generalSettings?.bank;
        banks = banks.map(e =>{
            return {...e, value: e.name, label: e.name};
        })

        fields = <>
            <div className={(currentStep === 2) ? '' : 'hidden'}>
                <div className='site-input  mb-5'>
                    <label className=' text-sm font-medium'>Account Type :</label>
                    <div className='radio'>
                        <div className='radio-opt' onClick={(e) => this.setAccountType(e, "Individual")}>
                            {this.state.accountType === "Individual" ? <input type="radio" id='individual' name="account_type" value="Individual" defaultChecked={true} /> :
                                <input type="radio" className='cursor-pointer' id='individual' name="account_type" value="Individual" />}
                            <label htmlFor="individual" className='cursor-pointer'>Individual</label>
                        </div>

                        <div className='radio-opt' onClick={(e) => this.setAccountType(e, "Corporate")}>
                            {this.state.accountType === "Corporate" ? <input type="radio" id='corporate' name="account_type" value="Corporate" defaultChecked={true} /> :
                                <input type="radio" className='cursor-pointer' id='corporate' name="account_type" value="Corporate" />}
                            <label htmlFor="corporate" className='cursor-pointer'>Corporate</label>
                        </div>
                    </div>
                </div>

                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.businessName} name='business' type="text" placeholder='Business Name *' ref={node => (this.businessName = node)} onChange={e => this.handleChange(e, 'businessName')} />
                    </div>

                </div>
                
                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.uen} name='uen' type="text" placeholder='UEN' ref={node => (this.uen = node)} onChange={e => this.handleChange(e, 'uen')} />
                    </div>
                </div>
               {!this.state.user.contact_number && <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.contact_number} name='contact_number' type="text" placeholder='Contact Number' ref={node => (this.contact_number = node)} onChange={e => this.handleChange(e, 'contact_number')} />
                    </div>
                </div>}

                {/* <div className='site-input'>
                    <div className='field-container relative'>
                        <input className=' text-sm font-normal' value={this.state.my_url} name='my_url' type="text" placeholder='https://your-shop-url' ref={node => (this.my_url = node)} onChange={e => this.handleChange(e, 'my_url')} />
                        <label className=' chip-input text-[#797979]'>.ushop.market</label>
                    </div>
                </div> */}

                <div className='mb-5'>
                    {this.validator.message('Account type', this.state.accountType, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator.message('Business Name', this.state.businessName, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator.message('UEN', this.state.uen, 'required', { className: 'text-red-600 form-error' })}
                    {!this.state.user.contact_number && 
                    this.validator.message('Contact Number', this.state.contact_number,'required', { className: 'text-red-600 form-error' })}
                    {/* {this.validator.message('Shop URL', this.state.my_url, 'required', { className: 'text-red-600 form-error' })} */}
                </div>

                <button onClick={e => this.nextForm(e)} type='button' className='site-btn btn-default mr-auto ml-auto block w-1/3 mt-20' >
                    <span className='button__text text-lg'>Continue</span>
                </button>
            </div>

            <div className={(currentStep === 3) ? '' : 'hidden'}>
                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.ownerName} name='owner' type="text" placeholder='Owner Name *' ref={node => (this.ownerName = node)} onChange={e => this.handleChange(e, 'ownerName')} />
                    </div>

                </div>

                <div className='postal-field mb-5'>
                    <div className='site-input '>
                        <div className='field-container'>
                            <input className=' text-sm font-normal' value={this.state.postalCode} name='postal' type="text" placeholder='Postal Code *' ref={node => (this.postalCode = node)} onChange={e => this.handleChange(e, 'postalCode')} />
                        </div>

                    </div>


                    <div className='site-input '>
                        <div className='field-container'>
                            <input className=' text-sm font-normal' value={this.state.astate} name='astate' type="text" placeholder='State *' ref={node => (this.astate = node)} onChange={e => this.handleChange(e, 'astate')} />
                        </div>
                    </div>
                </div>


                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.city} name='city' type="text" placeholder='City *' ref={node => (this.city = node)} onChange={e => this.handleChange(e, 'city')} />
                    </div>

                </div>

                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.address} name='address' type="text" placeholder='Address *' ref={node => (this.address = node)} onChange={e => this.handleChange(e, 'address')} />
                    </div>

                </div>

                <div className='mb-5'>
                    {this.validator2.message('Owner Name', this.state.ownerName, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator2.message('postal code', this.state.postalCode, 'required|integer', { className: 'text-red-600 form-error' })}
                    {this.validator2.message('state', this.state.astate, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator2.message('city', this.state.city, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator2.message('address', this.state.address, 'required', { className: 'text-red-600 form-error' })}
                </div>

                <div className='site-input  mb-5 w-full inline-block'>
                    <label className=' text-sm font-medium float-left mr-3'>Set as Pickup Address :</label>
                    <div className='radio float-left'>
                        <div className='radio-opt' onClick={(e) => this.setPickup(e, "Yes")}>
                            {this.state.isPickup === "Yes" || this.state.isPickup === '' ? <input type="radio" id='yes' name="isPickup" value="No" defaultChecked={true} /> :
                                <input type="radio" id='yes' name="isPickup" value="No" />}
                            <label htmlFor="yes">Yes</label>
                        </div>

                        <div className='radio-opt' onClick={(e) => this.setPickup(e, "No")}>
                            {this.state.isPickup === "No" ? <input type="radio" id='no' name="isPickup" value="No" defaultChecked={true} /> :
                                <input type="radio" id='no' name="isPickup" value="No" />}
                            <label htmlFor="no">No</label>
                        </div>
                    </div>
                </div>

                <div className={(this.state.isPickup === 'No') ? '' : 'hidden'}>
                    <label className=' text-sm font-medium mb-5 block'>Enter Pickup Address </label>
                    <div className='postal-field mb-5'>
                        <div className='site-input '>
                            <div className='field-container'>
                                <input className=' text-sm font-normal' value={this.state.ppostalCode} name='ppostal' type="text" placeholder='Postal Code *' ref={node => (this.ppostalCode = node)} onChange={e => this.handleChange(e, 'ppostalCode')} />
                            </div>

                        </div>


                        <div className='site-input '>
                            <div className='field-container'>
                                <input className=' text-sm font-normal' value={this.state.pastate} name='pastate' type="text" placeholder='State *' ref={node => (this.pastate = node)} onChange={e => this.handleChange(e, 'pastate')} />
                            </div>
                        </div>
                    </div>

                    <div className='site-input mb-5'>
                        <div className='field-container'>
                            <input className=' text-sm font-normal' value={this.state.pcity} name='pcity' type="text" placeholder='City *' ref={node => (this.pcity = node)} onChange={e => this.handleChange(e, 'pcity')} />
                        </div>

                    </div>

                    <div className='site-input mb-5'>
                        <div className='field-container'>
                            <input className=' text-sm font-normal' value={this.state.paddress} name='paddress' type="text" placeholder='Address *' ref={node => (this.paddress = node)} onChange={e => this.handleChange(e, 'paddress')} />
                        </div>

                    </div>

                    <div className='mb-5'>
                        {this.pickupValidator.message('pickup postal code', this.state.ppostalCode, 'required|integer', { className: 'text-red-600 form-error' })}
                        {this.pickupValidator.message('pickup state', this.state.pastate, 'required', { className: 'text-red-600 form-error' })}
                        {this.pickupValidator.message('pickup city', this.state.pcity, 'required', { className: 'text-red-600 form-error' })}
                        {this.pickupValidator.message('pickup address', this.state.paddress, 'required', { className: 'text-red-600 form-error' })}
                    </div>
                </div>

                <div className='btns-container'>
                    <button onClick={e => this.backForm(e)} type='button' className='site-btn btn-border-default mr-4 w-1/4'>
                        <span className='text-lg'>Back</span>
                    </button>
                    <button onClick={e => this.nextForm(e)} type='button' value='Continue' className='site-btn btn-default w-1/4' >
                        <span className='text-lg'>Continue</span>
                    </button>
                </div>
            </div>

            <div className={(currentStep === 4) ? '' : 'hidden'}>
                <div className='site-input mb-5'>
                    <Select id="banks" name="banks" options={banks} placeholder="Select Bank"  onChange={e => this.setBank(e)} />
                </div>

                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.fullName} type="text" placeholder='Full Name' ref={node => (this.fullName = node)} onChange={e => this.handleChange(e, 'fullName')} />
                    </div>

                </div>

                <div className='site-input mb-5'>
                    <div className='field-container'>
                        <input className=' text-sm font-normal' value={this.state.accountNumber} type="text" placeholder='Account Number' ref={node => (this.accountNumber = node)} onChange={e => this.handleChange(e, 'accountNumber')} />
                    </div>

                </div>

                <div className=''>
                    {this.validator3.message('Full Name', this.state.fullName, 'required', { className: 'text-red-600 form-error' })}
                    {this.validator3.message('Account Number', this.state.accountNumber, 'required', { className: 'text-red-600 form-error' })}
                </div>

                <div className='btns-container mt-20'>
                    <button onClick={e => this.backForm(e)} type='button' className='site-btn btn-border-default w-1/4 mr-4' >
                        <span className='text-lg'>Back</span>
                    </button>
                    <button onClick={e => this.nextForm(e)} className='site-btn btn-default w-1/4' >
                        <span className='button__text text-lg'>Submit</span>
                    </button>
                </div>
            </div>
        </>;

        var frm = <div className='onboarding-form'>
            <div className=' mb-7 font-medium text-lg'>
                {(this.state.currentStep === 1) ? <span>Enter Email</span> : ''}
                {(this.state.currentStep === 2) ? <span>Enter Business Details</span> : ''}
                {(this.state.currentStep === 3) ? <span>Enter Supplier Details</span> : ''}
                {(this.state.currentStep === 4) ? <span>Enter Bank Details <span className=' font-normal'>(Optional, Fill in later)</span></span> : ''}
            </div>

            {fields}
        </div>;


        return frm;
    }
    render() {
        var currentForm = this.createForm();
        var done = this.state.user.is_registered;
        if (done === false) done = this.state.isDone;
        return <div className='onboarding'>

            <div className={done ? 'hidden' : ''}>
                <div className=' font-medium text-base mb-5'>Welcome to uShop, Please complete your account setup by filling out the details below</div>

                <div className='steps mb-2'>
                    <div className={this.state.currentStep >= 1 ? "step active" : "step"}>
                        <div className='indicator'>
                            {this.state.currentStep > 1 ? <FontAwesomeIcon icon={faCheck} /> : null}
                            {this.state.currentStep === 1 ? 1 : null}
                        </div>
                        <span>Email</span>
                    </div>
                    <div className={this.state.currentStep >= 2 ? "step active" : "step"}>
                        <div className='indicator'>
                            {this.state.currentStep > 2 ? <FontAwesomeIcon icon={faCheck} /> : null}
                            {this.state.currentStep === 2 ? 2 : null}
                        </div>
                        <span>Business Details</span>
                        <div className='connector'>
                        </div>
                    </div>
                    <div className={this.state.currentStep >= 3 ? "step active" : "step"}>
                        <div className='indicator'>
                            {this.state.currentStep > 3 ? <FontAwesomeIcon icon={faCheck} /> : null}
                            {this.state.currentStep === 3 ? 3 : null}
                        </div>
                        <span>Supplier Details</span>
                        <div className='connector'></div>
                    </div>
                    <div className={this.state.currentStep >= 4 ? "step active" : "step"}>
                        <div className='indicator'>
                            {this.state.currentStep === 4 ? 4 : null}
                        </div>
                        <span>Bank Details</span>
                        <div className='connector'></div>
                    </div>
                </div>

                <section className='tab'>
                    <div className='grid lg:grid-cols-2 md:grid-cols-1'>
                        <div className='max-lg:hidden'>
                            <span className='tab-header'>
                                More than 10,000 merchants are growing their business
                                by selling on uShop
                            </span>
                            <img alt='' src={onboarding} className='animate__animated animate__rubberBand' />
                        </div>
                        <div className='form-container'>
                            {currentForm}
                        </div>
                    </div>
                </section>
            </div>

            <div className={done ? '' : 'hidden'}>
                <div className=' text-center pt-10 pb-10 h-screen'>
                    <img src={successGif} alt='' className="modal-icon mb-5" />
                    <div className=' font-medium text-xl mb-3'>Registered Successfully!</div>

                    <div className=' font-normal text-base mb-3'>Now you can start selling your products on uShop</div>
                    <a href={MerchantRoutes.Landing} className='site-btn btn-default block w-1/5 mr-auto ml-auto' >
                        <span className='text-lg'>Go to Dashboard</span>
                    </a>
                </div>

            </div>
        </div>
    }
}
export default OnBoard;