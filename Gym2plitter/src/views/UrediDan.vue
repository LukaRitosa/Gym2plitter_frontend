<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, RouterLink } from 'vue-router'
    import axios from 'axios'

    

    const route = useRoute()

    const props = defineProps({
        danId: {
            type: [Number, String],
            required: false
        }
    })

    const danId = Number(props.danId ?? route.params.danId)


    const danPodaci = ref({})
    const vjezbe = ref([])
    const sveVjezbe=ref([])

    const loading = ref(false)
    const detalji=ref(false)
    const promjena=ref(false)
    const izbornik=ref(false)

    
    const ruta = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")

    const dohvatiDan = async () => {
        loading.value=true
        try {

            const rez= await axios.get(
                `${ruta}/split_dan/${danId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            danPodaci.value= rez.data
            vjezbe.value= rez.data.vjezbe
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    
    const dohvatiSveVjezbe= async () => {
        loading.value=true
        try {
            const rez= await axios.get(
                `${ruta}/vjezbe/biranje`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            sveVjezbe.value= rez.data
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const grupiraneVjezbe= computed (() =>{
        const grupe={}
        sveVjezbe.value.forEach(vjezba=>{
            if(!vjezbe.value.some(v => v.id===vjezba._id)) {
                if(!grupe[vjezba.glavni_misic]){
                    grupe[vjezba.glavni_misic]=[]
                }
                grupe[vjezba.glavni_misic].push({...vjezba, id: vjezba._id})
            }
        })
        return grupe
    })

    const grupiraneVjezbeUDanu = computed(() => {
        const grupe = {}
        vjezbe.value.forEach(v => {
            if (!grupe[v.glavni_misic]) {
                grupe[v.glavni_misic] = []
            }
            grupe[v.glavni_misic].push(v)
        })
        return grupe
    })

    const smanjiSetove = (vjezba) => {
        if (vjezba.brojSetova > 1) {
            vjezba.brojSetova--
            promjena.value = true
        }
    }

    const povecajSetove = (vjezba) => {
        vjezba.brojSetova++
        promjena.value = true
    }

    const spremiPromjene= async () =>{
        loading.value=true
        try{
            await axios.put(
                `${ruta}/split_dan/${danId}/novi_setovi`,
                { 
                    vjezbe: vjezbe.value.map(v=>
                        ({ id: v.id, broj_setova: v.brojSetova })
                    ) 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            promjena.value=false
        }catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const dodajVjezbu= async (id_vjeza) =>{
        loading.value=true
        try{
            await axios.patch(
                `${ruta}/split_dan/${danId}/vjezba/${id_vjeza}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiDan()
            izbornik.value=false
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const ukloniVjezbu= async (vjezba_id) =>{
        loading.value= true
        try{
            await axios.patch(
                `${ruta}/split_dan/${danId}/ukloni_vjezbu/${vjezba_id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiDan()
        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        await dohvatiDan()
        await dohvatiSveVjezbe()
    })
</script>

<template>
    
    <div v-if="loading" class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

    <div v-if="!loading && !izbornik" class="flex justify-center items-center min-h-screen flex-col font-semibold">
        
        <div class="m-4">
            <RouterLink to="/pocetna" class="w-full bg-black text-white rounded hover:bg-red-300 p-2"> Početna</RouterLink>
        </div>

        <h2 class="text-2xl font-bold mb-4">
            {{ danPodaci.naziv || 'Nepoznat dan' }}
        </h2>

        <button class="border bg-red-600 text-white hover:bg-red-300 p-2 rounded" @click="izbornik=true">
            Dodaj vježbu
        </button>
        
        <div v-for="(grupa, misic) in grupiraneVjezbeUDanu" :key="misic" class="mb-6">
            <h3 class="text-xl font-bold mb-2">{{ misic }}</h3>

            <div class="flex gap-4">
                <div v-for="v in grupa" :key="v.id"
                 class="w-60 text-center flex flex-col items-center border border-red-700 rounded p-4">

                    <h4 class="font-semibold">{{ v.naziv }}</h4>

                    <img :src="v.slika" :alt="v.naziv" class="my-2 w-max-50 h-auto rounded">

                    <div class="mt-2 w-full">
                        <div v-if="detalji" @click="detalji=false">
                            <p class="text-gray-700">
                                {{ v.opis }}
                            </p>    
                            <p>
                                <b> Glavni mišić: </b> {{ v.glavni_misic }}
                            </p>
                            <p v-if="v.ostali_misici.length">
                                <b>Ostali mišići: </b> {{ v.ostali_misici.join(', ') }}
                            </p>
                        </div>

                        <p class="mt-2 flex items-center justify-center gap-2">
                            <button class="border bg-red-500 text-white hover:bg-red-300 px-2 rounded" @click="smanjiSetove(v)">
                                -
                            </button>

                            {{ v.brojSetova }}

                            <button class="border bg-red-500 text-white hover:bg-red-300 px-2 rounded" @click="povecajSetove(v)">
                                +
                            </button>
                            
                        </p>

                        <button class="mt-2 border bg-black text-white hover:bg-red-800 p-3 rounded" @click="ukloniVjezbu(v.id)">
                            Ukloni vježbu
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <button v-if="promjena" class="border bg-black text-white hover:bg-red-500 p-2 rounded" @click="spremiPromjene">
            Spremi promjene
        </button>

        <button class="border bg-red-700 text-white hover:bg-red-300 p-2 rounded" @click="detalji=true" v-if="!detalji">
            Prikaži detalje
        </button>

        <button class="border bg-red-700 text-white hover:bg-red-300 p-2 rounded" @click="detalji=false" v-else>
            Sakrij detalje
        </button>


    </div>

    <div v-if="izbornik && !loading" class="flex justify-center items-center min-h-screen flex-col font-semibold">
        <h3 class="text-2xl font-bold mb-4">
            Odaberi vježbe
        </h3>

        <div class="flex gap-3 mb-6">
            <button class="border bg-gray-500 text-white hover:bg-red-300 p-2 rounded" @click="izbornik=false">
                Nazad
            </button>

            <RouterLink to="/UserVjezbaMaker" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded">
                Dodaj vlastitu
            </RouterLink>
        </div>

        <div v-for="(grupa, misic) in grupiraneVjezbe" :key="misic" class="mb-8 w-full text-center">
            <h4 class="text-xl font-bold mb-2">{{ misic }}</h4>

            <div class="flex gap-4 justify-center p-2">
                <div v-for="v in grupa" :key="v._id" @click="dodajVjezbu(v._id)"
                    class="w-60 text-center flex flex-col items-center border rounded p-4 hover:bg-red-200">
                    
                    <h5 class="font-semibold">
                        {{ v.naziv }}
                    </h5>
                    <img :src="v.slika" class="my-2 w-50 h-auto rounded">
                </div>
            </div>
        </div>

    </div>



  

</template>