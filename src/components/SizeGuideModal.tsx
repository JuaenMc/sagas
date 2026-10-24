import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        <div className="bg-[#FAF9F6] p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Ruler size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171b2b]">Tabela de Medidas SAGAS</h3>
              <p className="text-[11px] text-gray-500">Valores em centímetros (cm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-[#171b2b]">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Grade Infantil (2 a 10 anos)</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="p-2.5">Tam.</th>
                    <th className="p-2.5">Idade</th>
                    <th className="p-2.5">Busto</th>
                    <th className="p-2.5">Cintura</th>
                    <th className="p-2.5">Estatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="p-2.5 font-bold text-[#ff6b57]">P</td>
                    <td className="p-2.5">2-3 anos</td>
                    <td className="p-2.5">52 cm</td>
                    <td className="p-2.5">50 cm</td>
                    <td className="p-2.5">88-98 cm</td>
                  </tr>
                  <tr className="bg-orange-50/30">
                    <td className="p-2.5 font-bold text-[#ff6b57]">M</td>
                    <td className="p-2.5">4-5 anos</td>
                    <td className="p-2.5">56 cm</td>
                    <td className="p-2.5">54 cm</td>
                    <td className="p-2.5">99-112 cm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#ff6b57]">G</td>
                    <td className="p-2.5">6-7 anos</td>
                    <td className="p-2.5">62 cm</td>
                    <td className="p-2.5">58 cm</td>
                    <td className="p-2.5">113-125 cm</td>
                  </tr>
                  <tr className="bg-orange-50/30">
                    <td className="p-2.5 font-bold text-[#ff6b57]">GG</td>
                    <td className="p-2.5">8-10 anos</td>
                    <td className="p-2.5">68 cm</td>
                    <td className="p-2.5">62 cm</td>
                    <td className="p-2.5">126-140 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-gray-600 text-[11px] space-y-1">
            <p className="font-bold text-gray-800">Como medir:</p>
            <p>• <strong>Busto:</strong> Meça com a fita métrica em volta da parte mais saliente do tórax.</p>
            <p>• <strong>Estatura:</strong> Criança descalça, encostada na parede dos pés ao topo da cabeça.</p>
            <p>• Se estiver entre dois tamanhos, sugerimos escolher o maior para maior durabilidade.</p>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#171b2b] text-white text-xs font-bold rounded-full hover:bg-black"
          >
            Fechar Tabela
          </button>
        </div>
      </div>
    </div>
  );
};
