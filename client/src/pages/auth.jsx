import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';
import { ROUTES } from '@/constants/routes';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { cn } from '@/lib/utils';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AuthPage = () => {
    const { view } = useParams();
    const { utils } = useContext(GlobalContext);
    const [currentView, setCurrentView] = useState(view || 'login');
    const emailRef = useRef(null),
        passwordRef = useRef(null),
        confirmPasswordRef = useRef(null);
    useEffect(() => {
        setCurrentView(view || 'login');
    }, [view])
    const navigate = useNavigate()
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current?.value || null,
            password = passwordRef.current?.value || null,
            confirmPassword = confirmPasswordRef.current?.value || null;
        //validate
        if (currentView === 'login') {
            if (!email || !password) {
                utils.toast('Please fill all fields', 'error');
                return;
            }
        } else {
            if (!email || !password || !confirmPassword) {
                utils.toast('Please fill all fields', 'error');
                return;
            }
            if (password !== confirmPassword) {
                utils.toast('Passwords do not match', 'error');
                return;
            }
        }
        var reqObj = {
            email,
            secret: password
        }
        console.log(vgFetch('/ping'))
    }
    return (
        <div className='h-screen flex items-center justify-center'>
            <div
                className="max-w-md z-10 w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                    Welcome to VoxGenie
                </h2>
                <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                    {
                        currentView === 'login' ? 'Login to enjoy the power of Text-to-Speech engine with your own voice!' : 'Sign up to enjoy the power of Text-to-Speech engine with your own voice!'
                    }
                </p>
                <form onSubmit={handleFormSubmit} className="my-8" autoComplete='off'>
                    {
                        currentView == "login" && <>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="email">Email Address</Label>
                                <Input ref={emailRef} id="email" placeholder="name@domain.tld" type="email" />
                            </LabelInputContainer>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="password">Password</Label>
                                <Input ref={passwordRef} id="password" placeholder="••••••••" type="password" />
                            </LabelInputContainer>
                        </>
                        || <>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="email">Email Address</Label>
                                <Input ref={emailRef} id="email" placeholder="name@domain.tld" type="email" />
                            </LabelInputContainer>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="password">New Password</Label>
                                <Input ref={passwordRef} id="password" placeholder="••••••••" type="password" />
                            </LabelInputContainer>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="password">Confirm Password</Label>
                                <Input ref={confirmPasswordRef} id="password" placeholder="••••••••" type="password" />
                            </LabelInputContainer>
                        </>
                    }

                    <button
                        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit">
                        {currentView == "login" ? "Login" : "Sign up"} &rarr;
                        <BottomGradient />
                    </button>

                    <div
                        className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                    <div className="flex items-center justify-center space-x-2">
                        <p>
                            {currentView === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                            {' '}
                            <button
                                type='button'
                                onClick={() => {
                                    navigate(currentView === 'login' ? `${ROUTES.auth}/signup` : ROUTES.auth)
                                }}
                                className="text-blue-500 dark:text-blue-400 font-semibold"
                            >
                                {currentView === 'login' ? 'Sign up' : 'Login'}
                            </button>
                        </p>
                    </div>

                </form>
            </div>
            <ShootingStars />
            <StarsBackground />
        </div>
    );
};

const BottomGradient = () => {
    return (<>
        <span
            className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span
            className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>);
};

const LabelInputContainer = ({
    children,
    className
}) => {
    return (
        (<div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>)
    );
};

export default AuthPage;