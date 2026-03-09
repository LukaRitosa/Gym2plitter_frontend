<script setup>
    import { RouterLink } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import axios from 'axios'

    const vjezbe=ref([])
    const obroci= ref([])
    const hrana= ref([])
    const splitovi= ref([])

    const loading=ref(false)


    async function dohvatiSve(){
        try {
            loading.value= true

            const vj = await axios.get('http://localhost:3000/vjezbe'); 
            vjezbe.value = vj.data; 

            const sp = await axios.get('http://localhost:3000/split'); 
            splitovi.value = sp.data; 

            const ob = await axios.get('http://localhost:3000/obrok'); 
            obroci.value = ob.data; 

            const hr = await axios.get('http://localhost:3000/hrana'); 
            hrana.value = hr.data; 

        } catch (error) {
            console.error('Greška pri dohvaćanju podataka:', error);
        } finally {
            loading.value = false
        }
    }

    
    onMounted(async () => {
        dohvatiSve()
    })


</script>

<template>

    <div class="m-4">
        <RouterLink to="/" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Nazad</RouterLink>
    </div>

    <div v-if="!loading" class="flex justify-center items-center min-h-screen flex-col">

            <h2 class="text-2xl font-bold mb-4 text-center">
                Vježbe
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />
           
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="vjezba in vjezbe" :key="vjezba._id" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">
                    <img 
                        :src="vjezba.slika" 
                        alt="Slika vježbe"
                        class="w-48 h-48 object-cover rounded mb-3"
                    />

                    <h3 class="text-xl font-semibold">{{ vjezba.naziv }}</h3>
                    <p>Naziv: {{ vjezba.naziv }}</p>
                    <p>Glavni mišić: {{ vjezba.glavni_misic }}</p>
                    
                    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                        <li v-for="misic in vjezba.ostali_misici" :key="misic">
                            Još: {{ misic }}
                        </li>
                    </ul>
                </div>
            </div>

            <h2 class="text-2xl font-bold mb-4 text-center">
                Splitovi
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="split in splitovi" :key="split._id" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">

                    <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                    <p>Opis: {{ split.opis }}</p>
                    <p>Broj dana: {{ split.broj_dana }}</p>

                    <div class="mt-3 w-full">
                        <p class="font-semibold">Dani:</p>

                        <div v-for="dan in split.dani" :key="dan.dan" class="border rounded p-2 mt-2 bg-white">

                            <p class="font-semibold">Dan {{ dan.dan }} - {{ dan.naziv }}</p>

                            <ul v-if="dan.vjezbe.length > 0" class="text-sm mt-1">
                                <li v-for="v in dan.vjezbe" :key="v.id">
                                    Vježba ID: {{ v.id }} ({{ v.broj_setova }} setova)
                                </li>
                            </ul>

                            <p v-else class="text-sm text-gray-500">
                                Nema vježbi
                            </p>

                        </div>
                    </div>

                </div>
            </div>


            <h2 class="text-2xl font-bold mb-4 text-center">
                Hrana
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="h in hrana" :key="h._id" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">

                    <h3 class="text-xl font-semibold">{{ h.naziv }}</h3>

                    <p>Kalorije: {{ h.kalorije }} kcal</p>
                    <p>Proteini: {{ h.proteini }} g</p>

                </div>
            </div>



            <h2 class="text-2xl font-bold mb-4 text-center">
                Obroci
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />


            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="obrok in obroci" :key="obrok._id" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">

                    <h3 class="text-xl font-semibold">{{ obrok.naziv }}</h3>

                    <p>Opis: {{ obrok.opis }}</p>

                    <div class="mt-3 w-full">
                        <p class="font-semibold">Sastojci:</p>

                        <ul class="text-sm mt-2">
                            <li v-for="s in obrok.sastojci" :key="s.id">
                                {{ s.naziv }} — {{ s.grami }}g
                            </li>
                        </ul>
                    </div>

                    <div class="mt-3 border-t pt-2 w-full">
                        <p>Ukupno kalorija: {{ obrok.kalorije }}</p>
                        <p>Proteini: {{ obrok.proteini }} g</p>
                        <p>Grami: {{ obrok.grami }} g</p>
                    </div>

                </div>
            </div>
    </div>
    
    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

</template>