import { ROUTES } from '@/constants/routes';
import { GlobalContext } from '@/contexts/global';
import React, { useContext, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const { user } = useContext(GlobalContext)
    const isMounted = useRef(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
            checkUserLoggedIn()
        }
    }, [])
    useEffect(() => {
        if(isMounted.current){
            checkUserLoggedIn()
        }
    }, [user])
    function checkUserLoggedIn(){
        if(!user){
            navigate(ROUTES.auth)
        }
    }
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default AdminLayout;