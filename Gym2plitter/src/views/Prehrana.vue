<script setup>
    import { ref, onMounted, watch, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const router = useRouter()
    const userStore = useUserStore()

    const userPodaci = ref(null)
    const danasnjaPrehrana = ref(null)
    const loading = ref(true)

    const odabraniDatum = ref(new Date())

    const izbornikHrane = ref(false)
    const aktivniObrok = ref(null) 


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
                const danasISO = formatirajDatumISO(odabraniDatum.value)

                danasnjaPrehrana.value = prehranaArray.find(d => d.datum === danasISO) || null
            }
        } catch(error) {
            console.error('Greška', error)
        } finally {
            loading.value = false
        }
    }

    function nazad() {
        const d = new Date(odabraniDatum.value)
        d.setDate(d.getDate() - 1)
        odabraniDatum.value = d
    }

        function naprijed() {
        const d = new Date(odabraniDatum.value)
        d.setDate(d.getDate() + 1)
        odabraniDatum.value = d
    }

    function postaviPrehranuZaDatum(datum){
        if(!userPodaci.value) return

        const iso= formatirajDatumISO(datum)

        danasnjaPrehrana.value=userPodaci.value.prehrana.find(p=> p.datum===iso)|| null
    }

    function otvoriIzbornik(obrok) {
        aktivniObrok.value = obrok
        izbornikHrane.value = true
    }

    function zatvoriIzbornik() {
        aktivniObrok.value = null
        izbornikHrane.value = false
    }

    async function dohvatiCustomHranu(){
        try{
            const user= userStore.currentUser
            if(!user) return 

            const snap= await getDocs(collection(db, `users/${user.uid}/customHrana`))

            return snap.docs.map(doc=>({
                id: doc.id,
                grami: 100,
                ...doc.data()
            }))
        } catch(error){
            console.error('Greška dohvaćanju custom hrane', e)
            return []
        }
    }

    const svaHrana=ref([])

    async function dohvatiHranu(){
        loading.value=true
        try{
            const globalSnap= await getDocs(collection(db, 'hrana'))

            const globalna= globalSnap.docs.map(doc=>({
                id: doc.id,
                grami: 100,
                ...doc.data()
            }))

            const custom= await dohvatiCustomHranu()

            svaHrana.value= [...globalna, ...custom]
        } catch(error){
            console.error('Greška kod hrane', error)
        } finally{
            loading.value=false
        }
    }

    async function dohvatiCustomObroke(){
        try{
            const user= userStore.currentUser
            if(!user) return 

            const snap= await getDocs(collection(db, `users/${user.uid}/customObroci`))

            return snap.docs.map(doc=>({
                id: doc.id,
                ...doc.data()
            }))
        } catch(error){
            console.error('Greška dohvaćanju custom hrane', e)
            return []
        }
    }

    const sviObroci=ref([])

    async function dohvatiObroke(){
        loading.value=true
        try{
            const globalSnap= await getDocs(collection(db, 'obroci'))

            const globalni= globalSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const custom= await dohvatiCustomObroke()

            sviObroci.value= [...globalni, ...custom]
        } catch(error){
            console.error('Greška kod obroka', error)
        } finally{
            loading.value=false
        }
    }

    const detaljiStavke=ref(null)

    function detaljiHrane(hrana){
        detaljiStavke.value={
            tip: 'hrana',
            podatak: hrana,
            novi_grami: 100
        }
        detalji.value=true
    }

    function detaljiObroka(obrok){
        detaljiStavke.value={
            tip: 'obrok',
            podatak: obrok,
            novi_grami: obrok.grami
        }
        detalji.value=true
    }

    const detalji=ref(false)

    function zatvoriDetalji(){
        detalji.value=false
        detaljiStavke.value=null
    }

    const izracunateKalorije=computed(()=>{
        if(!detaljiStavke.value) return 0

        const g= detaljiStavke.value.novi_grami
        const p= detaljiStavke.value.podatak

        return Number(((g/100) * p.kalorije).toFixed(2))
    })

    const izracunatiProteini=computed(()=>{
        if(!detaljiStavke.value) return 0

        const g= detaljiStavke.value.novi_grami
        const p= detaljiStavke.value.podatak

        return Number(((g/100) * p.proteini).toFixed(2))
    })

    async function spremiPrehranu() {
        try {
            const user = userStore.currentUser
            if (!user) return

            const docRef = doc(db, 'users', user.uid)

            await updateDoc(docRef, {
                prehrana: userPodaci.value.prehrana
            })

        } catch (err) {
            console.error('Greška pri spremanju prehrane:', err)
        }
    }

    async function dodajStavku() {
        if (!danasnjaPrehrana.value || !aktivniObrok.value) return

        const g = detaljiStavke.value.novi_grami
        const p = detaljiStavke.value.podatak

        const stavka = {
            naziv: p.naziv,
            grami: g,
            kalorije: izracunateKalorije.value,
            proteini: izracunatiProteini.value
        }

        danasnjaPrehrana.value.pojedeno[aktivniObrok.value].push(stavka)

        danasnjaPrehrana.value.ostvareneKalorije += stavka.kalorije
        danasnjaPrehrana.value.ostvareniProteini += stavka.proteini

        await spremiPrehranu()

        detalji.value = false
        izbornikHrane.value = false
        detaljiStavke.value = null
    }

    async function obrisiStavku(ime_obroka, index){
        if(!danasnjaPrehrana.value) return 

        const stavka= danasnjaPrehrana.value.pojedeno[ime_obroka][index]

        danasnjaPrehrana.value.ostvareneKalorije-=stavka.kalorije
        danasnjaPrehrana.value.ostvareniProteini-=stavka.proteini

        danasnjaPrehrana.value.pojedeno[ime_obroka].splice(index, 1) 

        await spremiPrehranu()
    }

    const editMode=ref(false)
    const editObrok=ref(null)
    const editIndex=ref(null)

    function urediStavku(imeObroka, index) {
        const stavka = danasnjaPrehrana.value.pojedeno[imeObroka][index]

        editObrok.value = imeObroka
        editIndex.value = index

        detaljiStavke.value = {
            podatak: {
                naziv: stavka.naziv,
                kalorije: (stavka.kalorije / stavka.grami) * 100,
                proteini: (stavka.proteini / stavka.grami) * 100
            },
            novi_grami: stavka.grami
        }

        editMode.value= true
        detalji.value = true
    }

    async function urediUredenuStavku(){
        const obrok= editObrok.value
        const index= editIndex.value

        const stara=danasnjaPrehrana.value.pojedeno[obrok][index]

        danasnjaPrehrana.value.ostvareneKalorije-= stara.kalorije
        danasnjaPrehrana.value.ostvareniProteini-= stara.proteini

        const nova={
            naziv: stara.naziv,
            grami: detaljiStavke.value.novi_grami,
            kalorije: izracunateKalorije.value,
            proteini: izracunatiProteini.value
        }

        danasnjaPrehrana.value.pojedeno[obrok][index]= nova

        danasnjaPrehrana.value.ostvareneKalorije+= nova.kalorije
        danasnjaPrehrana.value.ostvareniProteini+= nova.proteini

        await spremiPrehranu()

        editMode.value=false
        detalji.value = false
        detaljiStavke.value = null
        editIndex.value = null
        editObrok.value = null
    }

    async function preracunajan(){
        loading.value=true

        try{
            const user = userStore.currentUser
            if (!user) return

            const userRef = doc(db, 'users', user.uid)

            const snap= await getDoc(userRef)
            if(!snap.exists()) return

            let prehrana= [...(snap.data().prehrana || [])]

            if (prehrana.length===0) return

            const zadnji_datum= prehrana[prehrana.length - 1].datum

            const danas= new Date().toLocaleDateString("sv-SE")

            const danasDate = new Date(danas)
            const zadnjiDate = new Date(zadnji_datum)

            let razlika= Math.floor((danasDate - zadnjiDate) / (1000 * 60 * 60 * 24))

            if (razlika<= 0) return

            else if(razlika>7){
                razlika=7
            }

            if(prehrana.length===7){
                prehrana.splice(0, razlika)
            }

            let datum= new Date(zadnji_datum)

            for(let i=0; i<razlika; i++){
                datum.setDate(datum.getDate() + 1)
                const iso= datum.toLocaleDateString("sv-SE")
                let dan={
                    datum: iso,
                    ostvareneKalorije: 0,
                    ostvareniProteini: 0,
                    pojedeno: {
                        dorucak: [],
                        rucak: [],
                        vecera: [],
                        snack: [],
                        marenda: [],
                        nekarakterizirano: []
                    }
                }
                prehrana.push(dan)
            }

            await updateDoc(userRef, { prehrana })

            userPodaci.value.prehrana = prehrana
            postaviPrehranuZaDatum(odabraniDatum.value)
        } catch(error){
            console.error("Greška pri održavanju prehrane", error)
        } finally{
            loading.value= false
        }
    }



    watch(odabraniDatum, (novi)=>{
        postaviPrehranuZaDatum(novi)
    })

    onMounted(async() => {
        await dohvatiUserPodatke(),
        await preracunajan(),
        await dohvatiHranu(),
        await dohvatiObroke()
    })
</script>

<template>
    <div v-if="!loading && !izbornikHrane && !detalji" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">

        <div class="flex items-center justify-between bg-white rounded-xl shadow p-4">
            <button @click="nazad" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                ◀
            </button>

            <div class="font-semibold">
                {{ formatirajDatumISO(odabraniDatum) }}
            </div>

            <button @click="naprijed" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                ▶
            </button>
        </div>

        <div v-if="userPodaci">
            <p>Kalorije: {{ userPodaci.cilj_kalorije ?? 'Nije definirano' }} kcal</p>
            <p>Proteini: {{ userPodaci.cilj_proteini ?? 'Nije definirano' }}</p>
        </div>

        <div v-if="danasnjaPrehrana">
            <p>Ostvarene kalorije: {{ danasnjaPrehrana.ostvareneKalorije }}</p>
            <p>Ostvareni proteini: {{ danasnjaPrehrana.ostvareniProteini }}</p>

            <div v-for="(obrok, ime_obroka) in danasnjaPrehrana.pojedeno" :key="ime_obroka" class="mb-2">
                <b>{{ ime_obroka }}:</b> <button @click="otvoriIzbornik(ime_obroka)">+</button>
                <ul>
                    <li v-if="obrok.length === 0" class="text-gray-500 italic">
                        Nema unosa
                    </li>
                    <li v-for="(stavka, i) in obrok" :key="i">
                        <span class="cursor-pointer underline" @click="urediStavku(ime_obroka, i)">
                            {{ stavka.naziv }} - {{ stavka.grami }} g 
                            {{ stavka.proteini }} g proteina - {{ stavka.kalorije }} kalorija
                        </span>

                        <button class="text-red-600 font-bold" @click="obrisiStavku(ime_obroka, i)">
                            ✕
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div v-else>
            <p>Nema unosa prehrane za danas.</p>
        </div>
    </div>

    <div v-else-if="izbornikHrane && !detalji" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">
        <button @click="zatvoriIzbornik()">
            zatvori
        </button>
        <h3>
            <b>
                Hrana
            </b>
        </h3>
        <div v-for="h in svaHrana" :key="h.id" @click="detaljiHrane(h)">
            {{ h.naziv }} – {{ h.kalorije }} kcal / {{ h.proteini }} g
            <b>{{ h.grami }} grama</b>
        </div>

        <h3>
            <b>
                Obroci
            </b>
        </h3>
        <div v-for="o in sviObroci" :key="o.id" @click="detaljiObroka(o)">
            {{ o.naziv }} – {{ o.kalorije }} kcal / {{ o.proteini }} g 
            <b>{{ o.grami }} grama</b>
        </div>

    </div>

    <div v-else-if="detalji" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">
        <button @click="zatvoriDetalji()">
            nazad
        </button>

        <div>
            {{ detaljiStavke.podatak.naziv }}
        </div>
        <div>
            {{ izracunateKalorije }} kcal
        </div>
        <div>
            {{ izracunatiProteini }} g
        </div>
        <div>
            {{ detaljiStavke.podatak.grami }} grama
        </div>
        
        <label>
            Grami:
            <input type="number" min="1" v-model.number="detaljiStavke.novi_grami" class="border px-2 py-1 w-24"/>
        </label>

        <button v-if="editMode" class="bg-blue-600 text-white px-4 py-2 rounded" @click="urediUredenuStavku">
            Spremi promjene
        </button>

        <button v-else class="bg-red-600 text-white px-4 py-2 rounded" @click="dodajStavku">
            Dodaj u {{ aktivniObrok }}
        </button>
    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
</template>
