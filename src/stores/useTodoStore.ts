import {defineStore} from "pinia"

export interface TodoItem {
    id: number,
    content: string,
    is_done: boolean,
}

export const useTodoStore = defineStore('todo', {
    state: () => ({
        num: 1,
        todoList: [] as TodoItem[],
    }),
    actions: {
    },
    getters: {
        getNum: (state) => state.num,
    },
    persist: true,
})