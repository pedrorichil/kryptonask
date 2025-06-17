import React from 'react';
import AssistantCard from './AssistantCard';

const HomePage = ({ userName, recentAssistants, onSelectAssistant }) => {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Bem-vindo(a), {userName}!</h1>
            <p className="text-lg text-gray-400 mt-2 mb-10">Selecione um assistente para começar</p>

            <h2 className="text-2xl font-semibold text-white mb-6">Chats adicionados recentemente</h2>
            
            {recentAssistants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentAssistants.map(assistant => (
                        <AssistantCard
                            key={assistant.id}
                            assistant={assistant}
                            onSelectAssistant={onSelectAssistant}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Nenhum chat recente encontrado.</p>
            )}
        </div>
    );
};

export default HomePage;