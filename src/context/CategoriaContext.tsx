import React, { createContext, useContext, useState } from 'react';

export type TabCategoria = 'velas' | 'jaboneria' | 'moldes' | 'marketing';

interface CategoriaContextValue {
    activeTab: TabCategoria;
    setActiveTab: (tab: TabCategoria) => void;
}

const CategoriaContext = createContext<CategoriaContextValue>({
    activeTab: 'velas',
    setActiveTab: () => { },
});

export const CategoriaProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = useState<TabCategoria>('velas');
    return (
        <CategoriaContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </CategoriaContext.Provider>
    );
};

export const useCategoria = () => useContext(CategoriaContext);
