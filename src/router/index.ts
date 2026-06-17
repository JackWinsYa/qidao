import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/read/:bookId?/:chapterId?',
      name: 'reader',
      component: () => import('@/views/ReaderView.vue'),
    },
    {
      // 專屬上傳後台
      path: '/upload',
      name: 'upload',
      component: () => import('@/views/UploadView.vue'),
    },
  ],
})

export default router
