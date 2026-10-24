import React, { useState } from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { Product } from '../types';

interface VirtualFittingModalProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualFittingModal: React.FC<VirtualFittingModalProps> = ({
  product,
  selectedColor,
  selectedSize,
  isOpen,
  onClose
}) => {
  const [childHeight, setChildHeight] = useState<number>(110);
  const [childAge, setChildAge] = useState<string>('5 anos');

  if (!isOpen) return null;

  // Fitting calculation suggestion
  const getFittingFeedback = () => {
    if (childHeight < 98) return { size: 'P', note: 'Caimento suave com sobra para crescer' };
    if (childHeight <= 112) return { size: 'M', note: 'Tamanho ideal! Barra na altura dos joelhos' };
    if (childHeight <= 125) return { size: 'G', note: 'Caimento confortável para brincar' };
    return { size: 'GG', note: 'Modelagem perfeita para a altura' };
  };

  const recommendation = getFittingFeedback();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-[#FAF9F6] p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ff6b57]/15 flex items-center justify-center text-[#ff6b57]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171b2b]">Ver no Corpinho (Provador Virtual)</h3>
              <p className="text-[11px] text-gray-500">Simulador de caimento para {product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Simulated Model */}
        <div className="relative bg-gradient-to-b from-[#FFF2EE] to-[#FAF9F6] p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-3 text-white text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Caimento Simulado
              </span>
              <span className="text-xs font-bold leading-tight">
                {product.name} • {selectedColor}
              </span>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-xs text-xs font-semibold text-[#171b2b] border border-gray-100">
            <span>Tamanho Recomendado:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ff6b57] text-white font-extrabold">
              {recommendation.size}
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span>Altura da Criança:</span>
              <span className="text-[#ff6b57] font-extrabold">{childHeight} cm</span>
            </div>
            <input
              type="range"
              min="85"
              max="140"
              value={childHeight}
              onChange={(e) => setChildHeight(Number(e.target.value))}
              className="w-full accent-[#ff6b57] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>85 cm (2 anos)</span>
              <span>110 cm (5 anos)</span>
              <span>140 cm (10 anos)</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-gray-700 mb-1.5">Idade Aproximada:</span>
            <div className="grid grid-cols-4 gap-2">
              {['2-3 anos', '4-5 anos', '6-7 anos', '8-10 anos'].map((age) => (
                <button
                  key={age}
                  onClick={() => setChildAge(age)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    childAge === age
                      ? 'bg-[#171b2b] text-white border-[#171b2b]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Dica da Especialista:</span> {recommendation.note}. O tecido 100% algodão pré-encolhido não encolhe após a primeira lavagem.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-[#ff6b57] text-white text-xs font-bold hover:bg-[#ff5745] transition-colors"
          >
            Escolher Tamanho {recommendation.size}
          </button>
        </div>
      </div>
    </div>
  );
};
