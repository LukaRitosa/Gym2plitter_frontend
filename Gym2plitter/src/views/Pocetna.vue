<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { onMounted, ref } from 'vue'
    import axios from 'axios'
    
    import SplitIkona from '@/ikone/split_ikona.svg'
    import prehranaIkona from '@/ikone/prehrana_ikona.svg'
    import korisnikIkona from '@/ikone/korisnik_ikona.svg'


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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-6">
            <div class="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-3">
                <h3 class="text-lg font-bold">Split</h3>

                <SplitIkona class="h-12 w-12 text-red-600 mb-3"/>

                
                <RouterLink :to=" userPodaci && userPodaci.trenutniSplit ? '/Split' : '/SplitBiranje'" class="w-full text-center bg-red-700 text-white rounded p-2 hover:bg-red-600">
                    {{userPodaci && userPodaci.trenutniSplit ? 'Split' : 'Split biranje'}}
                </RouterLink>

                <RouterLink to="/kalendar" class="w-full text-center bg-red-700 text-white rounded p-2 hover:bg-red-600">
                    Kalendar
                </RouterLink>

                <RouterLink to="/UserSplitMaker" class="w-full text-center bg-red-700 text-white rounded p-2 hover:bg-red-600">
                    Split Maker
                </RouterLink>
            </div>

            <div class="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-3">
                <h3 class="text-lg font-bold">Korisnik</h3>
                
                <korisnikIkona class="h-12 w-12 text-red-600 mb-3"/>
                
                <RouterLink to="/test" class="w-full text-center bg-yellow-700 rounded p-2 hover:bg-yellow-600">
                    Test
                </RouterLink>
                

                <RouterLink to="/kalkulatorTest" class="w-full text-center bg-yellow-700 rounded p-2 hover:bg-yellow-600">
                    Kalkulator
                </RouterLink>


            </div>

            <div class="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-3">
                <h3 class="text-lg font-bold">Prehrana</h3>

                <prehranaIkona class="h-12 w-12 text-red-600 mb-3"/>

                <button @click="idiNaPrehranu"
                class="w-full bg-pink-700 text-white rounded p-2 hover:bg-pink-600">
                    Prehrana
                </button>

                <RouterLink to="/UserHranaMaker" class="w-full text-center bg-pink-700 text-white rounded p-2 hover:bg-pink-600">
                    Hrana maker
                </RouterLink>

                <RouterLink to="/UserObrokMaker" class="w-full text-center bg-pink-700 text-white rounded p-2 hover:bg-pink-600">
                    Obrok maker
                </RouterLink>
            </div>
        </div>

<!-- 
        <div >
            <RouterLink to="/hranaBiranje" class="w-full bg-pink-800 rounded hover:bg-pink-600 p-2 font-semibold"> biranje hrane</RouterLink>
        </div> -->

        
        <div class="text-red-500">{{ poruka }}</div>

    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>