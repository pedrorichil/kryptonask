import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, Edit, Trash2, Shield, Settings, FileText, BarChart2 } from 'lucide-react';

const ResourceForm = ({ item, view, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(item || {}); }, [item]);
    
    // Esta função agora será usada pelo 'onChange' dos inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    
    // ... (getFormFields) ...
    const getFormFields = () => { /* ... */ };
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
                                <textarea id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleChange} className="w-full p-2 bg-[#202231] rounded border border-gray-600" rows="3" required></textarea>
                            ) : (
                                <input type={field.type} id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleChange} className="w-full p-2 bg-[#202231] rounded border border-gray-600" required />
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
    
    // ... (useEffect e handleSave/handleDelete) ...
    const handleSetView = (newView) => {
        setView(newView);
        if (user) {
            api.post('/logs/', { ip: user.email, action: `Admin visualizou a seção: ${newView}` });
        }
    };
    
    // ... (renderTable) ...

    const navButtons = [ /* ... */ ];

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-6 text-blue-400 hover:underline">&larr; Voltar para a Galeria</button>
            <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

            <div className="flex gap-4 mb-8">
                {navButtons.map(btn => (
                     <button 
                        key={btn.key}
                        // CORREÇÃO: O onClick agora chama a função correta
                        onClick={() => handleSetView(btn.key)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${view === btn.key ? 'bg-blue-600 text-white' : 'bg-[#2b2e47] hover:bg-[#3a3d5e]'}`}
                    >
                        {btn.icon}
                        <span>Gerenciar {btn.label}</span>
                    </button>
                ))}
            </div>

            {/* ... (resto do JSX) ... */}
        </div>
    );
};

export default AdminPanel;