import React from 'react';
import { History } from 'lucide-react'; // Importe o ícone

// Adicione a nova prop 'onShowHistory'
const AssistantListItem = ({ assistant, onSelectAssistant, onShowHistory }) => {
    const imageUrl = assistant.imagem ? `data:image/png;base64,${assistant.imagem}` : null;

    return (
        <div className="bg-[#2b2e47] p-4 rounded-lg flex items-center gap-6">
            {imageUrl && (
                <div className="flex-shrink-0">
                    <img src={imageUrl} alt={assistant.titulo} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md"/>
                </div>
            )}
            <div className="flex-grow flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{assistant.titulo}</h3>
                    <p className="text-gray-400 text-sm">{assistant.descricao}</p>
                </div>
                {/* Botões de ação */}
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => onShowHistory(assistant)}
                        className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <History size={16} />
                        Histórico
                    </button>
                    <button
                        onClick={() => onSelectAssistant(assistant)}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Acessar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistantListItem;