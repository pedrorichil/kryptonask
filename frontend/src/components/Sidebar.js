import React from 'react';
import { Home, Settings, LogOut, ChevronDown } from 'lucide-react'; // Adicionado Home

const Sidebar = ({ sectors, onSelectPage, onSelectAdmin, currentPage }) => {
    return (
        <aside className="fixed top-0 left-0 w-64 h-full bg-[#1a1c29] p-4 flex flex-col justify-between">
            <div>
                {/* Logo e Perfil */}
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full mr-3"></div>
                        <h1 className="text-xl font-bold text-white">Krypton ASK</h1>
                    </div>
                    {/* ... */}
                </div>

                {/* Navegação */}
                <nav>
                    <ul>
                        {/* Botão Início */}
                        <li className="mb-2">
                            <button
                                onClick={() => onSelectPage('home')}
                                className={`w-full flex items-center p-2 rounded-lg transition-colors ${currentPage === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700/50'}`}
                            >
                                <Home className="w-5 h-5 mr-3" />
                                <span>Início</span>
                            </button>
                        </li>
                        
                        {/* Botões dos Setores */}
                        {sectors.map(sector => (
                            <li key={sector.id} className="mb-2">
                                <button
                                    onClick={() => onSelectPage(sector.id)}
                                    className={`w-full flex items-center p-2 rounded-lg transition-colors ${currentPage === sector.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700/50'}`}
                                >
                                    <span className="mr-3">{sector.icon}</span>
                                    <span>{sector.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Rodapé do Admin */}
            <div>
                <ul>
                    <li className="mb-2">
                        <button
                            onClick={onSelectAdmin}
                            className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                            <Settings className="w-5 h-5 mr-3" />
                            <span>Painel do Admin</span>
                        </button>
                    </li>
                    {/* ... */}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;