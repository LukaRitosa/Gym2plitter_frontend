<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import axios from 'axios'


    const userPodaci = ref(null)
    const splits=ref([])
    const loading = ref(false)
    const router=useRouter()

    const ruta = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")

    const dohvatiUserSplitove= async() =>{
        loading.value=true

        try{
            const rez= await axios.get(
                `${ruta}/split/user_split`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            splits.value= rez.data
        }catch (error){
            console.log(error)
            alert(error.response.data.greska)
        } finally{
            loading.value= false
        }
    }
    
    const getUser= async () => {
        try{
            loading.value= true

            const rez= await axios.get(
                `${ruta}/user/profil`, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            userPodaci.value= rez.data
        }catch(error){
            console.log(error)
            alert(error.response.data.greska)
        } finally{
            loading.value= false
        }
    }

    const odaberiSplit= async (splitId) =>{
        try {
            await axios.patch(
                `${ruta}/split/trenutni_split/${splitId}`, 
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            router.push('/Split')
        } catch (error) {
            console.log(error)
            alert(error.response.data.greska)
        }
    }

    onMounted(async () => {
        await dohvatiUserSplitove()
        await getUser()
    })


</script>

<template>

    <div v-if="!loading" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4 text-center">
        <RouterLink to="/SplitBiranje" class="border bg-red-900 text-white rounded p-2 min-w-100 hover:bg-red-500">
            +
        </RouterLink>
        
        <div>

            <div v-for="split in splits" :key="split._id" @click="odaberiSplit(split._id)" class="min-w-100"
                :class="['p-4 m-2 rounded border', 
                userPodaci?.trenutniSplit === split._id
                    ? 'border-red-300 bg-red-800 text-white hover:bg-red-400'                                     
                    : 'border-gray-300 bg-gray-300 hover:bg-gray-200']">
                {{ split.naziv }}
                {{ split.broj_dana }}
            </div>
        </div>
        
        <RouterLink to="/pocetna" class="border bg-red-800 text-white rounded p-2 my-4 hover:bg-red-400">
            Početna
        </RouterLink>
    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
    
    
    
</template>