<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { onMounted, ref } from 'vue'
    import axios from 'axios'


    const userPodaci = ref(null)
    const loading = ref(null)
    const poruka=ref("") 

    const router=useRouter()

    const ruta= import.meta.env.VITE_BASE_URL
    

    onMounted(async () => {
        
        loading.value=true

        try{
            const token= localStorage.getItem("token")
            
            const rez= await axios.get(
                `${ruta}/user/profil`, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            userPodaci.value= rez.data
        }catch(error){
            localStorage.removeItem("token")
            router.push("/")
        }finally{
            loading.value= false
        }
    }) 

    function idiNaPrehranu(){
        const danas= new Date().toLocaleDateString("sv-SE")
        router.push(`/prehrana/${danas}`) 
    }



    const logout = () => {
        localStorage.removeItem("token")
        router.push("/")
    }



</script>

<template>

    <button @click="logout" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded m-4 font-semibold" v-if=!loading>
        Odjava
    </button>
    
    <div v-if="!loading" class="flex flex-col items-center justify-center h-screen bg-red-50 text-red-950 gap-6 p-6">

        <div class="text-center mb-6 p-4">
                <div class="text-5xl font-serif font-bold">GymSplitter</div>
                <div class="text-center text-4xl mt-2">🏋️‍♀️</div>
        </div>
        
        
        <div v-if="userPodaci" class="text-xl space-y-2">
            <div>
                <b>Ime i prezime:</b> {{ userPodaci.username }}
            </div>
            <div>
                <b>Slobodno vrijeme:</b> {{ userPodaci.slobodnoVrijeme || 'Nije uneseno' }}
            </div>
        </div>

        <div v-if="userPodaci && !userPodaci.slobodnoVrijeme" class="flex flex-col items-center justify-center ">
            <div class="my-4">
                Preporučamo da riješiš naš test za procjenu tvog slobodnog vremena na raspolaganju za bolje prijedloge!             
            </div>
            <div >
                <RouterLink to="/test" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Test</RouterLink>
            </div>
        </div>

        <div v-else>
            <RouterLink to="/test" class="w-full bg-gray-800 text-white rounded hover:bg-gray-600 p-2 font-semibold">Promjeni podatke</RouterLink>
        </div>

        <div v-if="userPodaci && userPodaci.trenutniSplit">
            <RouterLink to="/Split" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Split</RouterLink>
        </div>

        <div v-else>
            <RouterLink to="/SplitBiranje" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Split biranje</RouterLink>
        </div>

        <div >
            <RouterLink to="/kalendar" class="w-full bg-pink-800 text-white rounded hover:bg-pink-600 p-2 font-semibold"> Kaledar</RouterLink>
        </div>

        <div >
            <RouterLink to="/kalkulatorTest" class="w-full bg-yellow-800 rounded hover:bg-yellow-600 p-2 font-semibold"> kalkulator</RouterLink>
        </div>

        <div >
            <RouterLink to="/hranaBiranje" class="w-full bg-pink-800 rounded hover:bg-pink-600 p-2 font-semibold"> biranje hrane</RouterLink>
        </div>

        <div >
            <button @click="idiNaPrehranu" class="w-full bg-pink-800 rounded hover:bg-pink-600 p-2 font-semibold"> Prehrana</button>
        </div>

        <div >
            <RouterLink to="/UserHranaMaker" class="w-full bg-green-800 rounded hover:bg-pink-600 p-2 font-semibold"> Hrana Maker</RouterLink>
        </div>

        <div >
            <RouterLink to="/UserObrokMaker" class="w-full bg-yellow-800 rounded hover:bg-pink-600 p-2 font-semibold"> Obrok Maker</RouterLink>
        </div>

        <div >
            <RouterLink to="/UserSplitMaker" class="w-full bg-pink-800 rounded hover:bg-pink-600 p-2 font-semibold"> Split Maker</RouterLink>
        </div>


        
        
        <div class="text-red-500">{{ poruka }}</div>

    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>