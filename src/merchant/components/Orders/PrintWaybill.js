
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import ls from 'local-storage';
import { Constants } from '../../utils/Constants.js';

export const callingPrintWaybill = (isMultiple, orderIds, setIsPrintingWaybill, index) => {
    setIsPrintingWaybill(true, index);
    let user = ls(Constants.localStorage.user);
    if (user) user = JSON.parse(user);

    let fd = new FormData();

    // user must be a merchant
    fd.append("is_multiple", isMultiple);
    fd.append("order_id", orderIds);

        ApiCalls(fd, Apis.sellerDownloadWaybill, "POST", {
            "Authorization": "Bearer " + user.access,
            'Content-Type': 'application/pdf',
        }, (res, api) => {
            var link = document.createElement('a');
            link.href = res.data.data.waybill;
            link.target = "_blank";
            link.click();

           setIsPrintingWaybill(false, index);
        });
}
