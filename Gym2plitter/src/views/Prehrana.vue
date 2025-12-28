<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { doc, getDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const router = useRouter()
    const userStore = useUserStore()

    const userPodaci = ref(null)
    const danasnjaPrehrana = ref(null)
    const loading = ref(true)

    function formatirajDatumISO(datum) {
        const y = datum.getFullYear()
        const m = String(datum.getMonth() + 1).padStart(2, '0')
        const d = String(datum.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    async function dohvatiUserPodatke(){
        loading.value = true
        try {
            const user = userStore.currentUser
            if (!user) return

            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                userPodaci.value = docSnap.data()

                const prehranaArray = userPodaci.value.prehrana || []
                const danasISO = formatirajDatumISO(new Date())

                danasnjaPrehrana.value = prehranaArray.find(d => d.datum === danasISO) || null
            }
        } catch(error) {
            console.error('Greška', error)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        dohvatiUserPodatke()
    })
</script>

<template>
    <div v-if="!loading" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">

        <div v-if="userPodaci">
            <p>Kalorije: {{ userPodaci.cilj_kalorije ?? 'Nije definirano' }} kcal</p>
            <p>Proteini: {{ userPodaci.cilj_proteini ?? 'Nije definirano' }}</p>
        </div>

        <div v-if="danasnjaPrehrana">
            <p>Ostvarene kalorije: {{ danasnjaPrehrana.ostvareneKalorije }}</p>
            <p>Ostvareni proteini: {{ danasnjaPrehrana.ostvareniProteini }}</p>

            <div v-for="(obrok, ime_obroka) in danasnjaPrehrana.pojedeno" :key="ime_obroka" class="mb-2">
                <b>{{ ime_obroka.charAt(0).toUpperCase() + ime_obroka.slice(1) }}:</b>
                <ul>
                    <li v-if="obrok.length === 0" class="text-gray-500 italic">
                        Nema unosa
                    </li>
                    <li v-for="(stavka, i) in obrok" :key="i">
                        {{ stavka }}
                    </li>
                </ul>
            </div>
        </div>

        <div v-else>
            <p>Nema unosa prehrane za danas.</p>
        </div>
    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
</template>
