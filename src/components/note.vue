<template>
  <div class="w-full h-full p-4">
    <div class="successMessage"/>
    <div class="errorScreenMessage"/>
    <div class="text-center text-xl font-semibold">筆記</div>
    <Divider/>
    <CellGroup theme="card">
      <template v-for="item in noteList" :key="item">
        <SwipeCell>
          <Cell :title="item.title">
            <template #rightIcon>
              <PenBrushIcon @click="reviseTitle(item.note_id, item.title)"/>
            </template>
          </Cell>
          <template #right>
            <div
                class="inline-flex items-center justify-center bg-[#ed7b2f] h-full px-4 text-white"
                @click="handlePopupContentVisible(item.note_id, item.title)"
            >
              編輯
            </div>
            <div
                class="inline-flex items-center justify-center bg-[#e34d59] h-full px-4 text-white"
                @click="deleteConfirm(item.note_id)"
            >
              刪除
            </div>
          </template>
        </SwipeCell>
      </template>
    </CellGroup>

    <Fab class="mb-14" :icon="iconFunc" @click="addNotePopupVisible=true"/>
    <Popup v-model="isPopupContentVisible" placement="right">
      <Dialog
          v-model:visible="popupCanelConfirm"
          title="取消更變"
          content="確認後如有修改項目將不會儲存，此操作不可逆！"
          cancel-btn="取消"
          :confirm-btn="{ content: '確認', theme: 'danger' }"
          @confirm="hidePopup"
          @cancel="onCancel"
      >
      </Dialog>
      <div class="w-screen h-screen flex flex-col">
<!--        two button one left one right-->
        <div class="flex flex-row justify-between"> <!-- Add justify-between class here -->
          <div class="btn btn--cancel text-center" @click="confirmContentCancel">取消</div>
          <div class="btn justify-end text-center" @click="addNoteContent">儲存</div>
        </div>
        <div class="text-center">
          {{ popupTitle }}
        </div>
        <Textarea class="flex-grow textAreaColor m-4 rounded-xl border-2 border-gray-400"  v-model="textVal" :name="popupTitle" :placeholder="popupPlaceholder" layout="vertical" />
      </div>
    </Popup>
    <Popup v-model="addNotePopupVisible" placement="bottom">
      <div class="pb-12">
        <div class="errorMessage"/>
        <div class="flex items-center h-14 w-full">
          <div class="flex-1 text-center text-lg font-bold">增加筆記</div>
          <Button class="mr-8" theme="primary" variant="outline" @click="addNoteItem">
            確定
          </Button>
        </div>
        <Input v-model="addNoteItemTitle.title" placeholder="請輸入筆記標題"/>
      </div>
    </Popup>
    <Popup v-model="reviseNotePopupVisible" placement="center">
      <div class="p-4 w-96">
        <div>修改： {{ reviseNoteTitleBefore }} 成</div>
        <Input v-model="reviseNoteTitle"/>
        <div class="flex justify-end mt-2">
          <Button theme="primary" variant="outline" @click="handleReviseNote">確認修改</Button>
        </div>
      </div>
    </Popup>
    <Dialog
        v-model:visible="isShowDialog"
        title="刪除筆記"
        content="確認後該操作將不可逆！"
        cancel-btn="取消"
        :confirm-btn="{ content: '確認', theme: 'danger' }"
        @confirm="deleteNoteItem(deleteItem.note_id)"
        @cancel="onCancel"
    >
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import {
  Divider,
  Fab,
  Cell,
  CellGroup,
  SwipeCell, Message, Button, Input, Popup, Dialog, Textarea
} from 'tdesign-mobile-vue'
import {h, onMounted, ref} from "vue";
import {AddIcon, CloseIcon, PenBrushIcon} from "tdesign-icons-vue-next";
import {useFetch} from "@vueuse/core";
import {useAuthStore} from "@/stores/auth.ts";


interface generalNoteListResData {
  error: string;
  data: string;
}

interface NoteItem {
  note_id: number;
  title: string;
}

interface NoteItemResData {
  error: string;
  data: NoteItem[];
}

const authStore = useAuthStore()
const iconFunc = () => h(AddIcon, {size: '24px'})
const addNotePopupVisible = ref(false)
const addNoteItemTitle = ref({
  title: ref("")
})
const noteList = ref<NoteItem[]>([])

const reviseNotePopupVisible = ref(false)
const reviseNoteTitle = ref("")
const reviseNoteTitleBefore = ref("")
const reviseNoteTitleId = ref(0)
const isShowDialog = ref(false)
const isPopupContentVisible = ref(false)
const textVal = ref("");
const popupTitle = ref("");
const popupId = ref(0);
const popupPlaceholder = ref("");
const popupCanelConfirm = ref(false);

interface deleteItemFormat {
  note_id: number;
}

const deleteItem = ref<deleteItemFormat>({
  note_id: 0,
})

const reviseTitle = (id: number, title: string) => {
  reviseNotePopupVisible.value = true
  reviseNoteTitle.value = title
  reviseNoteTitleBefore.value = title
  reviseNoteTitleId.value = id
}


const deleteConfirm = (id: number) => {
  isShowDialog.value = true
  deleteItem.value.note_id = id
}

const confirmContentCancel = () => {
  popupCanelConfirm.value = true
}

const hidePopup = () => {
  isPopupContentVisible.value = false
}

const handlePopupContentVisible = async (id: number, title: string) => {
  isPopupContentVisible.value = true
  if(title === ""){
    popupPlaceholder.value = "請輸入筆記內容"
  } else {
    popupPlaceholder.value = ""
  }
  popupTitle.value = title
  popupId.value = id
  await getNoteContent()
}

// const updatePopup = () => {
//   isPopupContentVisible.value = true
// }

// add note api
const addNoteItem = async () => {
  if (addNoteItemTitle.value.title === "") {
    Message['error']({
      offset: [10, 16],
      content: "標題內容不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorMessage') ?? undefined
    })
    return
  }
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/note', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify(addNoteItemTitle.value),
  }).get().json<generalNoteListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "新增失敗",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
      })
      return
    }
    addNoteItemTitle.value.title = ""
    addNotePopupVisible.value = false
    Message['success']({
      offset: [10, 16],
      content: "新增成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successMessage') ?? undefined
    })
    await getNoteList()
    return
  }
}

const getNoteList = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/notes', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
  }).get().json<NoteItemResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法獲取資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
      })
      return
    }
    noteList.value = data.value?.data ?? []
  }
}

const deleteNoteItem = async (id: number) => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/note', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify({
      note_id: id
    })
  }).get().json<generalNoteListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorScreenMessage') ?? undefined
      })
      return
    }
    Message['success']({
      offset: [10, 16],
      content: "刪除成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successMessage') ?? undefined
    })
    await getNoteList()
    return
  }
}

const handleReviseNote = async () => {
  if (reviseNoteTitle.value === "") {
    Message['error']({
      offset: [10, 16],
      content: "標題內容不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorMessage') ?? undefined
    })
    return
  }
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/note/title', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify({
      note_id: reviseNoteTitleId.value,
      title: reviseNoteTitle.value
    })
  }).get().json<generalNoteListResData>()

  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法修改資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorScreenMessage') ?? undefined
      })
      return
    }
    Message['success']({
      offset: [10, 16],
      content: "修改成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successMessage') ?? undefined
    })
    reviseNotePopupVisible.value = false
    await getNoteList()
    return
  }
}


// api -> POST /note/content , body -> popupId, textVal

const addNoteContent = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/note/content', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify({
      note_id: popupId.value,
      content: textVal.value
    })
  }).get().json<generalNoteListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "儲存失敗，可能是登入逾時導致無法獲取資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
      })
      return
    }
    Message['success']({
      offset: [10, 16],
      content: "儲存成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successMessage') ?? undefined
    })
    isPopupContentVisible.value = false
    await getNoteList()
    return
  }

}

// api -> GET /note/content/{nid} , nid -> popupId

const getNoteContent = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/note/content/' + popupId.value, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
  }).get().json<generalNoteListResData>()
  if (data && data.value) {
    if (data.value.error) {
      Message['error']({
        offset: [10, 16],
        content: "可能是登入逾時導致無法獲取資料，請關閉並重新登入",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
      })
      return
    }
    textVal.value = data.value?.data ?? ""
    return
  }
}

const onCancel = async () => {
  console.log('dialog: cancel');
};

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await getNoteList()
  }
})

</script>

<style scoped>
.btn {
  font-size: 16px;
  padding: 8px;
  width: 4rem !important;
}

.btn--cancel {
  color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
}

.textAreaColor {
  background-color: var(--td-textarea-background-color, rgba(0, 0, 0, 0.1));
}
</style>