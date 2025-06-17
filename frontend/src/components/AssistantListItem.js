import React from 'react';

const AssistantListItem = ({ assistant, onSelectAssistant }) => {
    // Constrói a URL da imagem a partir do Base64, se existir
    const imageUrl = assistant.imagem ? `data:image/png;base64,${assistant.imagem}` : null;

    return (
        <div className="bg-[#2b2e47] p-4 rounded-lg flex items-center gap-6">
            {/* Coluna da Imagem */}
            {imageUrl && (
                <div className="flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={assistant.titulo}
                        // CSS para redimensionar a imagem, equivalente ao 'redimensionar_imagem_base64'
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md"
                    />
                </div>
            )}

            {/* Coluna do Conteúdo */}
            <div className="flex-grow flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{assistant.titulo}</h3>
                    <p className="text-gray-400 text-sm">{assistant.descricao}</p>
                </div>
                <div className="mt-4 flex justify-end">
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