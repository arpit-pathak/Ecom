
import React from "react";
import ls from 'local-storage';
import { Constants } from '../../utils/Constants.js';
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from '../../utils/Helper.js'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import withRouter from '../../../Utils.js';
import DatePicker from "react-datepicker";

import { AiFillWarning } from 'react-icons/ai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import successGif from '../../../assets/success.gif';
import { MdCalendarViewMonth } from 'react-icons/md';
import {
    FaEyeSlash, FaEye
} from 'react-icons/fa';

import Navbar from '../Navbar.js';
import { Sidebar } from '../Parts.js';
import "../../../css/merchant.css";
import { Modal } from '../../../customer/components/GenericComponents.js';
import { formatDate } from "../../utils/Helper.js";

import phoneIcon from "../../../assets/seller/phone.svg"
import mailIcon from "../../../assets/seller/email.svg"
import pwdIcon from "../../../assets/seller/password.svg"
import profileIcon from "../../../assets/seller/profile.svg"
import Loader, { PageLoader } from "../../../utils/loader.js";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        loginRequired(props.page);
        document.title = "Merchant | uShop";

        this.user = ls(Constants.localStorage.user);
        if (this.user) this.user = JSON.parse(this.user);

        this.state = {
            isSettingLoading: false,
            settingDetails: null,
            isShowMsg: false,
            message: "",
            isSubmittingVacationMode: false,
            isEditingPassword: false,
            isUpdatingPassword: false,

            showNewPwd: true,
            showConfirmPwd: true,
            showCurrentPwd: true,

            currentPwd: "",
            newPwd: "",
            confirmPwd: "",

            isRaisingDeleteRequest: false,
            isShowDeleteRequestPopup: false,
            isDeleteReqRaised: false
        }
    }

    maskPhoneNumber = (phno) => {

        let len = phno.length;
        let maskedNumber = "";

        for (let i = 0; i < len - 1; i++) {
            maskedNumber += "*";
        }
        maskedNumber += phno.charAt(len - 1);
        return maskedNumber;
    }

    maskEmail = (email) => {
        let maskedEmail = email.substring(0, 2);
        let atIndex = email.indexOf("@");

        for (let i = 2; i < atIndex; i++) {
            maskedEmail += "*";
        }
        maskedEmail += email.substring(atIndex, email.length)

        return maskedEmail;
    }

    processSettingsData = (res, api) => {
        if (res.data.result === "SUCCESS") {
            var data = res.data.data;
            // let maskedNumber = this.maskPhoneNumber(data.contact_number);
            let maskedNumber = data.contact_number;
            // let maskedEmail = this.maskEmail(data.email);
            let maskedEmail = data.email;
            let vacation = data.vacation_mode === "off" ? false : true;
            let chat = data.accept_chat === "off" ? false : true
            let startDate = data.start_date ? new Date(data.start_date) : null
            let endDate = data?.end_date && new Date(data?.end_date) >= new Date() ?  new Date(data.end_date) :null
            if(!endDate) startDate = null;
            
            data = {
                ...data,
                maskedNumber: maskedNumber,
                maskedEmail: maskedEmail,
                chat: chat,
                vacation: vacation,
                start_date: startDate,
                end_date: endDate
            }
            this.setState({
                settingDetails: data,
                isSettingLoading: false,
                isDeleteReqRaised: data?.requested_for_delete === 'Y' ? true: false
            })
        }
    }

    loadSettings = () => {
        this.setState({
            isSettingLoading: true
        })
        let fd = new FormData();

        ApiCalls(fd, Apis.settings, "GET", {
            "Authorization": "Bearer " + this.user.access,
        }, this.processSettingsData);
    }

    componentDidMount = () => {
        //fetch settings data on load
        this.loadSettings();
    }

    toggleVacationSwitch = (e) => {
        let settingsData = {
            ...this.state.settingDetails,
            vacation: e.target.checked,
            vacation_mode: e.target.checked ? "on" : "off"
        }
        this.setState({
            settingDetails: settingsData
        })
        if (!e.target.checked) this.toggleSwitchHandler(e.target.checked, "vacation")
    }

    selectsDateRange = (dates) => {
        try {
            const [start, end] = dates;
            let settingsData = {
                ...this.state.settingDetails,
                start_date: start,
                end_date: end
            }
            this.setState({
                settingDetails: settingsData
            })
        }
        catch (e) {
            console.log("Error message: " + e);
        }
    }

    toggleSwitchHandler = (value, type) => {
        this.setState({ isSubmittingVacationMode: true })
        let fd = new FormData();
        if (value && type === "vacation") {
          fd.append(
            "start_date",
            formatDate(this.state.settingDetails.start_date)
          );
          fd.append("end_date", formatDate(this.state.settingDetails.end_date));
        }

        if (type === "chat") {
            fd.append("accept_chat", value ? "on" : "off")
            fd.append("vacation_mode", this.state.settingDetails.vacation_mode)
        }
        else {
            fd.append("vacation_mode", value ? "on" : "off")
            fd.append("accept_chat", this.state.settingDetails.accept_chat)
        }

        ApiCalls(fd, Apis.settings, "POST", {
            "Authorization": "Bearer " + this.user.access,
        }, (res, api) => {
            if (res.data.result === "SUCCESS") {
                var data;

                if (type === "chat") {
                    data = {
                        ...this.state.settingDetails, accept_chat: value ? "on" : "off",
                        chat: value
                    }
                } else {
                    data = {
                        ...this.state.settingDetails, vacation_mode: value ? "on" : "off",
                        vacation: value
                    }
                }
                this.setState({
                    settingDetails: data
                })
            }

            this.setState({
                isShowMsg: true,
                message: res.data,
                isSubmittingVacationMode: false
            })

            setTimeout(() => {
                this.setState({
                    isShowMsg: false,
                    message: ""
                })
            }, 2000)
        });
    }

    handleFieldChange = (e, type) => {
        switch (type) {
            case 'current':
                this.setState({
                    currentPwd: e.target.value,
                    currentPwdErr: ""
                });
                break;
            case 'new':
                this.setState({
                    newPwd: e.target.value,
                    newPwdErr: ""
                });
                break;
            case 'confirm':
                this.setState({
                    confirmPwd: e.target.value,
                    confirmPwdErr: ""
                });
                break;
            default: console.log("default case")
        }
    }

    showPassword = () => {
        this.setState({
            isEditingPassword: true
        })
    }

    handlePwdUpdate = (res, api) => {
        if (res.data.result === "SUCCESS") {
            this.setState({
                isEditingPassword: false,
                currentPwd: "",
                newPwd: "",
                confirmPwd: "",
                confirmPwdErr: "",
                showNewPwd: true,
                showConfirmPwd: true,
                showCurrentPwd: true,
            })
        }

        this.setState({
            isUpdatingPassword: false,
            isShowMsg: true,
            message: res.data
        })

        setTimeout(() => {
            this.setState({
                isShowMsg: false,
                message: ""
            })
        }, 2000)
    }

    updatePassword = () => {
        let currentPwd = this.state.currentPwd,
            newPwd = this.state.newPwd,
            confirmPwd = this.state.confirmPwd;

        if (currentPwd && newPwd && confirmPwd) {
            if (newPwd === confirmPwd) {
                this.setState({
                    isUpdatingPassword: true
                })
                let fd = new FormData();
                fd.append("password", currentPwd)
                fd.append("new_password", newPwd)
                fd.append("confirm_password", confirmPwd)
                ApiCalls(fd, Apis.changePassword, "POST", {
                    "Authorization": "Bearer " + this.user.access,
                }, this.handlePwdUpdate)
            } else {
                this.setState({
                    confirmPwdErr: "New password and confirm password should be same"
                })
            }
        } else {
            if (!currentPwd) {
                this.setState({
                    currentPwdErr: "Please enter current password",
                })
            }
            if (!newPwd) {
                this.setState({
                    newPwdErr: "Please enter new password",
                })
            }
            if (!confirmPwd) {
                this.setState({
                    confirmPwdErr: "Please enter confirm password"
                })
            }
        }
    }

    raiseDeleteRequest = () => {
        this.toggleDeleteRequestPopup();
        this.setState({
            isRaisingDeleteRequest: true
        })
        let fd = new FormData();

        ApiCalls(fd, Apis.reqDeleteAccount, "GET", {
            "Authorization": "Bearer " + this.user.access,
        }, (res, api) => {
            console.log(res.data)
            this.setState({
                isRaisingDeleteRequest: false,
                isShowMsg: true,
                message: res.data
            })

            setTimeout(() => {
                this.setState({
                    isShowMsg: false,
                    message: ""
                })
            }, 2000)
        })
    }

    toggleDeleteRequestPopup = () => {
        this.setState({
            isShowDeleteRequestPopup: !this.state.isShowDeleteRequestPopup
        })
    }

    msgPopup = () => {
        return <Modal
            width="w-4/12"
            open={this.state.isShowMsg}
            children={
                <div>
                    <span className="flex justify-end cp"
                        onClick={() => this.setState({ isShowMsg: false })}>
                        <FontAwesomeIcon icon={faXmark} />
                    </span>
                    {this.state.message.result === 'SUCCESS' ?
                        <img src={successGif} alt='' className="modal-icon" />
                        : <AiFillWarning className='modal-icon' />}
                    <div className='poptitle font-medium text-center'>
                        {this.state.message.message}
                    </div>
                </div>}
        />;
    }

    deleteAccPopup = () => {
        return <Modal
            width="w-4/12"
            open={this.state.isShowDeleteRequestPopup}
            children={
                <div>
                    <p className='text-lg font-semibold mb-3'>Request for Delete</p>
                    <hr />
                    <p className='text-sm my-4 pr-7 mb-4'>Are you sure you want to raise request to delete your account?
                    </p>
                    <div className='flex justify-end mt-10'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5'
                            disabled={this.state.isRaisingDeleteRequest}
                            onClick={this.raiseDeleteRequest}>
                            {this.state.isRaisingDeleteRequest ? <Loader /> : "Confirm"}
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20 
                        disabled:border-[#FFD086] disabled:cursor-default'
                            onClick={this.toggleDeleteRequestPopup}
                            disabled={this.state.isRaisingDeleteRequest} >
                            Cancel
                        </button>
                    </div>
                </div>}
        />;
    }

    render() {
        let mcClass = (this.props.level === 1) ? 'main-contents' : 'main-contents ws';

        return <main className="app-merchant merchant-db" >
            <Navbar theme="dashboard" />
            <Sidebar selectedMenu={7} />
            <div className={mcClass}>
                <div className='breadcrumbs'>
                    <div className='page-title !pb-0'>Settings</div>
                    <ul>
                        <li><a href={MerchantRoutes.Landing}>Home {'>'}</a></li>

                        {this.props.level > 0 && <li className="font-bold">Settings</li>}
                    </ul>
                </div>

                {this.state.isSettingLoading ?
                    <PageLoader color="#f5ab35" width="35px" height="35px" />
                    :
                    <div className="listing-page my-5">
                        {/* accounts section */}
                        <div className="p-4 bg-white mb-4 h-11/12">
                            <p className="font-semibold mb-8 mt-3">Account</p>

                            {/* profile */}
                            <div className="flex my-4">
                                <div className="flex gap-2 items-center w-2/6">
                                    <img src={profileIcon} alt="" height={20} width={20} />
                                    <p className="text-sm font-semibold">My Profile</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-sm text-[#828282]">{this.state.settingDetails?.business_name ?? ""}</p>
                                    {/* <button
                                        className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 hover:bg-amber-500 
                                disabled:opacity-50 disabled:cursor-default'
                                    >
                                        Edit
                                    </button> */}
                                </div>
                            </div>
                            <hr />

                            {/* phone */}
                            <div className="flex my-4">
                                <div className="flex gap-2 items-center w-2/6">
                                    <img src={phoneIcon} alt="" height={20} width={20} />
                                    <p className="text-sm font-semibold">Phone</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-sm text-[#828282]">{this.state.settingDetails?.maskedNumber ?? ""}</p>
                                    {/* <button
                                        className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 hover:bg-amber-500 
                                disabled:opacity-50 disabled:cursor-default'
                                    >
                                        Edit
                                    </button> */}
                                </div>
                            </div>
                            <hr />


                            {/* Email */}
                            <div className="flex my-4">
                                <div className="flex gap-2 items-center w-2/6">
                                    <img src={mailIcon} alt="" height={20} width={20} />
                                    <p className="text-sm font-semibold">Email</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-sm text-[#828282]">{this.state.settingDetails?.maskedEmail ?? ""}</p>
                                    {/* <button
                                        className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 hover:bg-amber-500 
                                disabled:opacity-50 disabled:cursor-default'
                                    >
                                        Edit
                                    </button> */}
                                </div>
                            </div>
                            <hr />

                            {/* password */}
                            <div className="flex my-4">
                                <div className="flex gap-2 items-center w-2/6">
                                    <img src={pwdIcon} alt="" height={20} width={20} />
                                    <p className="text-sm font-semibold">Login Password</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-sm text-[#828282] w-4/5">We recommend that you change your passwords regularly to improve security</p>
                                    <button
                                        className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 hover:bg-amber-500 
                                disabled:opacity-50 disabled:cursor-default'
                                        onClick={this.state.isEditingPassword ? this.updatePassword : this.showPassword}
                                    >
                                        {this.state.isUpdatingPassword ? <Loader /> :
                                            this.state.isEditingPassword ? "Save" : "Edit"}
                                    </button>
                                </div>
                            </div>

                            {this.state.isEditingPassword && <>
                                <div className="flex justify-between items-center h-11 border pr-5 mb-2 rounded">
                                    <input type={this.state.showCurrentPwd ? "password" : "text"}
                                        name="current_pwd" id="current_pwd" value={this.state.currentPwd}
                                        onChange={(e) => this.handleFieldChange(e, "current")}
                                        placeholder='Current Password' className="!border-0" />
                                    {this.state.showCurrentPwd ?
                                        <FaEye color="#797979" onClick={() => this.setState({ showCurrentPwd: false })} /> :
                                        <FaEyeSlash color="#797979" onClick={() => this.setState({ showCurrentPwd: true })} />}
                                </div>
                                <p className='text-red-600 mb-6 text-sm'>{this.state.currentPwdErr}</p>

                                <div className="flex justify-between items-center h-11 border pr-5 mb-2 rounded">
                                    <input type={this.state.showNewPwd ? "password" : "text"}
                                        name="new_pwd" id="new_pwd" value={this.state.newPwd}
                                        onChange={(e) => this.handleFieldChange(e, "new")}
                                        placeholder='New Password' className="!border-0" />
                                    {this.state.showNewPwd ?
                                        <FaEye color="#797979" onClick={() => this.setState({ showNewPwd: false })} /> :
                                        <FaEyeSlash color="#797979" onClick={() => this.setState({ showNewPwd: true })} />}
                                </div>
                                <p className='text-red-600 mb-6 text-sm'>{this.state.newPwdErr}</p>

                                <div className="flex justify-between items-center h-11 border pr-5 mb-2 rounded">
                                    <input type={this.state.showConfirmPwd ? "password" : "text"}
                                        name="confirm_pwd" id="confirm_pwd" value={this.state.confirmPwd}
                                        onChange={(e) => this.handleFieldChange(e, "confirm")}
                                        placeholder='Confirm Password' className="!border-0" />
                                    {this.state.showConfirmPwd ?
                                        <FaEye color="#797979" onClick={() => this.setState({ showConfirmPwd: false })} /> :
                                        <FaEyeSlash color="#797979" onClick={() => this.setState({ showConfirmPwd: true })} />}
                                </div>
                                <p className='text-red-600 mb-4 text-sm'>{this.state.confirmPwdErr}</p>

                            </>}
                        </div>



                        {/* basic settings section */}
                        <div className="p-4 bg-white mb-4 h-11/12">
                            <p className="font-semibold mb-8 my-3">Basic Settings</p>

                            {/* vacation mode */}
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold">Vacation Mode</p>
                                <label className="switch !top-0">
                                    <input type="checkbox" id="variantsSwitch" defaultChecked={this.state.settingDetails?.vacation}
                                        onChange={(e) => this.toggleVacationSwitch(e)} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <p className="text-xs text-[#828282] w-11/12 pb-5">Turn on vacation mode to prevent buyers from placing new orders.
                                Existing orders must still be fulfilled. It may take up to 1 hour to take effect.
                            </p>

                            {this.state.settingDetails?.vacation ?
                                <div className="flex justify-between">
                                    <div id="date-picker" className='flex flex-row justify-between px-2 items-center w-2/6'>
                                        <DatePicker
                                            minDate={new Date()}
                                            startDate={this.state.settingDetails?.start_date}
                                            endDate={this.state.settingDetails?.end_date}
                                            dateFormat="d/M/yyyy"
                                            selectsRange
                                            onChange={this.selectsDateRange}
                                            placeholderText="From Date - To Date"
                                            monthsShown={2}
                                        />
                                        <MdCalendarViewMonth color='#828282' />
                                    </div>
                                    <button
                                        className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 hover:bg-amber-500 
                                disabled:opacity-50 disabled:cursor-default'
                                        onClick={(e) => this.toggleSwitchHandler(true, "vacation")}
                                    >
                                        {this.state.isSubmittingVacationMode ? <Loader /> : "Submit"}
                                    </button>
                                </div> : null}
                        </div>


                        {/* chat settings section */}
                        <div className="p-4 bg-white mb-10 h-11/12">
                            <p className="font-semibold mb-8 my-3">Chat Settings</p>

                            {/* accept chat */}
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold">Accept chat from profile page</p>
                                <label className="switch !top-0">
                                    <input type="checkbox" id="variantsSwitch" defaultChecked={this.state.settingDetails?.chat}
                                        onChange={(e) => this.toggleSwitchHandler(e.target.checked, "chat")} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <p className="text-xs text-[#828282] w-11/12 pb-8">Turn on to allow people to start a chat with
                                you via your profile page. Recommended for sellers.
                            </p>


                            {/* blocked users */}
                            {/* <p className="text-sm font-semibold mb-2">Blocked users</p>
                            <p className="text-xs text-[#828282] w-11/12 pb-4">
                                List of users you have blocked from chats
                            </p> */}
                        </div>


                        {/* account deletion request section */}
                        <div className="p-4 bg-white mb-10 h-11/12">
                            <p className="font-semibold mb-5 my-3">Account Deletion</p>

                            {/* accept chat */}
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold">Raise Request</p>
                                <button
                                    className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-4 hover:bg-amber-500
                                    disabled:opacity-50  disabled:cursor-default'
                                    onClick={this.toggleDeleteRequestPopup}
                                    disabled={this.state.isDeleteReqRaised}
                                >
                                    Request Delete
                                </button>
                            </div>
                            <p className="text-xs text-[#828282] w-11/12 pb-5">
                                {this.state.isDeleteReqRaised ?
                                    "Delete request has been raised already" :
                                    "Request can be raised to delete your account"}
                            </p>
                        </div>
                    </div>}
            </div>
            {this.state.isShowDeleteRequestPopup && this.deleteAccPopup()}
            {this.state.isShowMsg && this.msgPopup()}
        </main>;
    }
}

export default withRouter(Settings);