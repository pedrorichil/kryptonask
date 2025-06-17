import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, Edit, Trash2, Shield, Settings, FileText, BarChart2 } from 'lucide-react';

// Componente de formulário dinâmico (sem alterações)
const ResourceForm = ({ item, view, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || {});
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const getFormFields = () => {
        switch (view) {
            case 'admins':
                return [{ name: 'email', label: 'Email do Administrador', type: 'email' }];
            case 'apps':
                return [
                    { name: 'titulo', label: 'Título do App', type: 'text' },
                    { name: 'grupo', label: 'Grupo (Setor)', type: 'text' },
                    { name: 'descricao', label: 'Descrição', type: 'textarea' },
                    { name: 'url', label: 'URL/ID do Assistente', type: 'text' },
                    { name: 'permite_arquivos', label: 'Permite Arquivos (true/false)', type: 'text' },
                ];
            case 'setores':
                return [
                    { name: 'nome', label: 'Nome do Setor', type: 'text' },
                    { name: 'setor', label: 'ID do Setor (ex: fiscal)', type: 'text' },
                ];
            default:
                return [];
        }
    };

    const fields = getFormFields();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2b2e47] p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{item.id ? 'Editar' : 'Criar Novo'} {view.slice(0, -1)}</h2>
                <form onSubmit={handleSubmit}>
                    {fields.map(field => (
                        <div key={field.name} className="mb-4">
                            <label className="block text-gray-400 mb-1" htmlFor={field.name}>{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    // ... (props existentes)
                                    required // Adiciona validação nativa do navegador
                                ></textarea>
                            ) : (
                                <input
                                    // ... (props existentes)
                                    required // Adiciona validação nativa do navegador
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="py-2 px-4 rounded bg-gray-600 hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded bg-blue-600 hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminPanel = ({ onBack, user }) => {
    const [view, setView] = useState('dashboard');
    const [data, setData] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (view === 'dashboard') {
            setData([]);
            return;
        }
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/${view}/`);
                setData(response.data);
            } catch (error) {
                console.error(`Erro ao buscar dados de ${view}:`, error);
                alert(`Não foi possível carregar os dados de ${view}.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [view]);

    const handleSave = async (formData) => {
        const resource = view;
        const id = formData.id;

        try {
            if (id) {
                await api.put(`/${resource}/${id}`, formData);
            } else {
                await api.post(`/${resource}/`, formData);
            }
            setView('dashboard');
            setView(resource);
        } catch (error) {
            console.error(`Erro ao salvar ${resource}:`, error);
            alert(`Não foi possível salvar. Verifique o console para mais detalhes.`);
        } finally {
            setEditingItem(null);
        }
    };
    
    const handleDelete = async (id) => {
        const resource = view;
        if (!window.confirm(`Tem certeza que deseja apagar o item ${id} de ${resource}?`)) {
            return;
        }

        try {
            // Nota: a API de Admins não possui um endpoint DELETE, então isso falhará para admins.
            await api.delete(`/${resource}/${id}`);
            setData(prevData => prevData.filter(item => item.id !== id));
        } catch (error) {
            console.error(`Erro ao apagar ${resource}:`, error);
            alert(`Não foi possível apagar. Verifique o console para mais detalhes.`);
        }
    };

    const handleSetView = (newView) => {
        setView(newView);
        // --- LOG DE AÇÃO COM EMAIL ---
        if (user) {
            api.post('/logs/', { 
                ip: user.email, // Enviando email no campo 'ip'
                action: `Admin visualizou a seção: ${newView}`
            });
        }
    };

    const renderTable = () => {
        if (isLoading) return <p>Carregando...</p>;
        if (!data || data.length === 0) return <p>Nenhum item encontrado.</p>;

        const headers = Object.keys(data[0] || {});

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-gray-700">
                            {headers.map(h => <th key={h} className="p-2 whitespace-nowrap">{h}</th>)}
                            {view !== 'logs' && <th className="p-2">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                {headers.map(header => {
                                    // --- INÍCIO DA ALTERAÇÃO ---
                                    // Verifica se estamos na view 'apps' e na coluna 'imagem'
                                    if (view === 'apps' && header === 'imagem' && item[header]) {
                                        return (
                                            <td key={`${item.id}-${header}`} className="p-2">
                                                <img 
                                                    src={`data:image/png;base64,${item[header]}`} 
                                                    alt="Ícone do App" 
                                                    className="w-10 h-10 object-cover rounded-md bg-gray-700"
                                                />
                                            </td>
                                        );
                                    }
                                    // Para todas as outras células, renderiza o texto
                                    return (
                                        <td key={`${item.id}-${header}`} className="p-2 truncate max-w-xs align-middle">
                                            {String(item[header])}
                                        </td>
                                    );
                                    // --- FIM DA ALTERAÇÃO ---
                                })}
                                {view !== 'logs' && (
                                    <td className="p-2 flex gap-2 align-middle">
                                        <button onClick={() => setEditingItem(item)} className="text-yellow-400 hover:text-yellow-300"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    
    const navButtons = [
        { key: 'admins', label: 'Admins', icon: <Shield /> },
        { key: 'apps', label: 'Apps', icon: <Settings /> },
        { key: 'setores', label: 'Setores', icon: <BarChart2 /> },
        { key: 'logs', label: 'Logs', icon: <FileText /> },
    ];

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-6 text-blue-400 hover:underline">&larr; Voltar para a Galeria</button>
            <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

            <div className="flex gap-4 mb-8">
                {navButtons.map(btn => (
                     <button 
                        key={btn.key}
                        onClick={() => setView(btn.key)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${view === btn.key ? 'bg-blue-600 text-white' : 'bg-[#2b2e47] hover:bg-[#3a3d5e]'}`}
                    >
                        {btn.icon}
                        <span>Gerenciar {btn.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-[#1a1c29] p-6 rounded-lg">
                {view !== 'dashboard' && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold capitalize">{view}</h2>
                        {view !== 'logs' && (
                           <button onClick={() => setEditingItem({})} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg">
                               <PlusCircle size={18} />
                               <span>Criar Novo</span>
                           </button>
                        )}
                    </div>
                )}
                {view === 'dashboard' ? <p>Selecione uma categoria acima para gerenciar.</p> : renderTable()}
            </div>

            {editingItem && (
                <ResourceForm 
                    item={editingItem}
                    view={view}
                    onSave={handleSave}
                    onCancel={() => setEditingItem(null)}
                />
            )}
        </div>
    );
};

export default AdminPanel;