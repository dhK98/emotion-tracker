// src/store/authStore.ts
import { create } from 'zustand';

interface User {
    id: string;
    name: string;
}

interface AuthStore {
    user: User | null;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
    logout: () => {
        localStorage.removeItem('user'); // ← 이걸 추가!
        localStorage.removeItem('access_token');
        set({ user: null });
    },
}));
