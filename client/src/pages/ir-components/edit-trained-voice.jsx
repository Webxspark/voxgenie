import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef, useState } from 'react';

const EditTrainedVoiceModal = ({ open, onOpenChange = e => null, voice = [] }) => {
    const processingRef = useRef(false),
        cleanupSignal = useRef(false)
    const [uploadedFiles, setUploadedFiles] = useState([]),
        [voiceLabel, setVoiceLabel] = useState("");
    const handleFileUpload = e => {
    
    }
    useEffect(() => {
        if (voice !== false) {
            setVoiceLabel(voice[3] || "")
            setUploadedFiles(voice[2] || [])
        }
    }, [voice])
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
                        <Label>
                            Add Files <small>(MAX 10MB/file)</small>
                        </Label>
                        <ScrollArea className="max-h-[400px] overflow-y-auto">
                            <FileUpload cleanup={e => { cleanupSignal.current = false }} sigint={cleanupSignal} onChange={handleFileUpload} />
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditTrainedVoiceModal;