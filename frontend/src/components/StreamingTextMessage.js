import React, { useState, useEffect } from 'react';

const StreamingTextMessage = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reseta o texto ao receber uma nova mensagem

        let index = 0;
        const intervalId = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(intervalId);
            }
        }, 20); // Ajuste o valor (em ms) para controlar a velocidade da digitação

        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [text]); // Re-executa o efeito quando o texto muda

    return <p style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</p>;
};

export default StreamingTextMessage;