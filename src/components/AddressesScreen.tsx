import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { DeliveryAddress } from '../types';
import { fetchAddressByCep, formatCep, cleanCep } from '../lib/viaCep';
import { 
  ArrowLeft, MapPin, Plus, Check, Trash2, Edit3, 
  Search, Loader2, Home, Briefcase, Building, ShieldCheck, Sparkles 
} from 'lucide-react';

export const AddressesScreen: React.FC = () => {
  const { 
    addresses, 
    selectedAddressId, 
    setSelectedAddressId, 
    saveAddress, 
    deleteAddress, 
    setDefaultAddress, 
    closeSubScreen, 
    showToast 
  } = useCart();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form State
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [label, setLabel] = useState('Casa');
  const [isDefault, setIsDefault] = useState(false);

  // ViaCEP State
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setCep('');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setRecipientName('');
    setLabel('Casa');
    setIsDefault(false);
    setCepFeedback(null);
    setEditingAddressId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setCep(formatCep(addr.cep));
    setStreet(addr.street);
    setNumber(addr.number);
    setComplement(addr.complement || '');
    setNeighborhood(addr.neighborhood);
    setCity(addr.city);
    setState(addr.state);
    setRecipientName(addr.recipientName);
    setLabel(addr.label);
    setIsDefault(addr.isDefault);
    setCepFeedback(null);
    setIsFormOpen(true);
  };

  // Real-time ViaCEP lookup
  const handleCepSearch = async (targetCep = cep) => {
    const rawDigits = cleanCep(targetCep);
    if (rawDigits.length !== 8) {
      setCepFeedback({ type: 'error', message: 'Digite um CEP completo com 8 dígitos.' });
      return;
    }

    setIsSearchingCep(true);
    setCepFeedback(null);

    try {
      const data = await fetchAddressByCep(rawDigits);
      if (data) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        setCepFeedback({
          type: 'success',
          message: `Endereço localizado via ViaCEP: ${data.localidade} - ${data.uf}`
        });
        showToast('✓ Endereço preenchido via ViaCEP!');
        // Focus number input next
        setTimeout(() => {
          document.getElementById('address-number-input')?.focus();
        }, 150);
      } else {
        setCepFeedback({
          type: 'error',
          message: 'CEP não encontrado na base oficial. Preencha os campos manualmente.'
        });
      }
    } catch (err: any) {
      setCepFeedback({
        type: 'error',
        message: err.message || 'Erro ao conectar à API do ViaCEP.'
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    const digits = cleanCep(formatted);
    if (digits.length === 8) {
      handleCepSearch(formatted);
    } else {
      setCepFeedback(null);
    }
  };

  const handleQuickCep = (testCep: string) => {
    const formatted = formatCep(testCep);
    setCep(formatted);
    handleCepSearch(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanCep(cep) || cleanCep(cep).length !== 8) {
      showToast('Por favor, informe um CEP válido com 8 números');
      return;
    }
    if (!street.trim()) {
      showToast('O logradouro/rua é obrigatório');
      return;
    }
    if (!number.trim()) {
      showToast('Informe o número da residência');
      return;
    }
    if (!city.trim() || !state.trim()) {
      showToast('Cidade e Estado são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      await saveAddress({
        id: editingAddressId || undefined,
        label,
        recipientName: recipientName.trim() || 'Mariana Siqueira',
        cep: cleanCep(cep),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        isDefault
      });
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#171B2B] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#F0ECE6] px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeSubScreen}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-[#171B2B] flex items-center gap-1.5">
              <MapPin size={18} className="text-[#FF6B57]" />
              Meus Endereços
            </h1>
            <p className="text-[11px] text-gray-500">Salvos no Firestore & consulta ViaCEP</p>
          </div>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B57] hover:bg-[#E05340] text-white text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Plus size={15} />
            <span>Novo</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* Form Modal / Accordion */}
        {isFormOpen ? (
          <div className="bg-white rounded-3xl border border-[#F0ECE6] shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <h2 className="text-sm font-black text-[#171B2B]">
                  {editingAddressId ? 'Editar Endereço' : 'Cadastrar Novo Endereço'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Type / Label selector */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Identificação do Local
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'Casa', icon: Home },
                    { id: 'Trabalho', icon: Briefcase },
                    { id: 'Outro', icon: Building }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSelected = label === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLabel(tab.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                          isSelected
                            ? 'bg-[#171B2B] text-white border-[#171B2B] shadow-2xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={14} />
                        {tab.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CEP Lookup Section */}
              <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="cep-input" className="text-[11px] font-extrabold text-[#171B2B] flex items-center gap-1">
                    <Sparkles size={13} className="text-[#FF6B57]" />
                    CEP (Busca Automática ViaCEP)
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">Formato: 00000-000</span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="cep-input"
                      type="text"
                      maxLength={9}
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="01310-200"
                      className="w-full h-11 px-3 bg-white rounded-xl text-sm font-mono font-bold text-[#171B2B] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                    />
                    {isSearchingCep && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={18} className="animate-spin text-[#FF6B57]" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCepSearch()}
                    disabled={isSearchingCep}
                    className="px-4 h-11 rounded-xl bg-[#171B2B] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition active:scale-95"
                  >
                    <Search size={14} />
                    <span>Buscar</span>
                  </button>
                </div>

                {/* Quick CEP Test Chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                    Testar CEPs rápidos (clique para preencher):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { city: 'SP - Av. Paulista', cep: '01310-200' },
                      { city: 'RJ - Copacabana', cep: '22041-001' },
                      { city: 'MG - BH Savassi', cep: '30140-071' },
                      { city: 'PR - Curitiba', cep: '80420-000' },
                      { city: 'BA - Salvador', cep: '40140-110' }
                    ].map(preset => (
                      <button
                        key={preset.cep}
                        type="button"
                        onClick={() => handleQuickCep(preset.cep)}
                        className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] text-gray-700 hover:border-[#FF6B57] hover:text-[#FF6B57] transition font-medium"
                      >
                        {preset.city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback message */}
                {cepFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                      cepFeedback.type === 'success'
                        ? 'bg-[#EBF7F0] text-[#2E6945] border border-[#CDEED9]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span className="shrink-0">{cepFeedback.type === 'success' ? '✓' : 'ℹ'}</span>
                    <span>{cepFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Logradouro / Rua */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Logradouro (Rua, Avenida, Alameda)
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Avenida Paulista"
                  className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs font-semibold text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                />
              </div>

              {/* Número e Complemento */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Número *
                  </label>
                  <input
                    id="address-number-input"
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 1578"
                    className="w-full h-11 px-3 bg-white rounded-xl text-xs font-bold text-[#171B2B] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto 82, Bloco B"
                    className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
              </div>

              {/* Bairro, Cidade e Estado */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs font-mono font-bold uppercase text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
              </div>

              {/* Destinatário */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Nome do Destinatário (Quem recebe o pacote)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: Mariana Siqueira"
                  className="w-full h-11 px-3 bg-gray-50 rounded-xl text-xs text-[#171B2B] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                />
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6B57] focus:ring-[#FF6B57]"
                />
                <span className="text-xs font-bold text-gray-700">
                  Definir como meu endereço padrão de entrega
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#FF6B57] hover:bg-[#E05340] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{editingAddressId ? 'Atualizar Endereço' : 'Salvar no Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Addresses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-[#171B2B] uppercase tracking-wider">
              Endereços Salvos ({addresses.length})
            </span>
            <span className="text-[11px] text-[#3D6751] font-semibold flex items-center gap-1">
              <ShieldCheck size={13} /> Sincronizado
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#F0ECE6] shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center mx-auto">
                <MapPin size={28} />
              </div>
              <h3 className="text-sm font-black text-[#171B2B]">Nenhum endereço cadastrado</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Cadastre seu primeiro endereço usando a busca rápida de CEP para receber suas compras.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-full bg-[#FF6B57] text-white text-xs font-black shadow-md"
              >
                Cadastrar Endereço
              </button>
            </div>
          ) : (
            addresses.map(addr => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  className={`bg-white rounded-3xl p-4 border transition-all ${
                    isSelected
                      ? 'border-[#FF6B57] ring-2 ring-[#FF6B57]/15 shadow-sm'
                      : 'border-[#F0ECE6] shadow-xs hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] text-[#171B2B] flex items-center justify-center font-bold text-xs border border-gray-100">
                        {addr.label === 'Trabalho' ? <Briefcase size={15} /> : <Home size={15} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#171B2B]">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E6945] text-[9px] font-extrabold uppercase">
                              Padrão
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500">Destinatário: {addr.recipientName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(addr)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                        title="Editar endereço"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Excluir endereço"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Address Body */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700 space-y-1">
                    <p className="font-bold text-[#171B2B]">
                      {addr.street}, {addr.number} {addr.complement ? `• ${addr.complement}` : ''}
                    </p>
                    <p className="text-gray-500">
                      {addr.neighborhood} — {addr.city}/{addr.state}
                    </p>
                    <p className="text-[11px] font-mono text-gray-400">
                      CEP: {formatCep(addr.cep)}
                    </p>
                  </div>

                  {/* Bottom selection options */}
                  <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        showToast(`Endereço "${addr.label}" selecionado para entrega!`);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                        isSelected
                          ? 'bg-[#FF6B57] text-white shadow-2xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isSelected ? '✓ Selecionado para Entrega' : 'Selecionar este Endereço'}
                    </button>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-[#3D6751] hover:underline"
                      >
                        Definir como Padrão
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
