import React, { useContext, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { GlobalContext } from '@/contexts/global';
import { Loader } from 'lucide-react';
import { vgFetch } from '@/lib/fetch';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const LogoutHook = ({ display, callback = () => { } }) => {
    const { utils, setUser } = useContext(GlobalContext);
    const [btnLoading, setBtnLoading] = useState(false);
    
    const handleLogoutInit = e => {
        e.preventDefault();
        setBtnLoading(true);
        vgFetch("/accounts/logout", { method: "POST" }).then(res => {
            setBtnLoading(false);
            if (res.status != 200) {
                console.error(res)
            }
            setUser(null);
            callback(false);
            utils.toast.success("Logged out successfully.")
            // setTimeout(() => {
            //     window.location.href = ROUTES.home;
            // }, 1000)
            return;
        }).catch(err => {
            console.error(err)
            setBtnLoading(false);
            utils.toast.error("Something went wrong while logging out. Please try again later.")
            callback(false);
        })
    }
    return (
        <div>
            <AlertDialog
                open={display}
                onOpenChange={e => {
                    if (btnLoading === true) return;
                    callback(e)
                }}

            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to logout?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Your session will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={btnLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={btnLoading} onClick={handleLogoutInit}>
                            {btnLoading ? <>Logging out <Loader className='h-4 w-4 ml-1 animate-spin' /></> : "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LogoutHook;