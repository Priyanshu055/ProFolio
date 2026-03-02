import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app load: read token from localStorage, then fetch the full profile from API
    // This ensures the user object is always up-to-date (not stale from localStorage)
    useEffect(() => {
        const bootstrap = async () => {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Immediately set what we have so the app doesn't hang
                setUser(parsed);
                // Then refresh from the API to get all latest fields
                if (parsed?.token) {
                    try {
                        const { data } = await axios.get('/api/users/profile', {
                            headers: { Authorization: `Bearer ${parsed.token}` }
                        });
                        const freshUser = { ...data, token: parsed.token };
                        setUser(freshUser);
                        localStorage.setItem('userInfo', JSON.stringify(freshUser));
                    } catch (err) {
                        // Token expired or invalid — log out
                        if (err.response?.status === 401) {
                            localStorage.removeItem('userInfo');
                            setUser(null);
                        }
                    }
                }
            }
            setLoading(false);
        };
        bootstrap();
    }, []);

    const login = async (email, password) => {
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('/api/users/login', { email, password }, config);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response && error.response.data.message ? error.response.data.message : error.message
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('/api/users', { name, email, password }, config);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response && error.response.data.message ? error.response.data.message : error.message
            };
        }
    }

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

