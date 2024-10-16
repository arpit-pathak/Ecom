import React from 'react';
import ls from 'local-storage'

//comp
import Navbar from '../components/Navbar.js';
import PopupMessage from '../components/PopupMessage.js';

//images
import background from '../../assets/bg-landing.png';
import join from '../../assets/join.png';

//css
import '../../css/merchant.css';
import '../../css/animate.min.css';

import LoginForm from '../components/FormLogin.js';
import RegisterForm from '../components/FormRegister.js';
class Landing extends React.Component {
    constructor(props) {
        super(props);

        //this.validator = new srv();
        document.title = "uShop Merchant Portal";
        this.state = {
            appPage: props.page,

            //popup
            popupSeen: false,
            popupHead: "",
            popupMsg: "",
            popupResult: null,
        };
    }
    componentDidMount() { }
    togglePop = (msgHead, msg, result) => {
        this.setState({
            popupSeen: !this.state.popupSeen,
            popupHead: msgHead,
            popupMsg: msg,
            popupResult: result,
        });
    };
    changeForm = (which) => {
        this.setState({ appPage: which });
    }
    renderForm = () => {
        var which = (this.state.appPage === null) ? this.props.page : this.state.appPage;
        var currentForm = <div></div>;
        if (which === "login")
            currentForm = <LoginForm togglePop={this.togglePop} changeForm={this.changeForm} />;
        if (which === "register")
            currentForm = <RegisterForm togglePop={this.togglePop} changeForm={this.changeForm} />;
        return currentForm;
    };

    render() {
        var apiError = ls("apiError");
        if (apiError != null) ls.remove("apiError");
        var pageForm = this.renderForm();
        return (
            <main className="app app-merchant" >
                <Navbar theme="login" togglePop={this.togglePop} />
                <section className='landing-login' style={{ backgroundImage: `url(${background})` }}>
                    <div className='app-row grid lg:grid-cols-2 md:grid-cols-1'>
                        <div className='max-lg:hidden'><img alt='' src={join} className='mt-32 animate__animated animate__rubberBand' /></div>
                        <div className='form-container'>
                            {pageForm}
                        </div>
                    </div>
                </section>
                {this.state.popupSeen ? <PopupMessage toggle={this.togglePop} header={this.state.popupHead} message={this.state.popupMsg} result={this.state.popupResult} /> : null}
            </main>
        );
    }
}

export default Landing;
