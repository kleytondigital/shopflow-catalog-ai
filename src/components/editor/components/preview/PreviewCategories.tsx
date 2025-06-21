
import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface PreviewCategoriesProps {
  categories: Category[];
}

const PreviewCategories: React.FC<PreviewCategoriesProps> = ({ categories }) => {
  const { configuration } = useEditorStore();

  return (
    <section className="py-6 px-4" style={{ backgroundColor: configuration.colors.surface }}>
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-2xl font-bold text-center mb-6"
          style={{ 
            color: configuration.colors.text,
            fontSize: configuration.global.fontSize.large
          }}
        >
          Categorias
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: configuration.colors.primary,
                color: '#FFFFFF',
                borderRadius: `${configuration.global.borderRadius * 2}px`,
                fontSize: configuration.global.fontSize.small
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewCategories;
