<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Login } from '~/interfaces/Login.Interface'

// Importamos solo los componentes que sí existen en Vuetify 3
import {
  VAppBar,
  VBtn,
  VSpacer,
  VMenu,
  VList,
  VListItem,
  VIcon,
  VListItemTitle,
  VCard,
  VCardText,
  VDivider,
  VAvatar
} from 'vuetify/components'

// Cookie para el estado del menú lateral
const drawer = useCookie<boolean>("drawer")
// Cookie del usuario logueado
const userLogin = useCookie<Login | null>("user")

// Detecta si es mobile o desktop
const { mobile } = useDisplay()

/** Acción para cerrar sesión */
const logOut = () => {
  userLogin.value = null
  navigateTo("/")
}
</script>

<template>
  <!-- Barra superior de la app -->
  <VAppBar>
    <!-- Botón para abrir/cerrar el sidebar -->
    <VBtn variant="text" icon="mdi-menu" @click.stop="drawer = !drawer" />

    <VSpacer />

    <!-- Menú de usuario -->
    <VMenu
      rounded
      :close-on-content-click="false"
      v-if="userLogin"
    >
      <!-- Activador (vista cerrada) -->
      <template #activator="{ props }">
        <!-- Desktop: ícono + nombre del usuario -->
        <VList
          v-if="!mobile"
          class="hidden-sm-and-down"
          v-bind="props"
          style="cursor: pointer"
        >
          <VListItem>
            <!-- Usamos un slot "prepend" para el ícono/avatar -->
            <template #prepend>
              <VAvatar color="brown">
                <VIcon>mdi-account</VIcon>
              </VAvatar>
            </template>

            <!-- Título dentro del list item -->
            <VListItemTitle>
              {{ userLogin.nombres }}
            </VListItemTitle>
          </VListItem>
        </VList>

        <!-- Mobile: avatar con la inicial del usuario -->
        <VBtn v-else icon v-bind="props">
          <VAvatar color="brown" size="default">
            <span class="text-h5">
              {{ userLogin.nombres.charAt(0) }}
            </span>
          </VAvatar>
        </VBtn>
      </template>

      <!-- Menú desplegado (vista abierta) -->
      <VCard>
        <VCardText>
          <div class="mx-auto text-center">
            <!-- Avatar grande con la inicial -->
            <VAvatar color="brown" size="64" class="mb-3">
              <span class="text-h3">
                {{ userLogin.nombres.charAt(0) }}
              </span>
            </VAvatar>

            <!-- Nombre completo -->
            <h3 class="mb-1">
              {{ userLogin.nombres }}
            </h3>

            <!-- Correo debajo del nombre -->
            <p class="text-body-2">
              {{ userLogin.email }}
            </p>

            <!-- Rol del usuario -->
            <p class="text-caption mt-1">
              Rol:
              <span v-if="userLogin.tipoUsuario?.length">
                {{ userLogin.tipoUsuario.join(', ') }}
              </span>
              <span v-else>
                N/A
              </span>
            </p>

            <VDivider class="my-3" />

            <!-- Botón Salir -->
            <VBtn
              block
              rounded
              variant="elevated"
              color="error"
              @click="logOut"
            >
              Salir
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VMenu>
  </VAppBar>
</template>
