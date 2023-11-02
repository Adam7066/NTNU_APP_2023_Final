<template>
  <div class="w-screen h-screen">
    <keep-alive>
      <component :is="currentView"/>
    </keep-alive>

    <tab-bar v-model="tabBarValue" @change="change">
      <tab-bar-item v-for="item in tabBarList" :key="item.value" :value="item.value">
        {{ item.label }}
        <template #icon>
          <icon :name="item.icon"/>
        </template>
      </tab-bar-item>

    </tab-bar>
  </div>
</template>

<script setup lang="ts">
import {ref, shallowRef, markRaw} from 'vue'
import Curriculum from '@/components/curriculum.vue'
import Note from '@/components/note.vue'
import Todo from '@/components/todo.vue'
import Welcome from '@/components/welcome.vue'
import {TabBar, TabBarItem} from 'tdesign-mobile-vue'
import {Icon} from 'tdesign-icons-vue-next'


const currentView = shallowRef(Welcome)

const tabBarValue = ref('welcome')
const tabBarList = ref([
  {value: 'welcome', label: '歡迎', icon: 'home', comp: markRaw(Welcome)},
  {value: 'curriculum', label: '課表', icon: 'time', comp: markRaw(Curriculum)},
  {value: 'note', label: '筆記', icon: 'pen', comp: markRaw(Note)},
  {value: 'todo', label: '待辦', icon: 'root-list', comp: markRaw(Todo)},
])

const change = (value: number | string) => {
  const item = tabBarList.value.find(item => item.value === value)
  currentView.value = item?.comp ?? Welcome
}
</script>