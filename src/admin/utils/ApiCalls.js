import axios from 'axios';

// Generic Api Call for both json and form data, method param should be string & CAPS
export const ApiCalls = async (url, method, data, isJson = true, token=null) => {
    const headers = isJson
      ? { 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/x-www-form-urlencoded' };

    let options = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    switch (method) {
        case 'GET':
            options = {
                url:url,
                method:method,
                headers:headers,
                params: data
            }
            break;
        case 'POST':
            options = {
                url:url,
                method:method,
                headers:headers,
                data: isJson ? JSON.stringify(data) : data,
            }
            break;
        case 'DELETE':
            options = {
                url:url,
                method:method,
                headers:headers,
                data: data
            }
            break;
        default:
            return Promise.reject(new Error(`Invalid method: ${method}`));
    }

    const response = await axios(options).catch((error)=>{
        return Promise.reject(error);
    })
    return response;
};