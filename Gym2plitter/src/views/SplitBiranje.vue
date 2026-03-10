<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted, computed } from 'vue'
    import axios from 'axios'

    const splits=ref([])
    const router=useRouter()
    const loading=ref(false)

    const splitovi_ucitani=ref(false)

    const userData=ref(null)

    const ruta= import.meta.env.VITE_BASE_URL



    const dohvatiSplitove = async () => {
        loading.value=true

        try {
            const token = localStorage.getItem("token")
            const rez = await axios.get(
                `${ruta}/split/biranje`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            ) 
            splits.value = rez.data
            splitovi_ucitani.value = true
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const sviSplitovi= computed(() => splits.value)

    const dohvatiKorisnika= async() => {
        loading.value=true

        try{
            const token = localStorage.getItem("token")
            
            const rez= await axios.get(
                `${ruta}/user/profil`, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            userData.value= rez.data
        }catch (error){
            console.log(error)
            alert(error.response.data.greska)
        } finally{
            loading.value= false
        }
    }

    const preporuceniSplitovi= computed (() => {        
        if (!userData.value?.slobodni_dani || !splitovi_ucitani.value) return []

        const brojSlobodnihDana = userData.value.slobodni_dani.length

        return sviSplitovi.value.filter(split => split.broj_dana=== brojSlobodnihDana)
    })

    

    const ostaliSplitovi = computed(() => sviSplitovi.value.filter(split => !preporuceniSplitovi.value.includes(split)))

    const odaberiSplit = async (split) => {
        loading.value = true

        try {
            const token= localStorage.getItem("token")

            await axios.post(
                `${ruta}/split/user_split/${split._id.toString()}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            router.push("/Split")
        } catch (error) {
            console.error("Greška pri spremanju splita:", error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    
    onMounted(async () => {
        await dohvatiKorisnika()
        await dohvatiSplitove()
    })

</script>

<template>

    <div class="m-4">
        <RouterLink to="/UserSplitovi" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Nazad</RouterLink>
    </div>

    <div v-if="!loading" class="flex justify-center items-center min-h-screen flex-col">

        <div v-if="preporuceniSplitovi.length > 0">
            <h2 class="text-2xl font-bold mb-4 text-center">
                Preporučeni splitovi
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />
           
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="split in preporuceniSplitovi" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">
                    <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                    <p>Broj dana: {{ split.broj_dana }}</p>
                    <p>Opis: {{ split.opis }}</p>
                    
                    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                        <li v-for="dan in split.dani" :key="dan.dan">
                            Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                        </li>
                    </ul>

                    <button @click="odaberiSplit(split)" class="mt-3 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                        Odaberi ovaj Split
                    </button>
                </div>
            </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold mb-4 text-center">
                Splitovi
            </h2>

            <hr class="border-black-600 w-1/2 mx-auto mb-6" />

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                <div v-for="split in ostaliSplitovi" class="border rounded p-4 mb-4 shadow text-center flex flex-col items-center">
                    <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                    <p>Broj dana: {{ split.broj_dana }}</p>
                    <p>Opis: {{ split.opis }}</p>

                    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                        <li v-for="dan in split.dani" :key="dan.dan">
                        Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                        </li>
                    </ul>

                    <button @click="odaberiSplit(split)" class="mt-3 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                        <span>
                            Odaberi ovaj Split
                        </span>
                        
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

</template>