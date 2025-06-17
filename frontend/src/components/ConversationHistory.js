import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';

const ConversationHistory = ({ app, onLoadSession, onBack }) => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!app || !user) return;
            setIsLoading(true);
            try {
                const response = await api.get('/historico/', {
                    params: {
                        email: user.email,
                        app_id: app.id,
                        limit: 50 // Pega as últimas 50 mensagens para agrupar
                    }
                });

                // Processa a resposta para agrupar por sessão
                const groupedSessions = response.data.reduce((acc, msg) => {
                    if (!acc[msg.session]) {
                        acc[msg.session] = {
                            id: msg.session,
                            firstMessage: msg.message,
                            timestamp: msg.timestamp,
                            messageCount: 0
                        };
                    }
                    acc[msg.session].messageCount++;
                    return acc;
                }, {});
                
                setSessions(Object.values(groupedSessions).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));

            } catch (error) {
                console.error("Erro ao buscar histórico de sessões:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [app, user]);

    if (isLoading) {
        return <p className="text-white">Carregando histórico...</p>;
    }

    return (
        <div>
            <button onClick={onBack} className="mb-6 text-blue-400 hover:underline">&larr; Voltar para a Galeria</button>
            <h1 className="text-3xl font-bold mb-6">Histórico de Conversas: {app.titulo}</h1>
            <div className="flex flex-col gap-4">
                {sessions.length > 0 ? (
                    sessions.map(session => (
                        <button 
                            key={session.id} 
                            onClick={() => onLoadSession(session.id, app)}
                            className="bg-[#2b2e47] p-4 rounded-lg text-left w-full hover:bg-[#3a3d5e] transition-colors flex items-center"
                        >
                            <div className="flex-grow">
                                <p className="text-white font-semibold truncate">"{session.firstMessage}"</p>
                                <div className="text-xs text-gray-400 mt-2 flex items-center gap-4">
                                    <div className="flex items-center gap-1"><MessageSquare size={14}/> {session.messageCount} mensagens</div>
                                    <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(session.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-500" />
                        </button>
                    ))
                ) : (
                    <p className="text-gray-400">Nenhuma conversa encontrada para este assistente.</p>
                )}
            </div>
        </div>
    );
};

export default ConversationHistory;