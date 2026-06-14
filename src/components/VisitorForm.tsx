import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Church, CheckCircle2, User, Phone, Mail, FileText, Heart, PlusCircle, DownloadCloud } from 'lucide-react';
import { submitToSheet, getVisitorsData, VisitorData } from '../lib/sheets';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VisitorFormProps {
  userName?: string;
}

export default function VisitorForm({ userName }: VisitorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [formData, setFormData] = useState<VisitorData>({
    name: '',
    whatsapp: '',
    email: '',
    visitorType: 'Primeira vez',
    pastoralContact: false,
    prayerRequests: '',
    ministriesInterest: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await submitToSheet(formData);
      setSuccess(true);
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      whatsapp: '',
      email: '',
      visitorType: 'Primeira vez',
      pastoralContact: false,
      prayerRequests: '',
      ministriesInterest: ''
    });
    setSuccess(false);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const data = await getVisitorsData();
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(16);
      doc.text("Relatório de Visitantes", 14, 15);
      
      const head = data.length > 0 ? [data[0]] : [[]];
      const body = data.length > 1 ? data.slice(1) : [];

      autoTable(doc, {
        head: head,
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        theme: 'grid',
      });
      
      doc.save('visitantes.pdf');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao baixar o PDF. Certifique-se de ter registrado ao menos uma visita.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4 md:p-8 font-sans text-slate-800 bg-slate-50 min-h-screen">
      <div className="bg-white w-full max-w-6xl md:h-[800px] rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar: Branding & Welcome */}
        <div className="md:w-1/3 bg-emerald-900 p-8 md:p-12 flex flex-col justify-between text-white relative flex-shrink-0">
          <div className="z-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Church size={32} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight italic">Bem-vindo à <br/>Nossa Casa.</h1>
            <p className="text-emerald-100 text-lg opacity-80 leading-relaxed font-light">Ficamos muito felizes com a sua presença. Queremos te conhecer melhor e caminhar junto com você.</p>
          </div>
          
          <div className="z-10 space-y-4 mt-12 md:mt-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-sm text-emerald-200 uppercase tracking-widest font-semibold">Recepção Digital</span>
            </div>
            {userName && (
              <div className="space-y-3">
                <p className="text-xs text-emerald-300 opacity-70">Recepção logada: {userName}</p>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-700 w-fit"
                >
                  {isDownloading ? (
                    <div className="w-3 h-3 border-2 border-emerald-100/30 border-t-emerald-100 rounded-full animate-spin" />
                  ) : (
                    <DownloadCloud size={14} />
                  )}
                  Baixar Relatório PDF
                </button>
              </div>
            )}
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-700 rounded-full -ml-24 -mb-24 opacity-10 pointer-events-none"></div>
        </div>

        {/* Right Side: The Form */}
        <div className="flex-1 p-6 md:p-12 bg-white flex flex-col h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Cadastro de Visitantes</h2>
                    <p className="text-slate-500 mt-1">Preencha os dados abaixo para registro.</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                    
                    {/* Column 1 */}
                    <div className="space-y-8">
                      {/* Identificação */}
                      <section className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <User size={20} className="text-emerald-500" />
                          <h2 className="text-lg font-bold text-slate-800">Seus Dados</h2>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nome Completo *</label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50"
                              placeholder="Ex: João da Silva"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                WhatsApp
                              </label>
                              <input
                                type="tel"
                                required
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50"
                                placeholder="(00) 00000-0000"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                E-mail
                              </label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50"
                                placeholder="seu@email.com"
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-8 flex flex-col">
                      {/* Sobre a Visita */}
                      <section className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Heart size={20} className="text-emerald-500" />
                          <h2 className="text-lg font-bold text-slate-800">Sua Visita</h2>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tipo de Visitante</label>
                              <div className="relative">
                                 <select
                                  value={formData.visitorType}
                                  onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 appearance-none text-slate-700"
                                >
                                  <option value="Primeira vez">Primeira vez!</option>
                                  <option value="Visitante frequente">Visitante frequente</option>
                                  <option value="De outra igreja">De outra igreja</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-600">
                                   <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ministérios</label>
                              <div className="relative">
                                 <select
                                  value={formData.ministriesInterest}
                                  onChange={(e) => setFormData({ ...formData, ministriesInterest: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 appearance-none text-slate-700"
                                >
                                  <option value="">Apenas conhecendo</option>
                                  <option value="Louvor/Adoração">Louvor e Adoração</option>
                                  <option value="Crianças/Infantil">Ministério Infantil</option>
                                  <option value="Jovens/Adolescentes">Jovens / Adolescentes</option>
                                  <option value="Recepção/Acolhimento">Recepção</option>
                                  <option value="Ação Social">Ação Social</option>
                                  <option value="Outros">Outros</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-600">
                                   <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div>
                              <span className="block font-bold text-emerald-900 text-sm">Contato Pastoral</span>
                              <span className="block text-xs text-emerald-700 mt-1">Deseja contato de nossos pastores?</span>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={formData.pastoralContact}
                              onClick={() => setFormData({ ...formData, pastoralContact: !formData.pastoralContact })}
                              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${formData.pastoralContact ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.pastoralContact ? 'translate-x-[26px]' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        </div>
                      </section>

                      {/* Pedidos de Oração */}
                      <section className="space-y-4 flex-1 flex flex-col min-h-[140px]">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <FileText size={20} className="text-emerald-500" />
                          <h2 className="text-lg font-bold text-slate-800">Espiritual</h2>
                        </div>
                        <div className="flex-1 flex flex-col">
                           <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pedido de Oração (Opcional)</label>
                           <textarea
                            value={formData.prayerRequests}
                            onChange={(e) => setFormData({ ...formData, prayerRequests: e.target.value })}
                            className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50 resize-none"
                            placeholder="Como podemos orar por você hoje?"
                           />
                        </div>
                      </section>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-75 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span>Enviar e Finalizar Registro</span>
                          <CheckCircle2 size={20} />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-8 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-4 sm:py-0 rounded-2xl transition-all"
                    >
                      Limpar
                    </button>
                  </div>
                  
                  <p className="mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest hidden md:block">
                    Seus dados estão protegidos e serão usados apenas para acolhimento ministerial.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Registro Concluído!</h2>
                  <p className="text-slate-500 text-lg max-w-sm mx-auto">
                    Sua ficha foi recebida com sucesso. Que Deus abençoe sua vida poderosamente!
                  </p>
                </div>
                
                <div className="pt-8 w-full mt-4">
                   <button
                    onClick={handleReset}
                    className="mx-auto flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-8 py-4 rounded-2xl transition-all"
                  >
                    <PlusCircle size={20} />
                    Registrar nova visita
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
