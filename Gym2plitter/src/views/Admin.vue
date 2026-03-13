<script setup>
    import { RouterLink, useRouter } from 'vue-router'

    const router = useRouter()

   const logout = () => {
        localStorage.removeItem('admin')
        router.push('/') 
    } 

</script>

<template>

    <div class="min-h-screen flex items-center justify-center bg-red-900 text-white px-4">
        <div class="w-full max-w-2xl">
            <div class="flex justify-between items-center mb-10">
                <h1 class="text-4xl font-bold">
                    Admin Panel
                </h1>

                <button @click="logout" class="bg-black px-4 py-2 rounded hover:bg-red-600 transition">
                    Odjava
                </button>
            </div>


            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <RouterLink to="/vjezbaMaker" class="bg-red-500 rounded-xl p-6 text-center hover:scale-105 hover:bg-red-400 transition shadow-lg">
                    <div class="text-xl font-semibold">Vježba maker</div>
                </RouterLink>

                <RouterLink to="/splitMaker" class="bg-red-700 rounded-xl p-6 text-center hover:scale-105 hover:bg-red-600 transition shadow-lg">
                    <div class="text-xl font-semibold">Split maker</div>
                </RouterLink>

                <RouterLink to="/hranaMaker" class="bg-green-700 rounded-xl p-6 text-center hover:scale-105 hover:bg-green-600 transition shadow-lg">
                    <div class="text-xl font-semibold">Hrana maker</div>
                </RouterLink>

                <RouterLink to="/obrokMaker" class="bg-blue-700 rounded-xl p-6 text-center hover:scale-105 hover:bg-blue-600 transition shadow-lg">
                    <div class="text-xl font-semibold">Obrok maker</div>
                </RouterLink>
            </div>
        </div>
    </div>

</template>