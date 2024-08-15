import React, { lazy, Suspense, useContext, useState } from 'react';
import {
    IconArrowLeft,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
    IconLogout,
    IconHistory,
    IconServer,
    IconHome
} from "@tabler/icons-react";
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { ROUTES } from '@/constants/routes';
import userProfile from "@/assets/webp/user-m.webp";
import { GlobalContext } from '@/contexts/global';
const AudioPlayerWidget = lazy(() => import('./audio-player'));
const DashAside = ({ children }) => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useContext(GlobalContext);
    const links = [
        {
            label: "Dashboard",
            href: ROUTES.dashboard.dashboard,
            icon: (
                <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Train Voice",
            href: ROUTES.dashboard.train,
            icon: (
                <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "File Manager",
            href: ROUTES.dashboard.fileManager,
            icon: (
                <IconServer className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "History",
            href: ROUTES.dashboard.history,
            icon: (
                <IconHistory className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Logout",
            href: "#",
            icon: (
                <IconLogout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
            onClick: () => { logout.init(true) }
        },
    ];
    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-100 dark:bg-transparent w-full flex-1 mx-auto overflow-hidden",
                "h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen} >
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink onClick={link.onClick} key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: <div className='capitalize'>{user?.username}</div>,
                                href: "#",
                                icon: (
                                    <img
                                        src={userProfile}
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className='m-3 overflow-y-auto md:w-full'>
                {children}
                <Suspense fallback={<></>}>
                    <div className=''>
                        <AudioPlayerWidget />
                    </div>
                </Suspense>
            </div>
        </div>
    );
};
export const Logo = () => {
    return (
        <Link
            to={ROUTES.dashboard.dashboard}
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                VoxGenie
            </motion.span>
        </Link>
    );
};
export const LogoIcon = () => {
    return (
        <Link
            to="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    );
};
export default DashAside;