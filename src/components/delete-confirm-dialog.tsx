'use client'

import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName: string | undefined
  loading?: boolean
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  loading,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px]">
            {description} &ldquo;{itemName}&rdquo;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-[13px]">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[13px]"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
