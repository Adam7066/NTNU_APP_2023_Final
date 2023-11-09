import { defineStore } from "pinia";

export const useAuthStore =  defineStore('auth', {
    state: () => ({
        token: "",
    }),
    actions: {
        setToken(token: string) {
            this.token = token;
        },
        logout() {
            this.token = "";
        },
    },
    getters: {
        isLoggedIn: (state) => !!state.token,
        getToken: (state) => state.token,
    },
});
