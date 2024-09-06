import WxpToolTip from '@/components/dashboard/tooltip';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppContext } from '@/contexts/dashboard';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { cn } from '@/lib/utils';
import { TrashIcon } from '@radix-ui/react-icons';
import { DeleteIcon, DownloadIcon, LoaderIcon, PlayIcon, Save } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';

const EditTrainedVoiceModal = ({ open, onOpenChange = e => null, voice = [], voiceUpdateTrigger = e => null }) => {
    const processingRef = useRef(false),
        cleanupSignal = useRef(false)
    const [uploadedFiles, setUploadedFiles] = useState([]),
        [voiceLabel, setVoiceLabel] = useState(""),
        [buttonProcessing, setButtonProcessing] = useState(false),
        [newUploads, setNewUploads] = useState([]);
    const { audio_player } = useContext(AppContext)
    const { utils } = useContext(GlobalContext);
    const handleFileUpload = e => {
        setNewUploads(e)
    }
    useEffect(() => {
        if (voice !== false) {
            setVoiceLabel(voice[3] || "")
            setUploadedFiles(JSON.parse(voice[2]) || [])
        }
    }, [voice])
    const handleFormSubmit = e => {
        e.preventDefault()
        // validate
        if (voiceLabel === "") {
            utils.toast.error("Please enter a voice name");
            return;
        }
        console.log(uploadedFiles, newUploads)
        if (uploadedFiles.length === 0 && newUploads.length === 0) {
            utils.toast.error("Please upload atleast 1 audio file");
            return;
        }
        var formData = new FormData();
        formData.append("voiceLabel", voiceLabel);
        formData.append("voiceID", voice[0]);
        newUploads.map(file => {
            formData.append("files", file);
        })
        setButtonProcessing(true);
        processingRef.current = true;
        console.log(formData)
        vgFetch("/xtts/voices/edit", {
            method: "POST",
            body: formData
        }).then(resp => {
            if(resp.status == 200){
                utils.toast.success(resp.message || "Voice updated successfully");
                voiceUpdateTrigger();
                onOpenChange(false);
            } else {
                utils.toast.error(resp.message || "Failed to update voice");
            }
        }).catch(err => {
            console.log(err)
            utils.toast.error(err.message || "Failed to update voice");
        }).finally(() => {
            setButtonProcessing(false);
            processingRef.current = false;
        })
    }
    const handlePlayClick = (file = "") => {
        if (file == "") return;
        audio_player.api.setTrack({
            title: "Audio Preivew",
            voice: voice[3] || "Trained Voice"
        })
        audio_player.api.setUrl(`/genie/tvo/${file}`);
        audio_player.api.show();
        audio_player.api.play();
    }
    const handleDeleteAction = (file = "") => {
        if (processingRef.current) return
        if (file === "" || !file) return;
        if (confirm("Are you sure you want to delete this file?")) {
            var voiceID = voice[0];
            //validate
            if (voiceID === undefined || voiceID === "") {
                utils.toast.error("Invalid voice ID");
                return;
            }
            utils.toast.promise(sendDeleteRequest(voiceID, file), {
                loading: "Deleting file...",
                success: (res) => {
                    if (res.status == 200) {
                        var newFiles = uploadedFiles.filter(f => f !== file);
                        setUploadedFiles(newFiles);
                        voiceUpdateTrigger();
                        return res.message || "File deleted successfully";
                    }
                },
                error: (err) => {
                    return err.message || "Failed to delete file :(";
                }
            })
        }
    }
    function sendDeleteRequest(voiceID, file) {
        return new Promise((resolve, reject) => {
            processingRef.current = true;
            vgFetch('/xtts/voice/sf-remove', {
                method: 'DELETE',
                body: new URLSearchParams({
                    voice: voiceID,
                    file
                })
            }).then(resp => {
                resolve(resp)
            }).catch(err => reject(err))
                .finally(() => {
                    processingRef.current = false;
                })
        })
    }
    return (
        <div>
            <Dialog
                open={open}
                onOpenChange={() => {
                    if (processingRef.current) return
                    onOpenChange(false)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit Voice ({voice[3] || ":"})
                        </DialogTitle>
                        <DialogDescription>
                            Manage or edit the trained voice
                        </DialogDescription>
                    </DialogHeader>
                    <form className='space-y-4' onSubmit={handleFormSubmit}>
                        <div>
                            <Label>
                                Voice Name
                            </Label>
                            <Input
                                type='text'
                                placeholder='Eg: John Doe'
                                value={voiceLabel}
                                onChange={e => setVoiceLabel(e.target.value)}
                            />
                        </div>
                        <div>
                            <Tabs defaultValue='files' className='w-full'>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value='files'>Uploaded Files</TabsTrigger>
                                    <TabsTrigger value='upload'>Add Files</TabsTrigger>
                                </TabsList>
                                <TabsContent value='files'>
                                    <Label>
                                        Trained Files
                                    </Label>
                                    <div>
                                        {
                                            uploadedFiles.length > 0 && uploadedFiles.map((file, index) => {
                                                return (<>
                                                    <div className='flex gap-x-1 transition-all duration-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-xl p-2'>
                                                        <span>{index + 1}.</span>
                                                        <div className="flex justify-between gap-x-3 w-full">
                                                            <h1 className="text-base">{file}</h1>
                                                            <div className='flex items-center gap-x-2'>
                                                                <WxpToolTip title={"Play audio"} asChild sparkVariant={true} >
                                                                    <Button type="button" onClick={e => handlePlayClick(file)} size="icon" className="rounded-full">
                                                                        <PlayIcon className='h-4 w-4' />
                                                                    </Button>
                                                                </WxpToolTip>
                                                                <WxpToolTip title={"Delete audio"} asChild sparkVariant={true} >
                                                                    <Button type="button" onClick={e => handleDeleteAction(file)} size="icon" className="rounded-full">
                                                                        <TrashIcon className='h-4 w-4' />
                                                                    </Button>
                                                                </WxpToolTip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>)
                                            })
                                            || <div className='flex justify-center text-center items-center h-24 text-neutral-500 dark:text-neutral-400'>
                                                No voice samples uploaded yet. Click on the "Add Files" tab to upload voice samples.
                                            </div>
                                        }
                                    </div>
                                </TabsContent>
                                <TabsContent value='upload'>
                                    <Label>
                                        Add Files <small>(MAX 10MB/file)</small>
                                    </Label>
                                    <ScrollArea className="max-h-[400px] overflow-y-auto">
                                        <FileUpload cleanup={e => { cleanupSignal.current = false }} sigint={cleanupSignal} onChange={handleFileUpload} />
                                    </ScrollArea>
                                    <div className='flex justify-end'>
                                        <Button disabled={buttonProcessing}>
                                            Save changes {
                                                buttonProcessing === true && <LoaderIcon className='h-4 w-4 ml-1 animate-spin' />
                                                || <Save className='h-4 w-4 ml-1' />
                                            }
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditTrainedVoiceModal;