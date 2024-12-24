// context/VisibilityContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VisibilityContextProps {
    isVisible: boolean;
    toggleVisibility: () => void;
}

const defaultContextValue: VisibilityContextProps = {
    isVisible: true,
    toggleVisibility: () => {},
};

const AvatarVisibilityContext = createContext<VisibilityContextProps | undefined>(undefined);

export const VisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => setIsVisible((prev) => !prev);

    return (
        <AvatarVisibilityContext.Provider value={{ isVisible, toggleVisibility }}>
            {children}
        </AvatarVisibilityContext.Provider>
    );
};

export const useVisibility = (): VisibilityContextProps => {
    const context = useContext(AvatarVisibilityContext);
    return context || defaultContextValue; // Use default value if context is undefined
};
