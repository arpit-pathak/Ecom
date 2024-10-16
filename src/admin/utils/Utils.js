// Description: This file contains all the utility functions used in the admin panel.
export function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const reverseStatusMappings = {
    'active': '1',
    'inactive': '2',
    'block': '3',
    'delete': '4',
    'banned': '5'
};

const roleMapping = {
    1: 'Customer',
    2: 'Seller',
    3: 'Admin',
    4: 'Super Admin',
};

export function ReverseStatusMapping(status) {
    return reverseStatusMappings[status?.toLowerCase()];
}

export function RoleMapping(role) {
    return roleMapping[role] || 'Customer';
}


export function DateConverter(date, type) {
    if (!date) {
        return "None";
    }
    const format_date = new Date(date);

    const options = {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };

    if (type === "Only Date") {
        delete options.hour;
        delete options.minute;
    }

    const formatter = new Intl.DateTimeFormat('en-SG', options);
    const singaporeTime = formatter.format(format_date);

    return singaporeTime
}

export function buildQueryParams(page, records, search = null) {
    const queryParams = {
        page,
        records,
    };

    if (search !== null) {
        queryParams.search = search;
    }

    return queryParams;
}

export function ConvertStringToDate(date) {
    if (typeof date !== 'string') {
        return new Date();
    }
    const [day, month, year] = date.split('/').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return parsedDate;
}

export function ToggleVisibility(element, show = true) {
    if (element) {
        if (show) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }
}

export function ConvertDateToString(date) {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString("en-SG");
}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }