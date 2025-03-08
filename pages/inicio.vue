<script setup lang="ts">
/** 
 * Define la forma de la respuesta que envía tu backend en /personaje/list 
 * (con la propiedad "success" y un array "data"). 
 * Ajusta esta interfaz según el JSON que devuelva tu API.
 */
interface PersonajeListResponse {
  success: boolean;
  data: any[];
  msg?: string;
}

import { ref, reactive, computed } from 'vue';
import { useAsyncData } from '#app'; // Import necesario para useAsyncData
import type { Result } from '@/interfaces/Character.interface';
import type { Login } from '@/interfaces/Login.Interface';

// Cookies de configuración
const baseURL = useCookie("BASE_URL");
const userLogin = useCookie<Login | null>("user");

// Control de modal para crear/editar personaje
const dialog = ref(false);
const nameModal = ref("Nuevo Personaje");
const isEdit = ref(false);

/** Objeto reactivo para crear/editar un personaje */
const characterEdit = reactive<Result>({
  id: 0,
  name: '',
  status: '',
  species: '',
  type: '',
  gender: '',
  origin: { name: '', url: '' },
  location: { name: '', url: '' },
  image: '',
  episode: [],
  url: '',
  created: new Date(),
  show: false,
});

/** Campo de texto para filtrar personajes por nombre */
const filterName = ref('');

/**
 * Transforma el objeto del backend a la interfaz `Result`.
 */
function transformPersonaje(p: any): Result {
  return {
    id: p.id,
    name: p.nombre,
    species: p.especie,
    status: p.estado,
    type: p.tipo,
    gender: p.genero,
    origin: { name: p.origen || '', url: '' },
    location: { name: '', url: '' },
    image: p.foto,
    url: p.url,
    created: p.createdAt ? new Date(p.createdAt) : new Date(),
    show: p.flag ?? false,
    episode: [],
  };
}

/**
 * Carga la lista de personajes usando useAsyncData.
 * - La key "personajes" es un identificador único para Nuxt.
 * - El tipo genérico <PersonajeListResponse> asegura que 'data' tenga "success" y "data".
 */
const { data: personajesData, pending, error, refresh } = await useAsyncData<PersonajeListResponse>('personajes', () => {
  return $fetch(`${baseURL.value}/personaje/list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userLogin.value?.token}`,
    },
  });
});

/**
 * Computed que convierte la respuesta del backend en un array de Result (nuestros personajes),
 * y los ordena de forma ascendente por ID.
 */
const characters = computed<Result[]>(() => {
  // Si no hay datos o success es false, retornamos un array vacío
  if (!personajesData.value || !personajesData.value.success) return [];

  // Mapeamos cada personaje y luego ordenamos por ID ascendente
  const mapped = personajesData.value.data.map((p: any) => transformPersonaje(p));
  mapped.sort((a, b) => a.id - b.id); // Orden ascendente por id
  return mapped;
});

/**
 * Computed: filtra los personajes según 'filterName'.
 */
const filteredCharacters = computed(() => {
  if (!filterName.value) return characters.value;
  return characters.value.filter(item =>
    item.name.toLowerCase().includes(filterName.value.toLowerCase())
  );
});

/** Resetea el objeto 'characterEdit' a valores vacíos. */
function resetCharacterEdit() {
  characterEdit.id = 0;
  characterEdit.name = '';
  characterEdit.status = '';
  characterEdit.species = '';
  characterEdit.type = '';
  characterEdit.gender = '';
  characterEdit.origin = { name: '', url: '' };
  characterEdit.location = { name: '', url: '' };
  characterEdit.image = '';
  characterEdit.episode = [];
  characterEdit.url = '';
  characterEdit.created = new Date();
  characterEdit.show = false;
}

/** Inicia la creación de un nuevo personaje. */
function onClickNewCharacter() {
  nameModal.value = "Nuevo Personaje";
  isEdit.value = false;
  resetCharacterEdit();
  dialog.value = true;
}

/** Prepara la edición de un personaje existente. */
function onClickEditCharacter(item: Result) {
  nameModal.value = "Editar Personaje";
  isEdit.value = true;
  // Copiamos las propiedades de 'item' al objeto 'characterEdit'
  Object.assign(characterEdit, item);
  dialog.value = true;
}

/** Crea o actualiza el personaje y luego refresca la lista para que se vea al instante. */
async function saveCharacter() {
  if (isEdit.value) {
    // Actualizar personaje
    const { data } = await useFetch<any>(`${baseURL.value}/personaje`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userLogin.value?.token}`,
      },
      body: {
        id: characterEdit.id,
        nombre: characterEdit.name,
        especie: characterEdit.species,
        estado: characterEdit.status,
        origen: characterEdit.origin.name,
        tipo: characterEdit.type,
        genero: characterEdit.gender,
        foto: characterEdit.image,
        url: characterEdit.url,
        idUsuario: 0,
      },
    });
    if (data.value && data.value.success) {
      dialog.value = false;
      // Refrescamos la lista
      await refresh();
    }
  } else {
    // Crear personaje nuevo
    const { data } = await useFetch<any>(`${baseURL.value}/personaje`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userLogin.value?.token}`,
      },
      body: {
        nombre: characterEdit.name,
        especie: characterEdit.species,
        estado: characterEdit.status,
        origen: characterEdit.origin.name,
        tipo: characterEdit.type,
        genero: characterEdit.gender,
        foto: characterEdit.image,
        url: characterEdit.url,
        idUsuario: 0,
      },
    });
    if (data.value && data.value.success) {
      dialog.value = false;
      // Volvemos a consultar la lista
      await refresh();
    }
  }
}

/** Elimina un personaje según su ID y refresca la lista. */
async function onClickDeleteCharacter(id: number) {
  const { data } = await useFetch<any>(`${baseURL.value}/personaje/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userLogin.value?.token}`,
    },
  });
  if (data.value && data.value.success) {
    await refresh();
  }
}
</script>

<template>
  <v-container fluid>
    <!-- Si hay error al cargar -->
    <div v-if="error">
      <v-alert type="error">
        Error al cargar personajes: {{ error }}
      </v-alert>
    </div>

    <!-- Mientras esté "pending" (cargando) -->
    <div v-else-if="pending">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Una vez que ya tenemos datos o la petición terminó -->
    <div v-else>
      <!-- FILTRO -->
      <v-row>
        <v-col cols="12" lg="4" md="4" sm="12" xs="12">
          <v-text-field
            v-model="filterName"
            append-inner-icon="mdi-magnify"
            label="Buscar"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- BOTÓN NUEVO -->
      <v-row>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            size="x-large"
            block
            color="blue"
            @click="onClickNewCharacter"
          >
            Nuevo
          </v-btn>
        </v-col>
      </v-row>

      <!-- LISTA DE PERSONAJES -->
      <v-row>
        <v-col
          v-for="(item, index) in filteredCharacters"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="mx-auto" max-width="344" min-width="244">
            <!-- Imagen del personaje -->
            <v-img
              height="200px"
              :src="item.image"
              cover
            ></v-img>

            <!-- Nombre y subtítulo -->
            <v-card-title>
              {{ item.name }}
            </v-card-title>
            <v-card-subtitle>
              {{ item.species }}
            </v-card-subtitle>

            <!-- Acciones (Editar, Eliminar, Expandir) -->
            <v-card-actions>
              <v-btn
                color="blue-lighten-2"
                variant="outlined"
                @click="onClickEditCharacter(item)"
              >
                Editar
              </v-btn>

              <v-btn
                color="red-lighten-2"
                variant="outlined"
                icon="mdi-delete"
                @click="onClickDeleteCharacter(item.id)"
              ></v-btn>

              <v-spacer></v-spacer>
              <!-- Botón para expandir/cerrar detalle -->
              <v-btn
                :icon="item.show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                @click="item.show = !item.show"
              ></v-btn>
            </v-card-actions>

            <!-- Contenido expandible con v-expand-transition -->
            <v-expand-transition>
              <div v-show="item.show">
                <v-divider></v-divider>
                <v-card-text>
                  <b>Género:</b> {{ item.gender }} <br />
                  <b>Especie:</b> {{ item.species }} <br />
                  <b>Estado:</b> {{ item.status }} <br />
                  <b>Origen:</b> {{ item.origin.name }}
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- DIALOG PARA CREAR/EDITAR PERSONAJE -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ nameModal }}</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" v-model="characterEdit.name" />
          <v-text-field label="Especie" v-model="characterEdit.species" />
          <v-text-field label="Estado" v-model="characterEdit.status" />
          <v-text-field label="Origen" v-model="characterEdit.origin.name" />
          <v-text-field label="Tipo" v-model="characterEdit.type" />
          <v-text-field label="Género" v-model="characterEdit.gender" />
          <v-text-field label="Imagen URL" v-model="characterEdit.image" />
          <v-text-field label="URL" v-model="characterEdit.url" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" variant="text" @click="dialog = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="saveCharacter">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
