<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted, computed } from 'vue'
    import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore= useUserStore()
    const hrana=ref([])
    const router=useRouter()
    const loading=ref(false)

    const obrok=ref([])

    const hranaUcitana=ref(false)

    const userData=ref(null)


    const dohvatiHranu = async () => {
        loading.value=true

        const snapshot = await getDocs(collection(db, 'hrana'))
        hrana.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        hranaUcitana.value=true

        loading.value=false
    }

    const dohvatiKorisnika= async() => {
        loading.value=true

        const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
            userData.value = userSnap.data()
        }

        loading.value=false
    }

    const dohvatiObroke = async () => {
        loading.value=true

        const snapshot = await getDocs(collection(db, 'obroci'))
        obrok.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        hranaUcitana.value=true

        loading.value=false
    }



    
    onMounted(async () => {
        await dohvatiKorisnika()
        await dohvatiObroke()
        await dohvatiHranu()
    })

</script>

<template>

    <div class="m-4">
        <RouterLink to="/UserSplitovi" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Nazad</RouterLink>
    </div>

    <div v-if="!loading" class="flex justify-center items-center min-h-screen flex-col">

            <h2 class="text-2xl font-bold mb-4 text-center">
                Hrana
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />
           
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="h in hrana" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">
                    <h3 class="text-xl font-semibold">{{ h.naziv }}</h3>
                    <p>Kalorije: {{ h.kalorije }}</p>
                    <p>Proteini: {{ h.proteini }}</p>
                    
                </div>
            </div>

        <div>
            <h2 class="text-2xl font-bold mb-4 text-center">
                Obroci
            </h2>

            <hr class="border-black-600 w-1/2 mx-auto mb-6" />

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                <div v-for="o in obrok" class="border rounded p-4 mb-4 shadow text-center flex flex-col items-center">
                    <h3 class="text-xl font-semibold">{{ o.naziv }}</h3>
                    <p>Kalorije: {{ o.kalorije }}</p>
                    <p>Proteini: {{ o.proteini }}</p>
                    <p>Opis: {{ o.opis }}</p>
                        
                </div>
            </div>
        </div>
    </div>
    
    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

</template>