import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useRef } from 'react';

const EditTrainedVoiceModal = ({ open, onOpenChange = e => null, voice = [] }) => {
    const voiceLabelRef = useRef(null),
        processingRef = useRef(false)
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
                    </DialogHeader>
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
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditTrainedVoiceModal;