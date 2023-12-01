<template>
  <!-- flex vertical -->
  <div class="w-full h-full flex flex-col items-center justify-center">
    <div class="loginMessage"/>
    <div class="logoutMessage"/>
    <div class="text-center text-2xl">
      <div>課程小助手</div>
    </div>
      <Form
        ref="form"
        :data="formData"
        show-error-message
        label-align="top"
        v-if="!isLogin" 
        class="!bg-white-500 w-80 h-80 rounded-xl shadow-xl p-4 mt-4 flex flex-col justify-center"
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
      <div class="flex flex-grow items-center justify-center">
        <Button theme="primary" type="submit" size="large" block @click="onSubmit" class="m-4">登入</Button>
      </div>
    </Form>
    <div class="flex items-center justify-center">
      <Button theme="danger" size="large" block v-if="isLogin" @click="onSubmitLogout" class="mx-16 mt-12">
        登出
      </Button>
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
    email: ref(import.meta.env.VITE_USER_EMAIL),
    password: ref(import.meta.env.VITE_USER_PASSWORD),
  });

  const logoutData = ref({
    token: ''
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
  interface LogoutResData {
    code: number;
    msg: string;
    data: AuthData;
  }

  const onSubmit = async () => {
    const { data } = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}`+ '/login', {
      method: 'POST',
      body: JSON.stringify(formData.value),
    }).get().json<LoginResData>()

    if (data.value) {
      if (data.value.msg !== 'success') {
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
      const resData = data.value.data
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
  const onSubmitLogout = async () => {
    logoutData.value.token = authStore.getToken
    const { data } = await useFetch(`${import.meta.env.VITE_API_ENDPOINT}`+ '/logout', {
      method: 'POST',
      body: JSON.stringify(logoutData.value),
    }).get().json<LogoutResData>()

    if (data.value) {
      if (data.value.msg !== 'success') {
        Message['error']({
          offset: [10, 16],
          content: "登出失敗，請重新嘗試！",
          duration: 3000,
          icon: true,
          zIndex: 20000,
          context: document.querySelector('.logoutMessage') ?? undefined
        })
        return
      }
      authStore.logout()
      Message['success']({
        offset: [10, 16],
        content: "登出成功",
        duration: 3000,
        icon: true,
        zIndex: 20000,
        context: document.querySelector('.logoutMessage') ?? undefined
      })
      if (!authStore.isLoggedIn) logoutAfter()
    }
  }
const loginAfter = () => {
  isLogin.value = true
}
const logoutAfter = () => {
  isLogin.value = false
}


</script>