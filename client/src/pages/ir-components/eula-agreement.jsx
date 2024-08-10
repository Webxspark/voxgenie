import React, { useContext, useState } from 'react';
import EULAComp from './eula'
import { Loader } from 'lucide-react';
import { vgFetch } from '@/lib/fetch';
import { GlobalContext } from '@/contexts/global';
const EULAagreement = ({ onComplete = () => { } }) => {
    const [btnLoading, setBtnLoading] = useState(false);
    const { utils } = useContext(GlobalContext);
    const initInstallation = () => {
        try {
            setBtnLoading(true);
            vgFetch("/eula-accept", { method: 'POST' }).then(res => {
                setBtnLoading(false);
                if(res.status == 200){
                    onComplete();
                    utils.toast.success(res.message);
                } else {
                    onComplete();
                    utils.toast.error(res.message);
                }
            })
        } catch (err) {
            setBtnLoading(false);
            console.error(err);
            utils.toast.error('An error occured. Please try again later. [D-500]');
        }
    }
    return (
        <>
            <h1 className='text-xl mb-2 font-semibold text-center'>
                End User License Agreement (EULA)
            </h1>
            <EULAComp />
            <div className='mt-2'>
                <button
                    disabled={btnLoading}
                    onClick={initInstallation}
                    className="bg-gradient-to-br disabled:cursor-not-allowed flex relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 items-center justify-center dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                >
                    {
                        btnLoading ? <>Installing <Loader className='ml-1 animate-spin h-4 w-4' /> </> : <>Accept and Install &rarr;</>
                    }
                    <BottomGradient />
                </button>
            </div>
        </>
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


export default EULAagreement;