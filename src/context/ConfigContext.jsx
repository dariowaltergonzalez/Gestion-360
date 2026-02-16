import React, { createContext, useContext, useState, useEffect } from 'react';
import { configService } from '../services/configService';

const ConfigContext = createContext();

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        features: {
            offers: false,
            orders: false,
            reporting: false
        }
    });
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        try {
            const data = await configService.getGlobalConfig();
            setConfig(data);
        } catch (error) {
            console.error("Error loading system config:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const refreshConfig = async () => {
        await loadConfig();
    };

    const value = {
        config,
        loading,
        refreshConfig,
        isFeatureEnabled: (featureName) => config?.features?.[featureName] || false
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
