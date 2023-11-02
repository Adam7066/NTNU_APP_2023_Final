import {defineStore} from "pinia"

export interface TodoItem {
    id: number,
    content: string,
    isDone: boolean,
}

export const useTodoStore = defineStore('todo', {
    state: () => ({
        num: 1,
        todoList: [] as TodoItem[],
    }),
    actions: {
        addTodoItem(todoItem: TodoItem) {
            this.todoList.push(todoItem)
            ++this.num
        },
        deleteTodoItem(id: number) {
            this.todoList = this.todoList.filter(todoItem => todoItem.id !== id)
        },
        clearAllDone() {
            this.todoList = this.todoList.filter(todoItem => !todoItem.isDone)
        },
        switchTodoItemStatus(id: number) {
            this.todoList = this.todoList.map(todoItem => {
                if (todoItem.id === id) {
                    todoItem.isDone = !todoItem.isDone
                }
                return todoItem
            })
        },
        updateTodoItem(todoItem: TodoItem) {
            this.todoList = this.todoList.map(item => {
                if (item.id === todoItem.id) {
                    item = todoItem
                }
                return item
            })
        }
    },
    getters: {
        getNum: (state) => state.num,
        getTodoList: (state) => state.todoList,
    },
    persist: true,
})