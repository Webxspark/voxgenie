import { createContext, useState } from "react"
import { declarations } from "./declarations/global.d";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import ThemeSwitcher from "@/components/ui/theme-switcher";

const GlobalContext = createContext(declarations);

const GlobalContextProvider = ({ children }) => {
    const [user, _setUser] = useState(localStorage.getItem("voxgenie_user") ? JSON.parse(localStorage.getItem("voxgenie_user")) : null);
    const [token, setToken] = useState(null);
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
        }
    }
    return <GlobalContext.Provider value={declarations}>
        {children}
        <Toaster closeButton />
        <ThemeSwitcher />
    </GlobalContext.Provider>;
};

export { GlobalContext, GlobalContextProvider };
