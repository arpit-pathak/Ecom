import { createContext, useState, useEffect, useCallback } from "react";
import { ApiCalls, HttpStatus, UShopApis, UserType } from '../utils';
import localStorage from "local-storage";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => localStorage.get('authTokens') ? jwt_decode(localStorage.get('authTokens')) : null)
    const [token, setAuthTokens] = useState(() => localStorage.get('authTokens') ? JSON.parse(localStorage.get('authTokens')) : null)
    const [permissions, setPermissions] = useState(() => localStorage.get('permissions') ? JSON.parse(localStorage.get('permissions')) : null)
    const [expiration, setExpiration] = useState(false)
    const [loading, setLoading] = useState(true)
    const oneMinute = 1000 * 60;
    const fiveMinutes = (oneMinute * 5) / 1000;

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.remove('authTokens')
        localStorage.remove('user')
        localStorage.remove('permissions')
    }

    let checkPermission = (permissionList) => {
        let isAllowed = false;
        if (user?.user_type === UserType.SUPERADMIN) {
            return true; // Skip checking for superadmin
        }
        if (permissions) {
            isAllowed = permissionList.every(permission => permissions[0].includes(permission));
        }
        return isAllowed;
    }

    let updateToken = useCallback(async () => {
        await ApiCalls(UShopApis.refreshToken, "POST", { 'refresh': token?.refresh }, true)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setAuthTokens(response.data)
                    setUser(jwt_decode(response.data.access))
                    localStorage.set("authTokens", JSON.stringify(response.data));
                }
            })
    }, [token?.refresh])

    let verifyToken = useCallback(async () => {
        await ApiCalls(UShopApis.verifyToken, "POST", { 'token': token?.access }, true)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    console.log("verify Token Success")
                }
            }).catch(error => {
                logoutUser()
            });
        if (loading) {
            setLoading(false)
        }
    }, [token?.access, loading])

    let checkTokenExpiration = useCallback(() => {
        if (token?.access) {
            const tokenExp = user.exp
            const currentTime = Math.floor(Date.now() / 1000); // Get current UTC timestamp in seconds
            if (tokenExp - currentTime <= fiveMinutes) {
                setExpiration(true)
            }
        }
    }, [token?.access, user?.exp, fiveMinutes])

    // Context accessibly by all components only if authHook is imported and use
    let contextData = {
        user: user,
        token: token,
        permissions: permissions,
        expiration: expiration,
        logoutUser: logoutUser,
        checkPermission: checkPermission,
        setUser: setUser,
        setAuthTokens: setAuthTokens,
        setPermissions: setPermissions,
        setExpiration: setExpiration,
        updateToken: updateToken,
    }

    useEffect(() => {
        //Verify token if token is not null
        if (loading && token?.access) {
            verifyToken()
        } else {
            checkTokenExpiration(); //If user try to ignore reset session by refreshing
        }
        let interval = setInterval(() => {
            checkTokenExpiration();
        }, 1000)

        return () => clearInterval(interval)
    }, [verifyToken, checkTokenExpiration, token, loading])


    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext;