<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'

    const router = useRouter()
    const loading = ref(false)
    const edit=ref(false)

    const dani_u_tjednu=[
        'Nedjelja', 'Ponedjeljak',  'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota',  
    ]

    const tjedni=ref([])

    const kalendar=ref({})


    const ruta = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")

    const generiraj_tjedni= ()=>{
        const datumi= Object.keys(kalendar.value).sort()
        const tjedniTemp= datumi.map(datum=> {
            const datumObj= new Date(datum)
            return {
                id: datum,
                dan_u_tjednu: dani_u_tjednu[datumObj.getDay()],
                dan_u_mjesecu: datumObj.getDate(),
                mjesec: datumObj.getMonth() + 1,
                godina: datumObj.getFullYear()
            }
        })
        tjedni.value= tjedniTemp
    }


    const dohvatiKalendar = async () => {
        loading.value=true
        try{
            const rez=await axios.get(
                `${ruta}/kalendar`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            kalendar.value= rez.data
            generiraj_tjedni()
        }catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const updateKalendar= async () => {
        loading.value= true
        try{
            await axios.put(
                `${ruta}/kalendar/update`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
        }catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const getTreningZaDatum = (datum) => {
        return kalendar.value[datum] || { naziv: 'Odmor', split_dan_id: null }
    }


    const postaviOdmor = async (datum) => {
        loading.value = true
        try {

            await axios.put(
                `${ruta}/kalendar/postavi_odmor/${datum}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiKalendar()

        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }


    const preskoci= async (datum) =>{
        loading.value=true
        try {

            await axios.put(
                `${ruta}/kalendar/preskoci/${datum}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiKalendar()

        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }


    const otkaziOdmor= async (datum) =>{
        loading.value=true
        try {

            await axios.put(
                `${ruta}/kalendar/otkazi_odmor/${datum}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiKalendar()

        } catch (error) {
            console.error(error)
            alert(error.response.data.greska)
        } finally {
            loading.value = false
        }
    }

    const idiNaDan=(id)=>{
        if (id !== null) {
            router.push(`/UrediDan/${id}`)
        }
    }


    onMounted(async () => {
        await updateKalendar()
        await dohvatiKalendar()
    })


</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">
        
        <div v-if="loading">
            <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
        </div>



        <div v-else class="overflow-x-auto">

            <div class=" my-4">
                <RouterLink to="/pocetna" class="w-full bg-red-400 text-white hover:bg-red-300 p-2 font-semibold rounded"> Početna</RouterLink>
            </div>

            <h3 class="text-3xl font-bold my-4">Kalendar</h3>

            <div class="grid grid-cols-7 gap-2 min-w-max grid-red-7 my-4">
                <div v-for="datum in tjedni" class="text-center border border-red-700">           
                    <div class="font-bold py-2 border-b sticky top-0 bg-red-800 text-gray-100">
                        {{ datum.dan_u_tjednu }}
                    </div>
                    <div class="text-sm font-medium bg-white">
                        {{ datum.dan_u_mjesecu }}.{{ datum.mjesec }}.
                    </div>
                    <div v-if="getTreningZaDatum(datum.id).split_dan_id !== null" 
                            class="mt-1 text-xs font-semibold p-1 rounded bg-white bg-opacity-70">
                        {{ getTreningZaDatum(datum.id).naziv }}

                        <div v-if="edit">
                            <button class="border bg-gray-500 text-white hover:bg-gray-300 p-2 rounded" @click="postaviOdmor(datum.id)">
                                Odmor
                            </button>
                        </div>

                        <div v-if="edit">
                            <button class="border bg-red-600 text-white hover:bg-red-300 p-2 rounded" @click="preskoci(datum.id)">
                                Preskoči
                            </button>
                        </div>

                        <div v-else @click="idiNaDan(getTreningZaDatum(datum.id).split_dan_id)">
                            <button class="border bg-red-800 text-white hover:bg-red-500 p-2 rounded">
                                Idi na dan
                            </button>    
                        </div>
                        
                        
                        
                    </div>

                    <div v-else class="mt-1 text-xs text-gray-500">
                        Odmor
                        <div>
                            <button class="border bg-blue-500 text-white hover:bg-blue-300 p-2 rounded" @click="otkaziOdmor(datum.id)" v-if="edit">
                                Otkaži odmor
                            </button> 
                        </div>
                        
                    </div>
                </div>
            </div>

            <button @click="edit=true" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded" v-if="!edit">
                Edit mode
            </button>

            <button @click="edit=false" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded" v-else>
                Izađi iz edit mode
            </button>


        </div> 
    </div>

</template>