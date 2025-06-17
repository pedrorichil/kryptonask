import React, { useState, useEffect } from 'react';
import api from '../api';
import AuthContext from '../AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const AuthWrapper = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const validateHash = async () => {
            try {
                const queryParams = new URLSearchParams(window.location.search);

                // --- ALTERAÇÃO AQUI ---
                // Em vez de procurar por queryParams.get('hash'),
                // pegamos a primeira chave da URL.
                const keysIterator = queryParams.keys();
                const rawHash = keysIterator.next().value;
                
                if (!rawHash) {
                    throw new Error("Acesso Não Autorizado. Token de acesso não encontrado na URL.");
                }
                
                const encodedHash = encodeURIComponent(rawHash);

                const response = await api.post('/validate-token', { hash: encodedHash });

                if (response.data && response.data.email) {
                    setUser(response.data);
                } else {
                    throw new Error("Token inválido ou expirado.");
                }

            } catch (err) {
                const errorMessage = err.response?.data?.detail || err.message || "Ocorreu um erro na autenticação.";
                setError(errorMessage);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateHash();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#202231] text-white">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="ml-4 text-xl">Validando acesso...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#202231] text-white">
                <ShieldAlert className="w-24 h-24 text-red-500" />
                <h1 className="mt-6 text-2xl font-bold">Acesso Não Autorizado</h1>
                <p className="mt-2 text-gray-400">{error || "Por favor, acesse através do link fornecido pela intranet."}</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;