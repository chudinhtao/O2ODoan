import { useEffect, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IMenuItemRequest, IOptionGroupRequest } from '../types/adminMenu.type'
import { useAdminCategories, useAdminMenuItem } from './useMenuQueries'
import { useCreateMenuItem, useUpdateMenuItem } from './useMenuMutations'

export const optionSchema = z.object({
  name: z.string().min(1, 'admin.menu.validation.requiredOption'),
  extraPrice: z.number().min(0, 'admin.menu.validation.priceMinZero'),
})

export const optionGroupSchema = z.object({
  name: z.string().min(1, 'admin.menu.validation.requiredGroup'),
  isRequired: z.boolean(),
  type: z.enum(['SINGLE', 'MULTI']),
  displayOrder: z.number(),
  options: z.array(optionSchema).min(1, 'admin.menu.validation.minOptions')
})

export const menuSchema = z.object({
  name: z.string().min(1, 'admin.menu.validation.requiredName'),
  categoryId: z.string().min(1, 'admin.menu.validation.requiredCategory'),
  basePrice: z.number().min(0, 'admin.menu.validation.priceMinZero'),
  station: z.enum(['HOT', 'COLD', 'DRINK']),
  description: z.string().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  imageUrl: z.string().optional().nullable(),
  optionGroups: z.array(optionGroupSchema).optional()
})

export type MenuFormValues = z.infer<typeof menuSchema>

interface UseMenuFormProps {
  itemId?: string | null
  onSuccess: () => void
}

export function useMenuForm({ itemId, onSuccess }: UseMenuFormProps) {
  const isEdit = !!itemId

  const { data: categoriesPage } = useAdminCategories({ size: 100 })
  const categories = categoriesPage?.content || []

  const { data: itemData, isFetching: isLoadingItem } = useAdminMenuItem(itemId)

  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      basePrice: 0,
      station: 'HOT',
      description: '',
      isAvailable: true,
      isFeatured: false,
      imageUrl: '',
      optionGroups: []
    },
  })

  const optionGroupsArray = useFieldArray({
    control: form.control,
    name: 'optionGroups'
  })

  const lastResetId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (lastResetId.current === itemId && (isEdit ? !!itemData : true)) return

    if (!isEdit) {
      form.reset({
        name: '',
        categoryId: '',
        basePrice: 0,
        station: 'HOT',
        description: '',
        isAvailable: true,
        isFeatured: false,
        imageUrl: '',
        optionGroups: []
      })
      lastResetId.current = itemId
    } else if (itemData) {
      const mappedOptionGroups = itemData.optionGroups?.map(g => ({
        name: g.name,
        isRequired: g.isRequired,
        type: g.type as 'SINGLE' | 'MULTI',
        displayOrder: g.displayOrder,
        options: g.options.map(o => ({
          name: o.name,
          extraPrice: o.extraPrice
        }))
      })) || []

      form.reset({
        name: itemData.name,
        categoryId: itemData.categoryId,
        basePrice: itemData.basePrice,
        station: itemData.station || 'HOT',
        description: itemData.description || '',
        isAvailable: itemData.isAvailable,
        isFeatured: itemData.isFeatured,
        imageUrl: itemData.imageUrl || '',
        optionGroups: mappedOptionGroups
      })
      lastResetId.current = itemId
    }
  }, [isEdit, itemData, form, itemId])

  const onSubmit = async (data: MenuFormValues) => {
    let groupsPayload: IOptionGroupRequest[] | undefined
    if (data.optionGroups && data.optionGroups.length > 0) {
      groupsPayload = data.optionGroups.map((g, idx) => ({
        name: g.name,
        type: g.type,
        isRequired: g.isRequired,
        displayOrder: idx,
        options: g.options.map(o => ({
          name: o.name,
          extraPrice: o.extraPrice
        }))
      }))
    }

    const payload: IMenuItemRequest = {
      name: data.name,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      description: data.description || '',
      station: data.station,
      isFeatured: data.isFeatured,
      isAvailable: data.isAvailable,
      imageUrl: data.imageUrl || null,
      optionGroups: groupsPayload
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: itemId!, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onSuccess()
    } catch {}
  }

  const handleCreateNewOptionGroup = () => {
    optionGroupsArray.append({
      name: '',
      isRequired: false,
      type: 'SINGLE',
      displayOrder: optionGroupsArray.fields.length,
      options: [{ name: '', extraPrice: 0 }]
    })
  }

  return {
    form,
    isEdit,
    isLoadingItem,
    categories,
    optionGroupsArray,
    onSubmit,
    handleCreateNewOptionGroup
  }
}
