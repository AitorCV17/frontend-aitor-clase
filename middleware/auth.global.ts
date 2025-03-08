import type { Login } from "~/interfaces/Login.Interface";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userLogin = useCookie<Login | null>("user");
  const baseURL = useCookie("BASE_URL");

  // 1. Si estás en la raíz ("/"):
  if (to.path === "/") {
    // Si el usuario ya tiene token, redirige a "/inicio"
    if (userLogin.value && userLogin.value.token) {
      return navigateTo("/inicio");
    }
    // Si NO hay token, permítele ver la raíz (login), sin redirección
    return;
  }

  // 2. Para cualquier otra ruta (rutas "protegidas"):
  // Si NO hay token, redirige a "/"
  if (!userLogin.value || !userLogin.value.token) {
    return navigateTo("/");
  }

  // 3. Si sí hay token, refresca el token
  const { data: resRefreshToken } = await useFetch<Login>(
    `${baseURL.value}/auth/refresh-token`,
    {
      method: "POST",
      body: {
        token: userLogin.value.token,
      },
    }
  );

  // 4. Si el refresh falla, borra cookie y redirige a "/"
  if (resRefreshToken.value?.status === false) {
    userLogin.value = null;
    return navigateTo("/");
  }

  // 5. Si todo está bien, actualiza la cookie
  userLogin.value = resRefreshToken.value;
});
