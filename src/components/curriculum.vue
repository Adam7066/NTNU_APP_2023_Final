<template>
  <div class="w-full p-4 pb-20">
    <div class="successMessage"/>
    <div class="errorScreenMessage"/>
    <div class="flex items-center">
      <div class="flex-grow text-center text-xl font-semibold">
        課表
      </div>
      <div>
        <Button class="" :icon="iconMenuFunc" @click="menuVisible=true"/>
      </div>
    </div>
    <Divider/>
    <div class="p-16px">
      <Popup v-model="menuVisible" placement="right">
        <CellGroup theme="card" class="overflow-auto h-screen py-4 rounded-lg">
          <template v-for="item in currList" :key="item">
            <SwipeCell>
              <Cell :title="item.name" class="p-2">
                <template #rightIcon>
                  <CloseIcon @click="deleteConfirm(item.number)"/>
                </template>
              </Cell>
            </SwipeCell>
          </template>
        </CellGroup>
      </Popup>
    </div>
    <Dialog
        v-model:visible="isShowDialog"
        title="刪除課程"
        content="確認後該操作將不可逆！"
        cancel-btn="取消"
        :confirm-btn="{ content: '確認', theme: 'danger' }"
        @confirm="deleteCurr(deleteItem)"
        @cancel="onCancel"
    >
    </Dialog>
    <div>
      <Table
          row-key="index"
          :data="currData"
          :columns="columns"
          :bordered="bordered"
          :show-header="showHeader"
          maxHeight="100%vh"
          cell-empty-content=""
      ></Table>
    </div>
    <Fab class="mb-14" :icon="iconFunc" @click="addCurrPopupVisible=true"/>

    <Popup v-model="addCurrPopupVisible" placement="bottom">
      <div class="pb-12">
        <div class="errorMessage"/>
        <div class="flex items-center h-14 w-full">
          <div class="flex-1 text-center text-lg font-bold">增加課程</div>
          <Button class="mr-8" theme="primary" variant="outline" @click="addCurr">
            確定
          </Button>
        </div>
        <Input v-model="addCurrContent.course_id" placeholder="請輸入課程代碼"/>
      </div>
    </Popup>
  </div>
</template>
<script setup lang="ts">
import {
  Button, Cell, CellGroup,
  Divider, Fab, Input, Message, Popup, SwipeCell, Table, Dialog
} from 'tdesign-mobile-vue'
import {ref, h, onMounted} from 'vue';
import {AddIcon, MenuFoldIcon, CloseIcon} from "tdesign-icons-vue-next";
import {useFetch} from "@vueuse/core";
import {useAuthStore} from "@/stores/auth";

const menuVisible = ref(false);

const iconFunc = () => h(AddIcon, {size: '24px'})
const iconMenuFunc = () => h(MenuFoldIcon, {size: '24px'})
const addCurrPopupVisible = ref(false)
const currData = ref<CurrDataValue[]>([])
const total = 13;
const addCurrContent = ref({
  course_id: ref(""),
})
const authStore = useAuthStore()


const bordered = ref(true);
const showHeader = ref(true);
const isShowDialog = ref(false);
const deleteItem = ref(0);

interface CurrItemTmp {
  number: number,
  code: string,
  name: string,
  teacher: string,
  time: string,
  location: string,
}

interface CurrItem {
  number: number,
  code: string,
  name: string,
  teacher: string,
  day: string,
  start: string,
  end: string,
  location: string,
}

interface generalCurrListResData {
  error: string;
  data: string;
}

interface currListResData {
  error: string;
  data: CurrItemTmp[];
}

const currDataInit = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'B', 'C']

interface CurrDataValue {
  index: string,
  mon: string,
  tue: string,
  wed: string,
  thur: string,
  fri: string
}


const columns = ref([
  {colKey: 'index', title: '節次', align: 'center'},
  {colKey: 'mon', title: '星期一', align: 'center'},
  {colKey: 'tue', title: '星期二', align: 'center'},
  {colKey: 'wed', title: '星期三', align: 'center'},
  {colKey: 'thur', title: '星期四', align: 'center'},
  {colKey: 'fri', title: '星期五', align: 'center'},
]);
const currList = ref<CurrItem[]>([])
const currListTmp = ref<CurrItemTmp[]>([])


const parseTime = (time: string) => {
  // use regex to parse time
  const regex = /([一二三四五六日])([0-9a-zA-Z]+)-([0-9a-zA-Z]+)/
  const match = time.match(regex)
  if (match) {
    const day = match[1]
    const start = match[2]
    const end = match[3]
    return {
      day: day,
      start: start,
      end: end
    }
  }
}

const addCurr = async () => {
  if (addCurrContent.value.course_id === "") {
    Message['error']({
      offset: [10, 16],
      content: "課程代碼不得為空",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.errorMessage') ?? undefined
    })
    return
  }
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/curriculum', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify(addCurrContent.value),
  }).get().json<generalCurrListResData>()
  if (data && data.value) {
    const resData = data.value
    if (resData.error) {
      Message['error']({
        offset: [10, 16],
        content: "新增失敗",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
      })
      addCurrContent.value.course_id = ""
      return
    }
    addCurrContent.value.course_id = ""
    addCurrPopupVisible.value = false
    Message['success']({
      offset: [10, 16],
      content: "新增成功",
      duration: 3000,
      icon: true,
      zIndex: 20000,
      context: document.querySelector('.successMessage') ?? undefined
    })
    await getCurrList()
    return
  }
}

const deleteCurr = async (id: number) => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/curriculum', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    },
    body: JSON.stringify({
      course_id: id
    }),
  }).get().json<generalCurrListResData>()
  if (data && data.value) {
    const resData = data.value
    if (resData.error) {
      Message['error']({
        offset: [10, 16],
        content: "刪除失敗",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.errorMessage') ?? undefined
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
    await getCurrList()
    return
  }
}

const compareIndexes = async (index1: string, index2: string) => {
  function getIndexValue(index: string) {
    if (index === 'A') {
      return 11
    }
    if (index === 'B') {
      return 12
    }
    if (index === 'C') {
      return 13
    }
    return parseInt(index)
  }

  const value1 = getIndexValue(index1);
  const value2 = getIndexValue(index2);

  return value1 - value2;
}

const getCurrList = async () => {
  const {data} = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}` + '/curriculums', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authStore.getToken,
    }
  }).get().json<currListResData>()
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
    currListTmp.value = data.value?.data ?? []

    // parseTime and set currData

    currList.value = []
    for (let i = 0; i < currListTmp.value.length; i++) {
      const currItem1 = currListTmp.value[i]
      const timeList = currItem1.time.split(',')
      for (let j = 0; j < timeList.length; j++) {
        const time = parseTime(timeList[j])
        if (time) {
          currList.value.push({
            number: currItem1.number,
            code: currItem1.code,
            name: currItem1.name,
            teacher: currItem1.teacher,
            day: time.day,
            start: time.start,
            end: time.end,
            location: currItem1.location,
          })
        }
      }
    }

    currData.value = []

    for(let i = 1; i <= total; i++) {
      let currDataValue:CurrDataValue = {
        index: '',
        mon: '',
        tue: '',
        wed: '',
        thur: '',
        fri: ''
      }
      currDataValue.index = currDataInit[i-1].toString()
      for(let currIdx=0; currIdx<currList.value.length; currIdx++) {
        let currItemV = currList.value[currIdx] as CurrItem
        if(currItemV.day === '一') {
          if (await compareIndexes(currItemV.start, currDataValue.index)<=0 && await compareIndexes(currItemV.end, currDataValue.index)>=0) {
            currDataValue.mon = currItemV.name + '\n' + currItemV.location + '\n'
          }
        }
        if(currItemV.day === '二') {

          if (await compareIndexes(currItemV.start, currDataValue.index)<=0 && await compareIndexes(currItemV.end, currDataValue.index)>=0) {
            currDataValue.tue = currItemV.name + '\n' + currItemV.location + '\n'
          }
        }
        if(currItemV.day === '三') {
          if (await compareIndexes(currItemV.start, currDataValue.index)<=0 && await compareIndexes(currItemV.end, currDataValue.index)>=0) {
            currDataValue.wed = currItemV.name + '\n' + currItemV.location + '\n'
          }
        }
        if(currItemV.day === '四') {
          if (await compareIndexes(currItemV.start, currDataValue.index)<=0 && await compareIndexes(currItemV.end, currDataValue.index)>=0) {
            currDataValue.thur = currItemV.name + '\n' + currItemV.location + '\n'
          }
        }
        if(currItemV.day === '五') {
          if (await compareIndexes(currItemV.start, currDataValue.index)<=0 && await compareIndexes(currItemV.end, currDataValue.index)>=0) {
            currDataValue.fri = currItemV.name + '\n' + currItemV.location + '\n'
          }
        }

      }
      currData.value.push(Object.freeze(currDataValue))
    }

  }
}

const deleteConfirm = async (ic: number) => {
  isShowDialog.value = true
  deleteItem.value = ic
}

const onCancel = async () => {
  console.log('dialog: cancel');
};

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await getCurrList()
  }
})

</script>

<style>
.t-align-center {
  font-size: 7px;
}

.t-align-center {
  padding: 4px !important;
  text-align: center !important;
  line-height: unset !important;
  height: 60px !important;
}

.wrapper {
  margin: 16px;
  display: block;
}


</style>