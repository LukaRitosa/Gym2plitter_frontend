<script setup>
    import { ref } from 'vue'
    import axios from 'axios'
    import { RouterLink } from 'vue-router'


    const naziv=ref('')
    const kalorije=ref('')
    const proteini=ref([])

    const poruka=ref('')

    const loading = ref(false)

    const dodajHranu=async ()=>{
        loading.value=true
        try{
            
            const novaHrana={
                naziv: naziv.value,
                kalorije: kalorije.value,
                proteini: proteini.value
            }
        
            await axios.post('http://localhost:3000/hrana', novaHrana)

            poruka.value = 'Hrana uspješno dodana'

            naziv.value = ''
            kalorije.value = ''
            proteini.value=''
        }catch (error) {
            if (error.response) {
                console.error('Backend greška:', error.response.data)
                poruka.value = error.response.data.greska || error.response.data.error || 'Greška pri spremanju.'
            } else if (error.request) {
                console.error('Nema odgovora od servera:', error.request)
                poruka.value = 'Nema odgovora od servera'
            } else {
                console.error('Greška:', error.message)
                poruka.value = 'Greška pri spremanju.'
            }
        }
        finally{
            loading.value=false
        }
    }
</script>

<template>

    <div class="min-h-screen flex items-center justify-center bg-red-900 text-white px-4 font-semibold">

        <div>
                
            <div >
                <RouterLink to="/admin" class="w-full bg-red-600 text-white rounded hover:bg-red-400 p-2 font-semibold">Nazad</RouterLink>
            </div>
            <h2 class="text-xl font-bold my-4">Dodaj novu hranu</h2>

            <form @submit.prevent="dodajHranu" class="space-y-4">

                <div>
                    <label class="block">Naziv:</label>
                    <input type="text" v-model="naziv" class="border p-1 w-full" />
                </div>
                <div>
                    <label class="block">Kalorije (na 100g):</label>
                    <input type="number" step="0.01" min="0" v-model="kalorije" class="border p-1 w-full" />
                </div>
                <div>
                    <label class="block">Proteini:</label>
                    <input type="number" step="0.01" min="0" v-model="proteini" class="border p-1 w-full" />
                </div>

                <button :disabled="loading" type="submit" class="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded">
                    <span v-if="!loading">Spremi hranu</span>
                    <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
                </button>

                <div v-if="poruka" class="mt-2 text-green-600">{{ poruka }}</div>

            </form>
        </div>
    </div>

</template>