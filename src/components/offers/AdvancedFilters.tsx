import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterState } from '../../types';

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
}

const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês'];
const PLATFORMS = ['facebook', 'instagram', 'youtube', 'tiktok'];
const NICHES = ['Outros', 'Alzheimer', 'Diabetes', 'Emagrecimento', 'Disfunção Erétil', 'Visão', 'Fungos'];
const STRUCTURES = ['VSL', 'Email', 'Landing Page'];
const PRODUCT_TYPES = ['Nutracêutico', 'E-book', 'Curso', 'Software'];

export function AdvancedFilters({ filters, onFiltersChange, onApply }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMultiSelect = (key: keyof FilterState, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({
      ...filters,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-primary transition"
      >
        <span className="font-semibold">Filtros Avançados</span>
        <ChevronDown size={20} className={`transition ${isOpen && 'rotate-180'}`} />
      </button>

      {isOpen && (
        <div className="bg-slate-800 border border-t-0 border-slate-700 rounded-b-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Idioma</label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.language || []).includes(lang)}
                    onChange={() => handleMultiSelect('language', lang)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Rede de Tráfego</label>
            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <label key={platform} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.platform || []).includes(platform)}
                    onChange={() => handleMultiSelect('platform', platform)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Nicho</label>
            <div className="space-y-2">
              {NICHES.map((niche) => (
                <label key={niche} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.niche || []).includes(niche)}
                    onChange={() => handleMultiSelect('niche', niche)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{niche}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Estrutura</label>
            <div className="space-y-2">
              {STRUCTURES.map((struct) => (
                <label key={struct} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.structure || []).includes(struct)}
                    onChange={() => handleMultiSelect('structure', struct)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{struct}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Produto</label>
            <div className="space-y-2">
              {PRODUCT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.product_type || []).includes(type)}
                    onChange={() => handleMultiSelect('product_type', type)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={onApply} className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded transition">
            Aplicar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
