import React from 'react';

const Card = ({ icon, title, description, onClick }) => {
    // Verifica se o 'icon' é uma URL de imagem (começando com 'data:image')
    const isImage = typeof icon === 'string' && icon.startsWith('data:image');

    // Define o estilo de fundo. Se for uma imagem, usa-a. Senão, fundo padrão.
    const cardStyle = {
        backgroundImage: isImage ? `url(${icon})` : 'none',
        backgroundColor: isImage ? '' : '#2b2e47', // Cor de fundo se não houver imagem
    };

    return (
        <div
            onClick={onClick}
            style={cardStyle}
            // Classes para posicionamento do fundo e transições
            className="relative p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full bg-cover bg-center overflow-hidden"
        >
            {/* Overlay para garantir a legibilidade do texto sobre a imagem */}
            <div className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-colors duration-300"></div>

            {/* Conteúdo do Card (título e descrição) */}
            <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300 text-sm flex-grow">{description}</p>
            </div>
        </div>
    );
};

export default Card;