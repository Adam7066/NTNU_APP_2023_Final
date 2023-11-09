<template>
  <!-- flex vertical -->
  <div class="w-full h-full flex flex-col items-center justify-center">
    <div class="loginMessage"/>
    <div class="text-center text-2xl">
      <div>行動 App 程式設計期末專題</div>
      <div class="mt-10">第四組</div>
    </div>
    <div v-if="!isLogin" class="!bg-white-500 w-80 h-80 rounded-xl shadow-xl p-4 mt-4 flex flex-col justify-center">
        <Form
          ref="form"
          :data="formData"
          show-error-message
          label-align="top"
        >
        <FormItem label="電子郵件" name="email">
          <Input v-model="formData.email" borderless placeholder="請輸入電子郵件"></Input>
        </FormItem>
        <FormItem label="密碼" name="password">
          <Input v-model="formData.password" borderless type="password" :clearable="false" placeholder="請輸入密碼">
            <template #suffixIcon>
              <BrowseOffIcon />
            </template>
          </Input>
        </FormItem>
        <div class="relative justify-between flex p-16 box-border">
          <Button theme="primary" type="submit" size="large" @click="onSubmit">送出</Button>
          <Button theme="default" type="reset" size="large">重置</Button>
        </div>
      </Form>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { BrowseOffIcon } from 'tdesign-icons-vue-next';
  import {
    Button,
    Form,
    FormItem,
    Input,
    Message
  } from 'tdesign-mobile-vue'
  import { useAuthStore } from "@/stores/auth";
  import { useFetch } from "@vueuse/core";

  const authStore = useAuthStore();

  const formData = ref({
    email: '',
    password: '',
  });

  const isLogin = ref(false)

  interface AuthData {
    token: string;
  }

  interface LoginResData {
    code: number;
    msg: string;
    data: AuthData;
  }

  const onSubmit = async () => {
    const { data } = await useFetch<LoginResData>(`${import.meta.env.VITE_API_ENDPOINT}`+ '/login', {
      method: 'POST',
      body: JSON.stringify(formData.value),
    })
    if (data.value) {
      if (JSON.parse(data.value).msg !== 'success') {
        Message['error']({
          offset: [10, 16],
          content: "登入失敗，請重新嘗試！",
          duration: 3000,
          icon: true,
          zIndex: 20000,
          context: document.querySelector('.loginMessage') ?? undefined
        })
        return
      }
      const resData = JSON.parse(data.value).data
      authStore.setToken(resData.token)
      Message['success']({
        offset: [10, 16],
        content: "登入成功",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.loginMessage') ?? undefined
      })
      if (authStore.isLoggedIn) loginAfter()
    }
  }

const loginAfter = () => {
  isLogin.value = true
}
</script>