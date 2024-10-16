import '../../css/navbar.css';

import React from 'react';
import ls from 'local-storage'
import { MerchantRoutes } from '../../Routes.js';
import { Constants } from '../utils/Constants';

import success from '../../assets/success.gif';
class SignupSuccess extends React.Component {
    constructor(props) {
        super(props);

        var user = ls(Constants.localStorage.user);
        if (user) user = JSON.parse(user);

        this.state = {
            userJwt: null,
            user: user,
            count: 6,
            redirected: false
        };
    }

    countDown = (e) => {
        if (this.timeoutCounter != null) clearTimeout(this.timeoutCounter);
        this.timeoutCounter = setTimeout(() => {
            var curcount = this.state.count - 1;
            this.setState({
                count: curcount
            })
            if (curcount === 0) {
                ls(Constants.localStorage.fromPage, "login");
                window.location.replace(MerchantRoutes.Landing);
            }
        }, 1000)
    }

    render() {
        if (this.state.count > 0) {
            this.countDown();
        }
        return <div className='success-signup'>
            <img src={success} alt='' />
            <div className=' text-2xl font-medium mb-3'>Sign Up Successful!</div>

            <div className='text-base font-normal mb-3'>
                You have successfully created a uShop account <br></br>
                with the number {this.state.user.contact_number}
            </div>
            <div className='text-base font-normal'>
                You will be redirected to the Seller centre in {this.state.count} seconds
            </div>
        </div>;
    }
}
export default SignupSuccess;