<template>
  <div class="w-full h-full p-4">
    <div class="text-center text-xl font-semibold">待辦事項</div>

    <Divider/>

    <div class="flex justify-end">
      <Button theme="light" @click="todoStore.clearAllDone">清除所有已完成項目</Button>
    </div>

    <Divider/>

    <CellGroup theme="card">
      <template v-for="item in todoList" :key="item">
        <SwipeCell>
          <Cell :title="item.content">
            <template #leftIcon>
              <div @click="todoStore.switchTodoItemStatus(item.id)">
                <CheckIcon v-if="item.isDone"/>
                <CloseIcon v-else/>
              </div>
            </template>
            <template #rightIcon>
              <PenBrushIcon @click="reviseTodo(item.id)"/>
            </template>
          </Cell>
          <template #right>
            <div
                class="inline-flex items-center justify-center bg-[#e34d59] h-full px-4"
                @click="todoStore.deleteTodoItem(item.id)"
            >
              刪除
            </div>
          </template>
        </SwipeCell>
      </template>
    </CellGroup>

    <Fab class="mb-14" :icon="iconFunc" @click="addTodoPopupVisible=true"/>

    <Popup v-model="addTodoPopupVisible" placement="bottom">
      <div class="pb-12">
        <div class="errorMessage"/>
        <div class="flex items-center h-14 w-full">
          <div class="flex-1 text-center text-lg font-bold">增加待辦事項</div>
          <Button class="mr-8" theme="primary" variant="outline" @click="addTodo">
            確定
          </Button>
        </div>
        <Input v-model="addTodoContent" placeholder="請輸入待辦事項內容"/>
      </div>
    </Popup>

    <Popup v-model="reviseTodoPopupVisible" placement="center">
      <div class="p-4 w-96">
        <div>修改： {{ reviseTodoContent }} 成</div>
        <Input v-model="reviseTodoContent"/>
        <div class="flex justify-end mt-2">
          <Button theme="primary" variant="outline" @click="handleReviseTodo">確認修改</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import {computed, h, ref} from 'vue'
import {
  Fab,
  Popup,
  Button,
  Input,
  Message,
  Divider,
  Cell,
  CellGroup,
  SwipeCell
} from 'tdesign-mobile-vue'
import {AddIcon, CloseIcon, CheckIcon, PenBrushIcon} from "tdesign-icons-vue-next"
import {useTodoStore} from '@/stores/useTodoStore.ts'

const todoStore = useTodoStore()

const todoList = computed(() => todoStore.getTodoList)

const iconFunc = () => h(AddIcon, {size: '24px'})
const addTodoPopupVisible = ref(false)
const addTodoContent = ref("")
const addTodo = () => {
  if (addTodoContent.value === "") {
    Message['error']({
      offset: [10, 16],
      content: "待辦事項內容不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorMessage') ?? undefined
    })
    return
  }
  todoStore.addTodoItem((
      {
        id: todoStore.getNum,
        content: addTodoContent.value,
        isDone: false
      }
  ))
  addTodoContent.value = ""
  addTodoPopupVisible.value = false
}

const reviseTodoPopupVisible = ref(false)
const reviseTodoContent = ref("")
const reviseTodoId = ref(0)
const reviseTodo = (id: number) => {
  reviseTodoPopupVisible.value = true
  reviseTodoContent.value = todoList.value.find(item => item.id === id)?.content ?? ""
  reviseTodoId.value = id
}

const handleReviseTodo = () => {
  todoStore.updateTodoItem({
    id: reviseTodoId.value,
    content: reviseTodoContent.value,
    isDone: todoList.value.find(item => item.id === reviseTodoId.value)?.isDone ?? false
  })
  reviseTodoPopupVisible.value = false
}
</script>