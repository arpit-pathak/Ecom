import ls from 'local-storage'
import { MerchantRoutes } from '../../Routes.js';
import { Constants } from './Constants.js';

export const loginRequired = (appPage) => {
    let user = ls(Constants.localStorage.user);
    if (user) user = JSON.parse(user);

    //check logged in
    const inDb = Constants.inDashboard.indexOf((appPage).toLowerCase()) > -1;
    if (user === null && inDb) window.location.replace(MerchantRoutes.Login);
}

export const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export const fileSizeCheck = (file, maxAllowedSize) => {
    const mb = 1024 * 1024;
    var fileSize = (file.size / mb).toFixed(2);
    // console.log("file size", fileSize)
    if (fileSize <= maxAllowedSize) return true;
    else return false;
  };