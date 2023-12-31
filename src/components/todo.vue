<template>
  <div class="w-full p-4 pb-40">
    <div class="successTodoMessage"/>
    <div class="errorTodoScreenMessage"/>
    <div class="text-center text-xl font-semibold">待辦事項</div>

    <Divider/>

    <div class="flex justify-end">
      <Button theme="light" @click="clearAllDoneConfirm()">清除所有已完成項目</Button>
    </div>

    <Divider/>

    <CellGroup theme="card">
      <template v-for="item in todoList" :key="item">
        <SwipeCell>
          <Cell :title="item.content">
            <template #leftIcon>
              <div @click="switchTodoItemStatus(item.id)">
                <CheckCircleIcon v-if="item.is_done"/>
                <CircleIcon v-else/>
              </div>
            </template>
            <template #rightIcon>
              <PenBrushIcon @click="reviseTodo(item.id)"/>
            </template>
          </Cell>
          <template #right>
            <div
                class="inline-flex items-center justify-center bg-[#e34d59] h-full px-4 text-white"
                @click="deleteTodoItemConfirm(item.id)"
            >
              刪除
            </div>
          </template>
        </SwipeCell>
      </template>
    </CellGroup>

    <Dialog
        v-model:visible="isShowDeleteConfirmDialog"
        title="刪除待辦事項"
        content="確認後該操作將不可逆！"
        cancel-btn="取消"
        :confirm-btn="{ content: '確認', theme: 'danger' }"
        @confirm="deleteTodoItem(deleteTodoId)"
        @cancel="onCancel"
    >
    </Dialog>

    <Dialog
        v-model:visible="isShowDeleteAllConfirmDialog"
        title="刪除已勾選完成事項"
        content="確認後該操作將不可逆！"
        cancel-btn="取消"
        :confirm-btn="{ content: '確認', theme: 'danger' }"
        @confirm="clearAllDone()"
        @cancel="onCancel"
    >
    </Dialog>

    <Fab class="mb-14" :icon="iconFunc" @click="addTodoPopupVisible=true"/>

    <Popup v-model="addTodoPopupVisible" placement="bottom">
      <div class="pb-12">
        <div class="errorTodoMessage"/>
        <div class="flex items-center h-14 w-full">
          <div class="flex-1 text-center text-lg font-bold">增加待辦事項</div>
          <Button class="mr-8" theme="primary" variant="outline" @click="addTodo">
            確定
          </Button>
        </div>
        <Input v-model="addTodoContent.content" placeholder="請輸入待辦事項內容"/>
      </div>
    </Popup>

    <Popup v-model="reviseTodoPopupVisible" placement="center">
      <div class="p-4 w-96">
        <div>修改： {{ reviseTodoContentBefore }} 成</div>
        <Input v-model="reviseTodoContent"/>
        <div class="flex justify-end mt-2">
          <Button theme="primary" variant="outline" @click="handleReviseTodo">確認修改</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import {h, onMounted, ref} from 'vue'
import {
  Fab,
  Popup,
  Button,
  Input,
  Message,
  Divider,
  Cell,
  CellGroup,
  SwipeCell, Dialog
} from 'tdesign-mobile-vue'
import {AddIcon, CheckCircleIcon, CircleIcon, PenBrushIcon} from "tdesign-icons-vue-next"
import {TodoItem} from '@/stores/useTodoStore.ts'
import {useFetch} from "@vueuse/core";
import {useAuthStore} from "@/stores/auth";

const todoList = ref<TodoItem[]>([])

const iconFunc = () => h(AddIcon, {size: '24px'})
const addTodoPopupVisible = ref(false)
const authStore = useAuthStore()

const addTodoContent = ref({
  content: ref(""),
})

interface generalTodoListResData {
  error: string;
  data: string;
}

interface todoListResData {
  error: string;
  data: TodoItem[];
}

const addTodo = async () => {
  if (addTodoContent.value.content === "") {
    Message['error']({
      offset: [10, 16],
      content: "待辦事項內容不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorTodoMessage') ?? undefined
    })
    return
  }
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/create_todo_item', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify(addTodoContent.value),
  }).get().json<generalTodoListResData>()
  if (data && data.value) {
    const resData = data.value
    if (resData.error) {
      Message['error']({
        offset: [10, 16],
        content: "新增失敗",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorTodoScreenMessage') ?? undefined
      })
      addTodoContent.value.content = ""
      return
    }
    addTodoContent.value.content = ""
    addTodoPopupVisible.value = false
    Message['success']({
      offset: [10, 16],
      content: "新增成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successTodoMessage') ?? undefined
    })
    await getTodoList()
    return
  }
}


const isShowDeleteConfirmDialog = ref(false)
const deleteTodoId = ref(0)
const deleteTodoItemConfirm = (id: number) => {
  deleteTodoId.value = id
  isShowDeleteConfirmDialog.value = true
}

const isShowDeleteAllConfirmDialog = ref(false)
const clearAllDoneConfirm = () => {
  isShowDeleteAllConfirmDialog.value = true
}


const reviseTodoPopupVisible = ref(false)
const reviseTodoContent = ref("")
const reviseTodoId = ref(0)
const reviseTodoIsDone = ref(false)
const reviseTodoContentBefore = ref("")

const reviseTodo = (id: number) => {
  reviseTodoPopupVisible.value = true
  reviseTodoContent.value = todoList.value.find(item => item.id === id)?.content ?? ""
  reviseTodoId.value = id
  reviseTodoIsDone.value = todoList.value.find(item => item.id === id)?.is_done ?? false
  reviseTodoContentBefore.value = reviseTodoContent.value
}

const clearAllDone = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/delete_all_done', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    }
  }).get().json<generalTodoListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorTodoScreenMessage') ?? undefined
      })
      return
    }
    Message['success']({
      offset: [10, 16],
      content: "清除成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successTodoMessage') ?? undefined
    })
    await getTodoList()
    isShowDeleteAllConfirmDialog.value = false
    return
  }
}

const deleteTodoItem = async (id: number) => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/delete_todo_item', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify({
      id: id
    })
  }).get().json<generalTodoListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorTodoScreenMessage') ?? undefined
      })
      return
    }
    Message['success']({
      offset: [10, 16],
      content: "刪除成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successTodoMessage') ?? undefined
    })
    await getTodoList()
    isShowDeleteConfirmDialog.value = false
    deleteTodoId.value = 0
    return
  }
}

const switchTodoItemStatus = async (id: number) => {
  const item = todoList.value.find(item => item.id === id)
  if (item) {
    const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/switch_todo_item_status', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authStore.getToken,
      },
      body: JSON.stringify({
        id: id
      })
    }).get().json<generalTodoListResData>()
    if (data && data.value) {
      if (data.value.error) {
        Message['error']({
          offset: [10, 16],
          content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
          duration: 3000,
          icon: true,
          zIndex: 20000,
          context: document.querySelector('.errorTodoScreenMessage') ?? undefined
        })
        return
      }
      await getTodoList()
    }
  }
}

const handleReviseTodo = async () => {
  if (reviseTodoContent.value === "") {
    Message['error']({
      offset: [10, 16],
      content: "待辦事項內容不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorTodoScreenMessage') ?? undefined
    })
    return
  }
  if (reviseTodoId.value) {
    const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/update_todo_item', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + authStore.getToken,
      },
      body: JSON.stringify({
        id: reviseTodoId.value,
        content: reviseTodoContent.value,
        is_done: reviseTodoIsDone.value
      })
    }).get().json<generalTodoListResData>()
    if (data && data.value) {
      if (data.value.error) {
        Message['error']({
          offset: [10, 16],
          content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
          duration: 3000,
          icon: true,
          zIndex: 20000,
          context: document.querySelector('.errorTodoScreenMessage') ?? undefined
        })
        return
      }
      Message['success']({
        offset: [10, 16],
        content: "修改成功",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.successTodoMessage') ?? undefined
      })
    }
    reviseTodoPopupVisible.value = false
    await getTodoList()
  }
}

const getTodoList = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/get_todo_list', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    }
  }).get().json<todoListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法獲取資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorTodoScreenMessage') ?? undefined
      })
      return
    }
    todoList.value = data.value?.data ?? []
  }
}

const onCancel = async () => {
  console.log('dialog: cancel');
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await getTodoList()
  }
})
</script>