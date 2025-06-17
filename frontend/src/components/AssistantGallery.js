import React from 'react';
import AssistantListItem from './AssistantListItem'; // Importa o novo componente

const AssistantGallery = ({ assistants, onSelectAssistant }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Assistentes Virtuais</h1>
            {/* Layout de lista vertical com espaçamento */}
            <div className="flex flex-col gap-4">
                {assistants.map(assistant => (
                    <AssistantListItem
                        key={assistant.id}
                        assistant={assistant}
                        onSelectAssistant={onSelectAssistant}
                    />
                ))}
            </div>
        </div>
    );
};

export default AssistantGallery;