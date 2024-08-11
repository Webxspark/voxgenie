import { createContext, useState } from "react"
import { declarations } from "./declarations/global.d";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import LogoutHook from "@/components/dashboard/logout";

const GlobalContext = createContext(declarations);

const GlobalContextProvider = ({ children }) => {
    const [user, _setUser] = useState(localStorage.getItem("voxgenie_user") ? JSON.parse(localStorage.getItem("voxgenie_user")) : null);
    const [token, setToken] = useState(null);
    const [logoutActionInit, setLogoutActionInit] = useState(false);
    const setUser = (user = null) => {
        if(user == null){
            localStorage.removeItem("voxgenie_user");
        }
        _setUser(user);
        if (user) {
            setToken(user.token);
            localStorage.setItem("voxgenie_user", JSON.stringify(user));
        }
    }
    const declarations = {
        user,
        setUser,
        token,
        setToken,
        utils: {
            toast
        },
        logout: {
            init: (status) => setLogoutActionInit(status),
            status: logoutActionInit
        }
    }
    return <GlobalContext.Provider value={declarations}>
        {children}
        <Toaster closeButton />
        <ThemeSwitcher />
        {
            logoutActionInit && <LogoutHook callback={e => setLogoutActionInit(e)} display={logoutActionInit} />
        }
    </GlobalContext.Provider>;
};

export { GlobalContext, GlobalContextProvider };
