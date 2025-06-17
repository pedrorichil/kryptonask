import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import AssistantGallery from './components/AssistantGallery';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';
import { useAuth } from './AuthContext';
import ConversationHistory from './components/ConversationHistory'; // CORREÇÃO: Importação adicionada
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
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [historyApp, setHistoryApp] = useState(null);

    useEffect(() => {
        if (user) {
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
        }
    }, [user]);

    const handleStartNewChat = (assistant) => {
        setSelectedAssistant(assistant);
        const newSessionId = `session_${Date.now()}`;
        setCurrentSessionId(newSessionId);
        setCurrentThreadId(null);
        setMessages([{ id: 'welcome', text: `Olá! Como posso te ajudar com ${assistant.titulo}?`, sender: 'ai' }]);
        setPage('chat');
        if (user) {
            api.post('/logs/', { ip: user.email, action: `Iniciou chat com o app: "${assistant.titulo}"`, app_id: assistant.id });
        }
    };

    const handleShowHistory = (assistant) => {
        setHistoryApp(assistant);
        setPage('history');
    };

    const handleLoadSession = async (sessionId, assistant) => {
        setSelectedAssistant(assistant);
        setCurrentSessionId(sessionId);
        setCurrentThreadId(null);
        setPage('chat');
        setIsAiTyping(true);
        try {
            const historyRes = await api.get('/chat/history', {
                params: { email: user.email, app_id: assistant.id, session_id: sessionId }
            });
            const historyMessages = historyRes.data.map(msg => ({
                id: msg.id, text: msg.message, sender: msg.sender
            }));
            setMessages(historyMessages);
        } catch (error) {
            console.error("Erro ao carregar histórico da sessão:", error);
            setMessages([{id: 'error', text: 'Não foi possível carregar o histórico desta sessão.', sender: 'ai'}]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // CORREÇÃO: Removida a função duplicada e não utilizada 'handleSelectAssistant'.

    const saveMessageToHistory = async (messageText, sender) => {
        if (!user || !selectedAssistant || !currentSessionId) return;
        try {
            await api.post('/chat/', { user_email: user.email, app_id: selectedAssistant.id, sender: sender, message: messageText, session: currentSessionId });
        } catch (error) {
            console.error(`Falha ao salvar mensagem (${sender}) no histórico:`, error);
        }
    };

    const handleSendMessage = async (text) => {
        const userMessage = { text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsAiTyping(true);
        await saveMessageToHistory(text, 'user');
        try {
            const requestBody = { message: text, assistant_id: selectedAssistant.url, thread_id: currentThreadId };
            const response = await api.post('/assistant/chat', requestBody);
            const aiResponseText = response.data.response || "Não recebi uma resposta válida.";
            const newThreadId = response.data.thread_id;
            const aiMessage = { text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
            setCurrentThreadId(newThreadId);
            await saveMessageToHistory(aiResponseText, 'ai');
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            const errorMessage = { text: "Desculpe, ocorreu um erro na comunicação.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiTyping(false);
        }
    };
    
    const handleSelectPage = (pageName) => {
        setPage(pageName);
        setSelectedAssistant(null);
    };

    const handleSelectAdmin = () => {
        setPage('admin');
        if (user) {
            api.post('/logs/', { ip: user.email, action: 'Acessou o Painel de Administração' });
        }
    };
    
    const renderPage = () => {
        const isSectorPage = sectors.some(s => s.id === page);

        if (isSectorPage) {
            const filteredAssistants = allAssistants.filter(a => a.sector === page);
            return <AssistantGallery assistants={filteredAssistants} onSelectAssistant={handleStartNewChat} onShowHistory={handleShowHistory} />;
        }

        switch (page) {
            case 'home':
                return <HomePage userName={user ? user.nome.split(' ')[0] : 'Usuário'} recentAssistants={recentAssistants} onSelectAssistant={handleStartNewChat}/>;
            case 'history':
                return <ConversationHistory app={historyApp} onLoadSession={handleLoadSession} onBack={() => setPage('home')} />;
            case 'chat':
                // CORREÇÃO: Passando todas as props necessárias para o ChatInterface
                return <ChatInterface
                    assistant={selectedAssistant}
                    onBack={() => setPage('home')}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isAiTyping={isAiTyping}
                />;
            case 'admin':
                // CORREÇÃO: Passando a prop 'user' para o AdminPanel
                return <AdminPanel onBack={() => setPage('home')} user={user} />;
            default:
                return <HomePage userName={user ? user.nome.split(' ')[0] : 'Usuário'} recentAssistants={recentAssistants} onSelectAssistant={handleStartNewChat}/>;
        }
    };
    
    return (
        <div className="bg-[#202231] min-h-screen font-sans text-gray-200 flex">
            <Sidebar
                sectors={sectors}
                onSelectPage={handleSelectPage}
                onSelectAdmin={handleSelectAdmin}
                currentPage={page}
                isAdmin={user?.is_admin || false}
            />
            <main className="flex-1 ml-64 p-8 overflow-y-auto" style={{ height: '100vh' }}>
                {renderPage()}
            </main>
        </div>
    );
}