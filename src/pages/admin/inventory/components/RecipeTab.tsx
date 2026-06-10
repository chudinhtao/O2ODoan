import { useState } from 'react'
import MenuTreeSidebar from './recipe/MenuTreeSidebar'
import RecipeEditor from './recipe/RecipeEditor'

export interface ISelectedRecipeTarget {
  saleItemId: string
  modifierId?: string
  name: string
  type: 'MAIN_ITEM' | 'MODIFIER'
}

export default function RecipeTab() {
  const [selectedTarget, setSelectedTarget] = useState<ISelectedRecipeTarget | null>(null)

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4">
      {/* Sidebar - Cột trái */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-surface-dim overflow-hidden">
        <MenuTreeSidebar 
          selectedTarget={selectedTarget}
          onSelectTarget={setSelectedTarget}
        />
      </div>

      {/* Editor - Cột phải */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-surface-dim overflow-hidden">
        <RecipeEditor selectedTarget={selectedTarget} />
      </div>
    </div>
  )
}
