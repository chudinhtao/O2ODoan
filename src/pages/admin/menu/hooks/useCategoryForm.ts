import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useAdminCategories } from './useMenuQueries'
import { useCreateCategory, useUpdateCategory } from './useMenuMutations'
import type { ICategoryRequest } from '../types/adminMenu.type'
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'admin.categories.validation.requiredName'),
  displayOrder: z.number().optional(),
  imageUrl: z.string().optional()
})

export type CategoryFormValues = z.infer<typeof categorySchema>

interface UseCategoryFormProps {
  categoryId?: string | null
  isOpen: boolean
  onClose: () => void
}

export function useCategoryForm({ categoryId, isOpen, onClose }: UseCategoryFormProps) {
  const isEdit = !!categoryId

  // Lấy dữ liệu danh mục hiện tại từ cache
  const { data: categoriesPage, isFetching: isLoadingCategories } = useAdminCategories({ size: 100 })
  const existingCategory = categoriesPage?.content.find(c => c.id === categoryId)
  
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', displayOrder: 0, imageUrl: '' }
  })

  // Đổ dữ liệu vào form
  useEffect(() => {
    if (isOpen) {
      if (isEdit && existingCategory) {
        form.reset({
          name: existingCategory.name,
          displayOrder: existingCategory.displayOrder || 0,
          imageUrl: existingCategory.imageUrl || ''
        })
      } else {
        form.reset({ name: '', displayOrder: 0, imageUrl: '' })
      }
    }
  }, [isOpen, isEdit, existingCategory, form])

  const onSubmit = async (data: CategoryFormValues) => {
    const payload: ICategoryRequest = {
      name: data.name,
      displayOrder: data.displayOrder,
      imageUrl: data.imageUrl || undefined
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: categoryId!, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      console.error('Submit error', error)
      // Lỗi sẽ bung Toast ngay từ hook useAdminMenu do sử dụng mutateAsync
    }
  }

  const isLoading = isEdit && isLoadingCategories

  return { form, isEdit, isLoading, onSubmit }
}
