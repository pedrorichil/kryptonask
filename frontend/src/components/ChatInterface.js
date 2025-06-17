import React, { useState, useEffect, useRef } from 'react';
import StreamingTextMessage from './StreamingTextMessage';

// Componente para o indicador "digitando..."
const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
        <div className="max-w-md p-3 rounded-lg bg-[#2b2e47] text-gray-200 flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
    </div>
);


const ChatInterface = ({ assistant, onBack, messages, onSendMessage, isAiTyping }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isAiTyping]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit(e);
        }
    };

    // Verifica se a conversa já começou (o primeiro 'if' é a mensagem da IA)
    const hasConversationStarted = messages.length > 1;

    return (
        <div className="flex flex-col h-full bg-[#202231]">
            {/* Cabeçalho */}
            <div className="flex items-center p-4 border-b border-gray-700 flex-shrink-0">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-200">
                    &larr; Voltar
                </button>
                <div className="text-xl mr-3">🤖</div>
                <h2 className="text-xl font-bold text-white">{assistant.titulo}</h2>
            </div>

            {/* Corpo do Chat */}
            <div className="flex-grow p-4 overflow-y-auto">
                {hasConversationStarted ? (
                    // Se a conversa começou, exibe as mensagens
                    <div ref={chatContainerRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                                <div className={`max-w-2xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#2b2e47] text-gray-200'}`}>
                                    {msg.sender === 'ai' && index === messages.length - 1 && !isAiTyping ? (
                                        <StreamingTextMessage text={msg.text} />
                                    ) : (
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isAiTyping && <TypingIndicator />}
                    </div>
                ) : (
                    // Se a conversa NÃO começou, exibe a tela central
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full mb-4"></div>
                        <h1 className="text-5xl font-bold">
                            <span className="text-blue-400">Krypton</span>
                            <span className="text-green-400">ASK</span>
                        </h1>
                         <p className="text-gray-400 mt-2">{messages[0]?.text || "Como posso ajudar?"}</p>
                    </div>
                )}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
                 <form onSubmit={handleFormSubmit} className="flex items-center gap-2 max-w-4xl mx-auto w-full">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem..."
                        className="flex-grow p-3 bg-[#2b2e47] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                        rows="1"
                    />
                    <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;