import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import AssistantGallery from './components/AssistantGallery';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';
import { useAuth } from './AuthContext';
import { Mail, FileText, BarChart2, Users } from 'lucide-react';

const ICONS = {
    geral: <Mail className="w-5 h-5" />,
    fiscal: <FileText className="w-5 h-5" />,
    contabil: <BarChart2 className="w-5 h-5" />,
    trabalhista: <Users className="w-5 h-5" />,
};

export default function App() {
    const [page, setPage] = useState('home');
    const [sectors, setSectors] = useState([]);
    const [allAssistants, setAllAssistants] = useState([]);
    const [recentAssistants, setRecentAssistants] = useState([]);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectorsRes, appsRes] = await Promise.all([
                    api.get('/setores/'),
                    api.get('/apps/'),
                ]);
                const sectorsData = sectorsRes.data.map(sector => ({ id: sector.setor.toLowerCase(), name: sector.nome, icon: ICONS[sector.setor.toLowerCase()] || <Mail className="w-5 h-5" />, }));
                setSectors(sectorsData);
                const appsData = appsRes.data.map(app => ({ ...app, sector: app.grupo.toLowerCase(), }));
                setAllAssistants(appsData);
                const sortedApps = [...appsData].sort((a, b) => b.id - a.id);
                setRecentAssistants(sortedApps.slice(0, 6));
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
            }
        };
        fetchData();
    }, []);

    const handleSelectAssistant = (assistant) => {
        setSelectedAssistant(assistant);
        setMessages([{ id: 1, text: `Olá! Como posso te ajudar com ${assistant.titulo}?`, sender: 'ai' }]);
        setCurrentThreadId(null); 
        setPage('chat');
    };

    const handleSendMessage = async (text) => {
        const userMessage = { text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsAiTyping(true);

        try {
            const requestBody = {
                message: text,
                assistant_id: selectedAssistant.url,
                thread_id: currentThreadId
            };
            
            // 1. Inicia a tarefa no backend e obtém o task_id
            const initialResponse = await api.post('/assistant/chat', requestBody);
            const taskId = initialResponse.data.task_id;

            // 2. Começa a verificar o resultado da tarefa (polling)
            const pollForResult = async () => {
                const resultResponse = await api.get(`/assistant/chat/result/${taskId}`);
                const { status, data, error } = resultResponse.data;

                if (status === 'SUCCESS') {
                    // Tarefa concluída! Adiciona a resposta e atualiza a thread.
                    const aiMessage = { text: data.response, sender: 'ai' };
                    setMessages(prev => [...prev, aiMessage]);
                    setCurrentThreadId(data.thread_id);
                    setIsAiTyping(false);
                } else if (status === 'FAILURE') {
                    // Tarefa falhou. Exibe uma mensagem de erro.
                    console.error("Erro na tarefa do Celery:", error);
                    const errorMessage = { text: "Ocorreu um erro no processamento da sua mensagem.", sender: 'ai' };
                    setMessages(prev => [...prev, errorMessage]);
                    setIsAiTyping(false);
                } else {
                    // Tarefa ainda pendente, verifica novamente após um intervalo.
                    setTimeout(pollForResult, 2000); // Verifica a cada 2 segundos
                }
            };
            
            // Inicia a primeira verificação
            setTimeout(pollForResult, 1000);

        } catch (error) {
            console.error("Erro ao iniciar a tarefa de chat:", error);
            const errorMessage = { text: "Não foi possível enviar sua mensagem para a fila.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
            setIsAiTyping(false);
        }
    };
    
    const handleSelectPage = (pageName) => {
        setPage(pageName);
        setSelectedAssistant(null);
    };

    const handleSelectAdmin = () => setPage('admin');

    const renderPage = () => {
        const isSectorPage = sectors.some(s => s.id === page);

        if (isSectorPage) {
            const filteredAssistants = allAssistants.filter(a => a.sector === page);
            return <AssistantGallery 
                        assistants={filteredAssistants} 
                        onSelectAssistant={handleSelectAssistant} 
                    />;
        }

        switch (page) {
            case 'home':
                 return <HomePage userName={user ? user.nome.split(' ')[0] : 'Usuário'} recentAssistants={recentAssistants} onSelectAssistant={handleSelectAssistant}/>;
            case 'chat':
                return <ChatInterface
                    assistant={selectedAssistant}
                    onBack={() => setPage('home')}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isAiTyping={isAiTyping}
                />;
            case 'admin':
                return <AdminPanel onBack={() => setPage('home')} />;
            default:
                return <HomePage userName={user ? user.nome.split(' ')[0] : 'Usuário'} recentAssistants={recentAssistants} onSelectAssistant={handleSelectAssistant}/>;
        }
    };

    return (
        <div className="bg-[#202231] min-h-screen font-sans text-gray-200 flex">
            <Sidebar
                sectors={sectors}
                onSelectPage={handleSelectPage}
                onSelectAdmin={handleSelectAdmin}
                currentPage={page}
            />
            <main className="flex-1 ml-64 p-8 overflow-y-auto" style={{ height: '100vh' }}>
                {renderPage()}
            </main>
        </div>
    );
}