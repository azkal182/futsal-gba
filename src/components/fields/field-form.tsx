'use client'

import { useActionState, useState } from 'react'
import { createField, toggleFieldStatus, deleteField } from '@/actions/fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Field } from '@/types'

interface FieldFormDialogProps {
    field?: Field
    trigger: React.ReactNode
    onSuccess?: () => void
}

export function FieldFormDialog({ field, trigger, onSuccess }: FieldFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(createField, null)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{field ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}</DialogTitle>
                    <DialogDescription>
                        {field ? 'Ubah informasi lapangan' : 'Isi detail lapangan yang ingin ditambahkan'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    action={async (formData) => {
                        const result = await createField(null, formData)
                        if (result.success) {
                            setOpen(false)
                            toast.success('Lapangan berhasil ditambahkan')
                            onSuccess?.()
                        } else {
                            toast.error(result.error)
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lapangan</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Lapangan A"
                            defaultValue={field?.name}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi (Opsional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Deskripsi lapangan..."
                            defaultValue={field?.description ?? ''}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pricePerHour">Harga per Jam (Rp)</Label>
                        <Input
                            id="pricePerHour"
                            name="pricePerHour"
                            type="number"
                            placeholder="100000"
                            defaultValue={field?.pricePerHour}
                            min={0}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isActive">Status Aktif</Label>
                        <input type="hidden" name="isActive" value="true" />
                        <Switch id="isActive" defaultChecked={field?.isActive ?? true} />
                    </div>

                    {state?.success === false && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                            {state.error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        >
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

interface FieldActionsProps {
    field: Field
    onUpdate: () => void
}

export function FieldActions({ field, onUpdate }: FieldActionsProps) {
    const [isToggling, setIsToggling] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleToggle = async () => {
        setIsToggling(true)
        const result = await toggleFieldStatus(field.id)
        setIsToggling(false)

        if (result.success) {
            toast.success(`Lapangan ${result.data?.isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
            onUpdate()
        } else {
            toast.error(result.error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Yakin ingin menghapus lapangan ini?')) return

        setIsDeleting(true)
        const result = await deleteField(field.id)
        setIsDeleting(false)

        if (result.success) {
            toast.success('Lapangan berhasil dihapus')
            onUpdate()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={field.isActive}
                onCheckedChange={handleToggle}
                disabled={isToggling}
            />
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
            </Button>
        </div>
    )
}
