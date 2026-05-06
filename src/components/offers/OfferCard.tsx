import { Heart } from 'lucide-react';
import { Offer } from '../../types';

interface OfferCardProps {
  offer: Offer;
  isSaved?: boolean;
  onSave?: () => void;
  onClick?: () => void;
}

export function OfferCard({ offer, isSaved = false, onSave, onClick }: OfferCardProps) {
  const getMomentumColor = () => {
    switch (offer.momentum_tag) {
      case 'escalating':
        return 'bg-red-500/20 text-red-400';
      case 'hot':
        return 'bg-orange-500/20 text-orange-400';
      case 'radar':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-700/50 text-slate-300';
    }
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'active':
        return 'text-green-400';
      case 'recently_disabled':
        return 'text-yellow-400';
      case 'ended':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div onClick={onClick} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-primary transition cursor-pointer group">
      {offer.thumbnail_url && (
        <div className="w-full h-32 bg-slate-900 rounded mb-4 overflow-hidden">
          <img src={offer.thumbnail_url} alt={offer.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg truncate">{offer.name}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Detectado: {new Date(offer.detected_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          className="p-2 rounded hover:bg-slate-700 transition ml-2"
        >
          <Heart size={18} className={isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
          {offer.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
        {offer.momentum_tag && (
          <span className={`text-xs px-2 py-1 rounded ${getMomentumColor()}`}>
            {offer.momentum_tag === 'escalating' ? 'Escalando' : offer.momentum_tag === 'hot' ? 'Hot' : 'Radar'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-slate-900 p-2 rounded">
          <p className="text-slate-400">Anúncios</p>
          <p className="font-semibold">{offer.num_ads}</p>
        </div>
        <div className="bg-slate-900 p-2 rounded">
          <p className="text-slate-400">Criativos</p>
          <p className="font-semibold">{offer.num_creatives}</p>
        </div>
        <div className="bg-slate-900 p-2 rounded">
          <p className="text-slate-400">Dias</p>
          <p className="font-semibold">{offer.days_active}D</p>
        </div>
      </div>

      <div className="text-xs space-y-1">
        <p>
          <span className="text-slate-400">Plataforma:</span> {offer.platform}
        </p>
        <p>
          <span className="text-slate-400">Nicho:</span> {offer.niche}
        </p>
        <p>
          <span className="text-slate-400">Idioma:</span> {offer.language}
        </p>
      </div>
    </div>
  );
}
