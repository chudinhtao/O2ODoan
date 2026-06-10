import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ICategoryRequest } from '../types/adminMenu.type'
import { useAdminCategories } from './useMenuQueries'
import { useCreateCategory, useUpdateCategory } from './useMenuMutations'

export const categorySchema = z.object({
  name: z.string().min(1, 'admin.categories.validation.requiredName'),
  displayOrder: z.preprocess((val) => (typeof val === 'number' && Number.isNaN(val)) || val === '' ? 0 : Number(val), z.number().optional()),
  taxRate: z.preprocess((val) => (typeof val === 'number' && Number.isNaN(val)) || val === '' ? 0 : Number(val), z.number().min(0, 'admin.categories.validation.minTax').max(100, 'admin.categories.validation.maxTax')),
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

  const { data: categoriesPage, isFetching: isLoadingCategories } = useAdminCategories({ size: 100 })
  const existingCategory = categoriesPage?.content.find(c => c.id === categoryId)

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema as any),
    defaultValues: { name: '', displayOrder: 0, taxRate: 0, imageUrl: '' }
  })

  useEffect(() => {
    if (!isOpen) return

    if (isEdit && existingCategory) {
      form.reset({
        name: existingCategory.name,
        displayOrder: existingCategory.displayOrder || 0,
        taxRate: existingCategory.taxRate ?? 0,
        imageUrl: existingCategory.imageUrl || ''
      })
    } else {
      form.reset({ name: '', displayOrder: 0, taxRate: 0, imageUrl: '' })
    }
  }, [isOpen, isEdit, existingCategory, form])

  const onSubmit = async (data: CategoryFormValues) => {
    const payload: ICategoryRequest = {
      name: data.name,
      displayOrder: data.displayOrder,
      taxRate: data.taxRate ?? 0,
      imageUrl: data.imageUrl || undefined
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: categoryId!, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {}
  }

  const isLoading = isEdit && isLoadingCategories

  return { form, isEdit, isLoading, onSubmit }
}
