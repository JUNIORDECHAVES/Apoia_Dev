'use client';
import { ChangeEvent, useState, useRef } from "react";
import {debounce} from 'lodash'
import { toast } from "sonner";
import { changeBio } from "../action/change-bio";

export function Description({ initialDescription }: { initialDescription: string }) {
    const [description, setDescription] = useState(initialDescription);
    const [originalDescription] = useState(initialDescription);

    const debouncedSaveDescription = useRef(
        debounce(async (currentDescription: string) => {
            if(currentDescription.trim() ==="") {
                setDescription(originalDescription);
                return;
            }
            if (currentDescription !== description) {
                try {
                    const response = await changeBio({bio: currentDescription})

                    if (response.error) {
                        toast.error(response.error);
                        return;
                    }
                    

                    toast.success('Sua Biografia foi atualizada com sucesso!');
                    
                } catch (error) {
                    console.log(error);
                    setDescription(originalDescription);
                }
            }
            
        }, 1000)
    ).current;

    function handleChangeDescription(e: ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;
        setDescription(value);

        debouncedSaveDescription(value);
    }

    return (
        <textarea className="text-base h-40 bg-gray-50 border border-gray-100 rounded-md outline-none p-2 w-full max-w 2xl my-3 resize-none" value={description} onChange={handleChangeDescription} />
    )
}