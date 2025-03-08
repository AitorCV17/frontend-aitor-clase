<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
import type { Login } from "@/interfaces/Login.Interface";
const baseURL = useCookie("BASE_URL");
const userLogin = useCookie<Login | null>("user");
const correo = ref("");
const contraseña = ref("");
const loadingLogin = ref(false);
const msgAlert = ref("");

const onClickLogin = async () => {
  loadingLogin.value = true;
  if (!correo.value || !contraseña.value) {
    msgAlert.value = "Llene los datos correctamente";
    loadingLogin.value = false;
    return;
  }
  const { data: resLogin } = await useFetch<Login>(`${baseURL.value}/auth/login`, {
    method: "POST",
    body: {
      correo: correo.value,
      contraseña: contraseña.value,
    }
  });
  if (!resLogin.value || !resLogin.value.token) {
    msgAlert.value = "Las credenciales proporcionadas no son correctas";
    loadingLogin.value = false;
    return;
  }
  userLogin.value = resLogin.value;
  loadingLogin.value = false;
  navigateTo("/inicio");
};
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters class="fill-height d-flex align-center justify-center">
      <v-col cols="12" md="6" lg="5" sm="6">
        <v-row no-gutters class="d-flex align-center justify-center">
          <v-col cols="12" md="6">
            <h1>Iniciar sesión</h1>
            <p class="text-medium-emphasis">Ingresa tus datos</p>
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="correo">Correo</label>
              <VTextField v-model="correo" prepend-inner-icon="fluent:mail-24-regular" id="correo" name="correo" type="email" @keydown.enter="onClickLogin" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="contraseña">Contraseña</label>
              <VTextField v-model="contraseña" prepend-inner-icon="fluent:password-20-regular" id="contraseña" name="contraseña" type="password" @keydown.enter="onClickLogin" />
            </div>
            <div class="my-2">
              <v-alert v-if="msgAlert" color="error">{{ msgAlert }}</v-alert>
            </div>
            <div class="mt-5">
              <v-btn @click="onClickLogin" :loading="loadingLogin" block min-height="44" class="gradient primary">Ingresar</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col class="hidden-md-and-down fill-height d-flex align-center justify-center" md="6" lg="7">
        <VImg src="/fondo/fondo1.png" max-width="75%">
          <div class="text-center w-50 text-white mx-auto align-center"></div>
        </VImg>
      </v-col>
    </v-row>
  </v-container>
</template>
