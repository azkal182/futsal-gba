'use client'

import { useState, useActionState } from 'react'
import { createTimeSlot } from '@/actions/timeslots'
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
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function CreateTimeSlotDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(createTimeSlot, null)

    useEffect(() => {
        if (state?.success) {
            toast.success('Kategori waktu berhasil dibuat')
            setOpen(false)
        } else if (state?.success === false) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kategori
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Kategori Waktu</DialogTitle>
                    <DialogDescription>
                        Buat kategori waktu baru untuk booking
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="contoh: Pagi, Siang, Sore"
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
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Jam Selesai</Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    required
                                />
                            </div>
                        </div>
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
