import WxpToolTip from '@/components/dashboard/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { PlusIcon } from '@radix-ui/react-icons';
import { Edit, Loader, Trash } from 'lucide-react';
import React, { useContext, useRef, useState } from 'react';

const SpeechTraining = () => {
    const [showModal, setShowModal] = useState(false);
    const processingRef = useRef(false);
    const voiceLabelRef = useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const { utils } = useContext(GlobalContext);
    const cleanupSignal = useRef(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        //validate form
        if (voiceLabelRef.current.value === '') {
            utils.toast.error('Voice name is required');
            return;
        }
        if (uploadedFiles.length === 0) {
            utils.toast.error('Please upload at least one voice sample');
            return;
        }
        //submit form
        processingRef.current = true;
        setButtonLoading(true);
        const formData = new FormData();
        formData.append('voiceLabel', voiceLabelRef.current.value);
        uploadedFiles.map(file => {
            formData.append('files', file);
        });
        try {
            const response = await vgFetch('/xtts/train', {
                method: 'POST',
                body: formData,
            }).catch(err => {
                setButtonLoading(false);
                console.error(err);
                processingRef.current = false;
                utils.toast.error('An error occurred. Please try again later [D-500]');
            });
            processingRef.current = false;
            setButtonLoading(false);

            if (response.status == 200) {
                utils.toast.success(response.message)
                setShowModal(false);
                setUploadedFiles([]);
                voiceLabelRef.current.value = '';
                return;
            }
            utils.toast.error(response.message);
        } catch (error) {
            setButtonLoading(false);
            processingRef.current = false;
            console.error(error);
            utils.toast.error('An error occurred. Please try again later');
        }

    };
    const handleFileUpload = e => {
        setUploadedFiles(e);
    }
    return (
        <div>
            <Card>
                <CardHeader>
                    <div className='flex justify-between items-center'>
                        <div className='space-y-1'>
                            <CardTitle>
                                Your Voices (0)
                            </CardTitle>
                            <CardDescription>
                                You can train unlimited voices
                            </CardDescription>
                        </div>
                        <Button onClick={e => setShowModal(true)}>
                            <PlusIcon className='mr-1' /> Add Voice
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='grid md:grid-cols-2 grid-cols-1 lg:grid-cols-4 gap-12'>
                        <Card>
                            <CardHeader>
                                <div className="flex md:flex-row flex-col md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>
                                            Voice 1
                                        </CardTitle>
                                        <CardDescription>
                                            5 files trained
                                        </CardDescription>
                                    </div>
                                    <div className='flex items-center gap-x-1'>
                                        <WxpToolTip title={"Edit Voice"} sparkVariant>
                                            <Button variant="ghost" size="icon">
                                                <Edit className='h-4 w-4' />
                                            </Button>
                                        </WxpToolTip>
                                        <WxpToolTip title={"Delete Voice"} sparkVariant>
                                            <Button variant="ghost" size="icon">
                                                <Trash className='h-4 w-4' />
                                            </Button>
                                        </WxpToolTip>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                </CardContent>
            </Card>
            <Dialog
                open={showModal}
                onOpenChange={() => {
                    if (processingRef.current) return;
                    if (voiceLabelRef.current.value !== '' || uploadedFiles.length > 0) {
                        if (!window.confirm('Are you sure you want to close this dialog? All unsaved data will be lost.')) {
                            return;
                        }
                    }
                    setShowModal(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clone Voice</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className='space-y-2' encType='multipart/form-data' method='POST'>
                        <div>
                            <Label>
                                Voice Name
                            </Label>
                            <Input
                                type='text'
                                placeholder='Eg: John Doe'
                                ref={voiceLabelRef}
                            />
                        </div>
                        <div>
                            <Label>
                                Add Files <small>(MAX 10MB/file)</small>
                            </Label>
                            <ScrollArea className="max-h-[400px] overflow-y-auto">
                                <FileUpload cleanup={e => { cleanupSignal.current = false }} sigint={cleanupSignal} onChange={handleFileUpload} />
                            </ScrollArea>
                        </div>
                        <DialogFooter>
                            <Button disabled={buttonLoading} type="button" variant='ghost' onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button disabled={buttonLoading} type='submit'>
                                Save {buttonLoading && <Loader className='h-4 animate-spin w-4 ml-2' />}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SpeechTraining;