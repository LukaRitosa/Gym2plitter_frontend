<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import axios from 'axios'

    const trenutniSplit = ref(null)
    const splitPodaci = ref(null)
    const router=useRouter()
    const loading=ref(false) 

    const ruta= import.meta.env.VITE_BASE_URL

    const token= localStorage.getItem("token")

    const danas = ref(new Date().toLocaleDateString("sv-SE"))




    const dohvatiTrenutniSplit = async () => {
        loading.value=true

        try {
            const rez = await axios.get(
                `${ruta}/split/trenutni`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            ) 
            if (!rez.data) {
                splitPodaci.value = null
                trenutniSplit.value = null
                loading.value = false
                return
            }
            splitPodaci.value= rez.data
            trenutniSplit.value = rez.data._id.toString()
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }


    const obrisiSplit = async (split_id) => {    

        loading.value = true
        try {
            await axios.delete(
                `${ruta}/split/user_split/${split_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            alert("Split je uspješno obrisan!")

            router.push('/UserSplitovi')
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        } 
    }

    onMounted(async () => {
        await dohvatiTrenutniSplit()
    })
</script>


<template>
    <div v-if="splitPodaci" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4 text-center">

        <div class="my-4">
            <RouterLink to="/UserSplitovi" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Splitovi</RouterLink>
        </div>

        <div>
            <button @click="obrisiSplit(trenutniSplit)" class="w-full bg-black text-white rounded hover:bg-red-400 p-2 font-semibold">
                Obriši split
            </button>
        </div>


        <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ splitPodaci.naziv }}</h2>

        <p class="text-sm text-gray-600 mb-4">Broj dana: {{ splitPodaci.broj_dana }}</p>

        <p class="text-sm text-gray-600 mb-4">Opis: {{ splitPodaci.opis }}</p>
        

        <div class="grid grid-cols-1 gap-4 my-4">
            <div v-for="dan in splitPodaci.dani" :key="dan.dan" class="p-6 rounded-lg border border-gray-300 shadow-md bg-red-900 text-white cursor-pointer hover:bg-red-700 transition"
            :class="{'ring-4 ring-red-300': splitPodaci.kalendar[danas.value]?.split_dan_id === dan.dan}" @click="router.push(`/UrediDan/${dan.dan}`)">
                Dan {{ dan.dan }}  {{ dan.naziv }} ({{ dan.vjezbe.length }} vježba)
            </div>
        </div>
        
        <div class="my-4">
            <RouterLink to="/pocetna" class="w-full bg-red-600 text-white rounded hover:bg-red-400 p-2 font-semibold"> Početna</RouterLink>
        </div>

        <div class="my-4">
            <RouterLink to="/kalendar" class="w-full bg-black text-white rounded hover:bg-red-400 p-2 font-semibold"> Kalendar</RouterLink>
        </div>

    </div>

    <div v-else class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4 text-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>