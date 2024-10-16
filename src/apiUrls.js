let adminUrl;
let baseUrl;
let chatBaseUrl;
let WSUrl;
let domainUrl;

const environment = process.env.REACT_APP_ENVIRONMENT; // Set this value to 'staging' or 'production' as needed (env variable REACT_APP_ENVIRONMENT)

switch (environment) {
    case 'test':
        adminUrl = 'http://ushop-test-runner:8000/admin-api/';
        baseUrl = 'http://ushop-test-runner:8000/api/';
        chatBaseUrl = "http://ushop-test-runner:8000/";
        WSUrl = "wss://ushop-test-runner:8000/ws/chat/";
        domainUrl = "http://ushop-test-runner:8000/";
        break;

    case 'local':
        adminUrl = 'http://127.0.0.1:8000/admin-api/';
        baseUrl = 'http://127.0.0.1:8000/api/';
        chatBaseUrl = "http://127.0.0.1:8000/";
        WSUrl = "wss://127.0.0.1:8000/ws/chat/";
        domainUrl = "http://127.0.0.1:8000/";
        break;

    case 'staging':
        adminUrl = 'https://stg-api.ushop.market/admin-api/';
        baseUrl = 'https://stg-api.ushop.market/api/';
        chatBaseUrl = "https://stg-api.ushop.market/";
        WSUrl = "wss://stg-api.ushop.market/ws/chat/";
        domainUrl = "https://stg.ushop.market/";
        break;

    case 'production':
        adminUrl = 'https://api.ushop.market/admin-api/';
        baseUrl = 'https://api.ushop.market/api/';
        chatBaseUrl = "https://api.ushop.market/";
        WSUrl = "wss://api.ushop.market/ws/chat/";
        domainUrl = "https://ushop.market/";
        break;
        
    default:
        throw new Error(`Unknown environment: ${environment}`);
}

export { adminUrl, baseUrl, chatBaseUrl, WSUrl, domainUrl };
