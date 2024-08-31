import { ROUTES } from '@/constants/routes';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { LoaderCircle } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashAside from '@/components/dashboard/aside';
import { AppContextProvider } from '@/contexts/dashboard';
import AppTasks from '@/components/dashboard/tasks';
import SystemStats from '@/pages/ir-components/system-stats';
const AdminLayout = () => {
    const { user, setUser } = useContext(GlobalContext)
    const isMounted = useRef(false);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState('loading');
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
            checkUserLoggedIn()
        }
    }, [])
    useEffect(() => {
        if (isMounted.current) {
            checkUserLoggedIn();
        }
    }, [user])
    function checkUserLoggedIn() {
        if (!user) {
            navigate(ROUTES.auth)
            return
        }
        setView('loading')
        vgFetch('/ping', { method: 'POST', body: new URLSearchParams({ token: user?.token || "-" }) }).then(res => {
            setView('content')
            if (res.status != 200) {
                setUser(null);
                navigate(ROUTES.auth)
                return;
            }
        }).catch(err => {
            console.error(err)
            setView("Something went wrong while checking login status. Please try again later.")
        })
    }
    return (
        <AppContextProvider>
            <div className='w-full'>
                {
                    view == 'content' && <>
                        <DashAside>
                            <Outlet />
                            <AppTasks />
                            <SystemStats />
                        </DashAside>
                    </>
                    || view == 'loading' && <div className='flex items-center justify-center h-[90dvh]'>
                        <LoaderCircle className='animate-spin' />
                    </div>
                    || <div className='flex items-center justify-center h-[90dvh]'>
                        <div className='overflow-hidden relative rounded-2xl p-10 text-base text-white bg-gradient-to-br from-purple-700 to-violet-900'>
                            {view}
                        </div>
                    </div>
                }
            </div>

        </AppContextProvider>
    );
};

export default AdminLayout;