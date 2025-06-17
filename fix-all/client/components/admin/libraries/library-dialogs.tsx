"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { LibraryItem } from "@/lib/types"

interface LibraryDialogsProps {
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  libraryToDelete: LibraryItem | null
  onConfirmDelete: () => void
}

export function LibraryDialogs({
  deleteDialogOpen,
  setDeleteDialogOpen,
  libraryToDelete,
  onConfirmDelete,
}: LibraryDialogsProps) {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa thư viện</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa thư viện "{libraryToDelete?.title}"? Hành động này không thể hoàn tác và tất cả dữ
            liệu liên quan sẽ bị mất vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300">
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            Xóa thư viện
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
