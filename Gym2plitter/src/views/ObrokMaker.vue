<script setup>
    import { ref, watch, computed } from 'vue'
    import { db } from '@/firebase'
    import { collection, getDocs, addDoc } from 'firebase/firestore';

    const naziv=ref('')
    const sastojci=ref([])
    const opis=ref('')

    const hranaLista=ref([])

    const poruka = ref('')
    const loading = ref(false)

    const dohvatiHranu = async () => {
        const querySnapshot= await getDocs(collection(db, 'hrana'))
        hranaLista.value=querySnapshot.docs.map(doc => ({
            id: doc.id,
            ... doc.data()
        }))
    }


    const ukupneKalorije = computed(() => {
        return hranaLista.value
            .filter(h => sastojci.value.includes(h.id))
            .reduce((sum, h) => sum + h.kalorije, 0)
    })

    const ukupniProteini = computed(() => {
        return hranaLista.value
            .filter(h => sastojci.value.includes(h.id))
            .reduce((sum, h) => sum + h.proteini, 0)
    })



    dohvatiHranu()



    const stvoriObrok = async () => {
        loading.value = true
        
        try {
            const odabranaHrana = hranaLista.value.filter(h =>
                sastojci.value.includes(h.id)
            )

            const noviObrok = {
                naziv: naziv.value,
                opis: opis.value,
                odabranaHrana,
                kalorije: ukupneKalorije.value,
                proteini: ukupniProteini.value,
            }

            await addDoc(collection(db, 'obroci'), noviObrok)

            poruka.value = 'obrok uspješno dodan'
            naziv.value = ''
            opis.value=''
            sastojci.value = []
        } catch (error) {
            console.error('Greška:', error)
            poruka.value = 'Greška pri spremanju.'
        }
        finally{
            loading.value = false
        }
    
    }
 


</script>

<template>
    
    <div class="min-h-screen flex items-center justify-center bg-red-900 text-white px-4">

        <div>
            <RouterLink to="/admin" class="w-full bg-red-800 text-white rounded hover:bg-red-400 p-2 font-semibold ">
                Nazad
            </RouterLink>

            <h2 class="text-xl font-bold my-4">Kreiraj novi Split</h2>

            <div class="mb-3">
                <label class="block font-semibold">Naziv obroka:</label>
                <input v-model="naziv" class="border p-1 w-full" type="text" />
            </div>

            <div class="mb-3">
                <label class="block font-semibold">Opis:</label>
                <input v-model="opis" class="border p-1 w-full" type="text" />
            </div>

            <div class="mt-4 font-semibold">
                <p>Kalorije: {{ ukupneKalorije }} kcal</p>
                <p>Proteini: {{ ukupniProteini }} g</p>
            </div>
            
            <label class="block font-semibold mb-1">Odaberi sastojke:</label>

            <div class="space-y-1">
                <label
                    v-for="h in hranaLista"
                    :key="h.id"
                    class="flex items-center gap-2"
                >
                    <input type="checkbox" :value="h.id"  v-model="sastojci"/>
                    {{ h.naziv }}
                    <span class="text-sm text-gray-300">
                        ({{ h.kalorije }} kcal | {{ h.proteini }} g P)
                    </span>
                </label>
            </div>



            <button :disabled="loading" @click="stvoriObrok" class="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded mt-2">
                <span v-if="!loading">Spremi Obrok</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>
            
            <div v-if="poruka" class="mt-2 text-green-700">{{ poruka }}</div>

        </div>
    </div>


</template>