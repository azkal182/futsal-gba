'use client'

import { useState, useActionState, useEffect } from 'react'
import type { TimeSlot } from '@/generated/prisma/client'
import { updateTimeSlot } from '@/actions/timeslots'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditTimeSlotDialogProps {
    timeSlot: TimeSlot
}

export function EditTimeSlotDialog({ timeSlot }: EditTimeSlotDialogProps) {
    const [open, setOpen] = useState(false)
    const updateAction = updateTimeSlot.bind(null, timeSlot.id)
    const [state, formAction, isPending] = useActionState(updateAction, null)

    useEffect(() => {
        if (state?.success) {
            toast.success('Kategori waktu berhasil diubah')
            setOpen(false)
        } else if (state?.success === false) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Kategori Waktu</DialogTitle>
                    <DialogDescription>
                        Ubah detail kategori waktu
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={timeSlot.name}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Jam Mulai</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    defaultValue={timeSlot.startTime}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Jam Selesai</Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    defaultValue={timeSlot.endTime}
                                    required
                                />
                            </div>
                        </div>
                        <input type="hidden" name="sortOrder" value={timeSlot.sortOrder} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
