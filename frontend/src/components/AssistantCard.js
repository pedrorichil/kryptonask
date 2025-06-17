import React from 'react';

const AssistantCard = ({ assistant, onSelectAssistant }) => {
    const imageUrl = assistant.imagem ? `data:image/png;base64,${assistant.imagem}` : null;

    return (
        <div
            onClick={() => onSelectAssistant(assistant)}
            className="bg-[#2b2e47] p-6 rounded-lg shadow-lg hover:shadow-xl hover:bg-[#3a3d5e] transition-all duration-300 cursor-pointer flex flex-col items-start h-full"
        >
            {/* Ícone ou imagem pequena no topo */}
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-[#202231] rounded-full text-3xl">
                {imageUrl ? (
                    <img src={imageUrl} alt={assistant.titulo} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <span>🤖</span>
                )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{assistant.titulo}</h3>
            <p className="text-gray-400 text-sm flex-grow">{assistant.descricao}</p>
        </div>
    );
};

export default AssistantCard;