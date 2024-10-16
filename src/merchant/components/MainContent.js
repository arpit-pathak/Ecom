import React from 'react';
import ls from 'local-storage';

//test pages
import { MerchantRoutes } from '../../Routes.js';
import Products from './Products/Products.js';
import AddProducts from './Products/Add.js';
import Categories from './Categories/Listing.js';

//icons
import {
    AiOutlineDashboard,
    AiOutlineShoppingCart,
    AiOutlineShop,
    AiOutlineSetting,
    AiOutlineQuestionCircle,
} from 'react-icons/ai';
import {
    MdOutlineAssignmentReturn,
    MdOutlineKeyboardArrowDown,
    MdOutlineKeyboardArrowUp,
} from 'react-icons/md';
import {
    BsBoxSeam,
} from 'react-icons/bs';
import {
    TbTruckDelivery,
    TbReportAnalytics,
} from 'react-icons/tb';
import {
    RiBankLine,
} from 'react-icons/ri';
import { Notification } from './Ui/Notification.js';

class MainContent extends React.Component {
    constructor(props) {
        super(props);
        this.activeMenu = 0;

        this.appPage = props.appPage;
        this.lowerPage = props.appPage.toLowerCase();
        this.pageTitle = "Dashboard";
        this.togglePop = props.togglePop;

        //menu active
        console.log("lowerpage: ", this.lowerPage);
        if (this.lowerPage.indexOf("product") > -1) {
            this.activeMenu = 3.1;
            this.pageTitle = "My Products";
        }
        if (this.lowerPage.indexOf("category") > -1) {
            this.activeMenu = 3.3;
            this.pageTitle = "Categories";
        }

        //component state
        this.state = {
            errorMsg: "",
            haveError: false,
            //0 succss, 1 warning, 2 danger
            errorType: 0
        };
    }
    createCrumbs = () => {
        //default daashboard crumbs
        let action = (this.appPage).replace("-", " ");
        let previousPage = '#';
        let parentMenu = parseInt(this.activeMenu);
        //let selectedMenu = ls("activeMenu");
        if (parentMenu === 3) previousPage = MerchantRoutes.Products;

        let crumbs = <>
            <ul>
                <li><a href={MerchantRoutes.Landing}>Home {'>'}</a></li>
                <li>
                    {this.props.level > 1 ? <a href={previousPage}>{this.pageTitle} {'>'}</a> : <>{this.pageTitle}</>}
                </li>
                {this.props.level > 1 && <li>{action}</li>}
            </ul>
        </>

        //if dashboard
        if (this.lowerPage === "login")
            crumbs = <></>;


        return crumbs;
    }
    setError = (msg, etype) => {
        this.setState({
            errorMsg: msg,
            haveError: true,
            errorType: etype
        })
    }
    setActiveMenu = (e, url, idx) => {
        e.preventDefault();
        setTimeout(() => {
            document.getElementById("browser").href = url;
            document.getElementById("browser").click();
        }, 300);
    }
    render() {
        let mcClass = (this.props.level === 1) ? 'main-contents' : 'main-contents ws';
        let parentMenu = parseInt(this.activeMenu);//parseInt(ls("activeMenu"));
        let selectedMenu = this.activeMenu;//ls("activeMenu");
        //console.log("parent menu: ", parentMenu);

        //remove product storage
        if (this.lowerPage.indexOf("add-product") < 0
            && this.lowerPage.indexOf("edit-product") < 0) {
            ls.remove('m-add-product');
        }
        return <>
            {this.props.level === 1 && <>
                <div className='sidebar h-screen'>
                    <a href="/" id='browser' className='hidden'>for browser history</a>
                    <div className={parentMenu === 0 ? 'active' : ''}>
                        <div>
                            <AiOutlineDashboard />
                            Dashboard
                        </div>
                    </div>
                    <div className={parentMenu === 1 ? 'active' : ''}>
                        <div>
                            <AiOutlineShoppingCart />
                            Orders
                        </div>
                    </div>
                    <div className={parentMenu === 2 ? 'active' : ''}>
                        <div>
                            <MdOutlineAssignmentReturn />
                            Return
                        </div>
                    </div>
                    <div className={(parentMenu === 3) ? 'active parent' : ''}>
                        <div>
                            <BsBoxSeam />
                            Products
                            <MdOutlineKeyboardArrowDown className='has-child caret-down' />
                            <MdOutlineKeyboardArrowUp className='has-child caret-up' />
                        </div>

                        <ul>
                            <li className={selectedMenu === 3.1 ? 'orange-bg active-menu' : ''}><span
                                onClick={e => this.setActiveMenu(e, MerchantRoutes.Products, 3.1)}>My Products</span></li>
                            <li className={selectedMenu === 3.2 ? 'orange-bg active-menu' : ''}><span
                                onClick={e => this.setActiveMenu(e, MerchantRoutes.AddProduct, 3.2)}>Add Product</span></li>
                            <li className={selectedMenu === 3.3 ? 'orange-bg active-menu' : ''}><span
                                onClick={e => this.setActiveMenu(e, MerchantRoutes.Categories, 3.3)}>Categories</span></li>
                        </ul>
                    </div>
                    <div className={parentMenu === 4 ? 'active' : ''}>
                        <div>
                            <TbTruckDelivery />
                            Shipment
                            <MdOutlineKeyboardArrowDown className='has-child' />
                        </div>
                    </div>
                    <div className={parentMenu === 5 ? 'active' : ''}>
                        <div>
                            <AiOutlineShop />
                            Shop
                            <MdOutlineKeyboardArrowDown className='has-child' />
                        </div>
                    </div>
                    <div className={parentMenu === 6 ? 'active' : ''}>
                        <div>
                            <RiBankLine />
                            Finance
                        </div>
                    </div>
                    <div className={parentMenu === 7 ? 'active' : ''}>
                        <div>
                            <TbReportAnalytics />
                            Marketing Centre
                            <MdOutlineKeyboardArrowDown className='has-child' />
                        </div>
                    </div>
                    <div className={parentMenu === 8 ? 'active' : ''}>
                        <div>
                            <AiOutlineSetting />
                            Settings
                        </div>
                    </div>
                    <div className={parentMenu === 9 ? 'active' : ''}>
                        <div>
                            <AiOutlineQuestionCircle />
                            Support
                        </div>
                    </div>
                </div>
            </>}

            <div className={mcClass}>
                <div className='breadcrumbs'>
                    <div className='page-title'>
                        {this.pageTitle}
                    </div>

                    {this.createCrumbs()}
                </div>

                {/* {this.state.haveError && <>
                    {this.state.errorType === 0 &&
                        <div className='notification bg-green-400' onClick={e => this.setState({ haveError: false })}> {this.state.errorMsg}</div>
                    }

                    {this.state.errorType === 1 &&
                        <div className='notification bg-yellow-400' onClick={e => this.setState({ haveError: false })}> {this.state.errorMsg}</div>
                    }

                    {this.state.errorType === 2 &&
                        <div className='notification bg-red-400' onClick={e => this.setState({ haveError: false })}> {this.state.errorMsg}</div>
                    }
                </>} */}

                <Notification haveError={this.state.haveError} errorType={this.state.errorType} errorMsg={this.state.errorMsg} setState={this} isClass={true} />
                {parentMenu === 3 &&
                    <>
                        {this.lowerPage.indexOf('my') > -1 && <Products appPage={this.appPage} setError={this.setError} />}
                        {(this.lowerPage.indexOf('add') > -1 || this.lowerPage.indexOf('edit') > -1) && <AddProducts appPage={this.appPage} setError={this.setError} />}
                        {(this.lowerPage.indexOf('category-listing') > -1) && <Categories appPage={this.appPage} setError={this.setError} />}
                    </>
                }
            </div>
        </>
    }
}
export default MainContent;