<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { db } from '@/firebase'
    import { collection, getDocs, addDoc } from 'firebase/firestore';
    import { useUserStore } from '@/stores/userStore'
    import { RouterLink } from 'vue-router'


    const userStore = useUserStore()

    const naziv=ref('')
    const opis=ref('')

    const sviSastojci=ref([])
    const tempSastojci=ref([])

    const sastojci= ref([])



    const poruka = ref('')
    const loading = ref(false)
    const showSastojci = ref(false)

    const dohvatiGlobalnuHranu = async () => {
        const snapshot= await getDocs(collection(db, 'hrana'))
       
        return snapshot.docs.map(doc=> ({ id: doc.id, ...doc.data() }))
    }

    const dohvatiCustomHranu= async ()=>{
        if(!userStore.currentUser) return []
        const snapshot= await getDocs(collection(db, `users/${userStore.currentUser.uid}/customHrana`))
      
        return snapshot.docs.map(doc=> ({ id: doc.id, ...doc.data() }))
    }

    const dohvatiSvuHranu= async()=>{
        loading.value= true
        try{
            const globalnaHrana= await dohvatiGlobalnuHranu()
            const customHrana= await dohvatiCustomHranu()
            sviSastojci.value=[...globalnaHrana, ...customHrana]
        } catch(error){
            console.error('Greška pri dohvaćanju hrane: ', error)
        } finally{
            loading.value= false
        }
    }



    const ukupneKalorije = computed(() => {
        return sastojci.value.reduce((sum, s)=>{
            return sum + (s.kalorije * s.grami) / 100
        }, 0)
    })

    const ukupniProteini = computed(() => {
        return sastojci.value.reduce((sum, s) =>{
            return sum + (s.proteini* s.grami) / 100
        }, 0)
    })

    const ukupniGrami= computed(()=>{
        return sastojci.value.reduce((sum, s)=>sum + s.grami, 0)
    })


    const potvrdiSastojke= () =>{
        sastojci.value=tempSastojci.value.map(id=>{
            const h=sviSastojci.value.find(s=>s.id==id)

            return {
                id: h.id,
                naziv: h.naziv,
                kalorije: h.kalorije,
                proteini: h.proteini,
                grami: 100
            }
        })

        showSastojci.value= false
    }



    const stvoriObrok = async () => {
        loading.value = true
        
        try {

            const noviObrok = {
                naziv: naziv.value,
                opis: opis.value,
                sastojci: sastojci.value,
                kalorije: Number(ukupneKalorije.value),
                proteini: Number(ukupniProteini.value),
                grami: ukupniGrami.value
            } 

            await addDoc(collection(db, `users/${userStore.currentUser.uid}/customObroci`), noviObrok)

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
 
    onMounted(()=>{
        dohvatiSvuHranu()
    })


</script>

<template>
    
    <div class="min-h-screen flex items-center justify-center bg-white text-red-900 px-4">

        <div>
            <RouterLink to="/prehrana" class="w-full bg-red-800 text-white rounded hover:bg-red-400 p-2 font-semibold ">
                Nazad
            </RouterLink>

            <h2 class="text-xl font-bold my-4">Kreiraj novi Obrok</h2>

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
                <p>Grami: {{ ukupniGrami }} g</p>
            </div>
        
            <div>
                <button @click="showSastojci = true" class="bg-red-700 px-3 py-1 rounded mt-3 text-white" >
                    Dodaj / uredi sastojke
                </button>
            </div>
            <div v-if="showSastojci" class="bg-red-800 p-4 rounded mt-3">
                <h3 class="font-bold mb-2">Odaberi sastojke</h3>

                <label v-for="h in sviSastojci" :key="h.id" class="flex gap-2 items-center">
                    <input type="checkbox" :value="h.id" v-model="tempSastojci"/> {{ h.naziv }}
                </label>

                <button @click="potvrdiSastojke" class="bg-green-600 px-3 py-1 rounded mt-2">
                    Potvrdi
                </button>
            </div>

            <div v-if="sastojci.length" class="mt-4">
                <h3 class="font-bold mb-2">Sastojci obroka</h3>

                <div v-for="s in sastojci" :key="s.id" class="flex items-center gap-2 mb-1">
                    <span class="w-24">{{ s.naziv }}</span>

                    <input type="number" v-model.number="s.grami" class="w-20 text-white px-1" /> g
                </div>
            </div>




            <button :disabled="loading" @click="stvoriObrok" class="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded mt-2">
                <span v-if="!loading">Spremi Obrok</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>
            
            <div v-if="poruka" class="mt-2 text-green-700">{{ poruka }}</div>

        </div>
    </div>


</template>