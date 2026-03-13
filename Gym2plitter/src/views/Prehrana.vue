<script setup>
    import { ref, onMounted, watch, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'

    const router = useRouter()

    const userPodaci = ref(null)
    const danasnjaPrehrana = ref(null)

    const sviObroci=ref([])
    const svaHrana=ref([])
    
    const loading = ref(true)

    const izbornikHrane = ref(false)
    const aktivniObrok = ref(null) 

    const detaljiStavke=ref(null)
    const detalji=ref(false)
    
    const editMode=ref(false)
    const editObrok=ref(null)
    const editIndex=ref(null)
    
    const ruta = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")

    const props= defineProps({
        datum: String
    })

    const odabraniDatum = ref(
        props.datum ? new Date(props.datum) : new Date()
    )


    function formatirajDatumISO(datum) {
        const y = datum.getFullYear()
        const m = String(datum.getMonth() + 1).padStart(2, '0')
        const d = String(datum.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    async function dohvatiUserPodatke(){
        loading.value = true
        try{
            
            const rez= await axios.get(
                `${ruta}/user/profil`, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            userPodaci.value= rez.data
        }catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }



    function nazad() {
        const d = new Date(odabraniDatum.value)
        d.setDate(d.getDate() - 1)

        const iso= formatirajDatumISO(d)
        if(userPodaci.value.prehrana.some(d => d.datum=== iso)){
            router.push(`/prehrana/${iso}`)
        }
    }

    function naprijed() {
        const d = new Date(odabraniDatum.value)
        d.setDate(d.getDate() + 1)

        const iso= formatirajDatumISO(d)
        if(userPodaci.value.prehrana.some(d => d.datum=== iso)){
            router.push(`/prehrana/${iso}`)
        }
    }



    async function postaviPrehranuZaDatum(datum){ 
        loading.value= true
        try{
            
            const rez= await axios.get(
                `${ruta}/prehrana/${formatirajDatumISO(datum)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            danasnjaPrehrana.value= rez.data
        }catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }




    function otvoriIzbornik(obrok) {
        aktivniObrok.value = obrok
        izbornikHrane.value = true
    }

    function zatvoriIzbornik() {
        aktivniObrok.value = null
        izbornikHrane.value = false
    }




    async function dohvatiHranu(){
        loading.value=true
        try{
            const rez= await axios.get(
                `${ruta}/hrana/biranje`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            svaHrana.value= rez.data
        } catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }

    async function dohvatiObroke(){
        loading.value=true
        try{
            const rez= await axios.get(
                `${ruta}/obrok/biranje`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            sviObroci.value= rez.data
        } catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }




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

    function zatvoriDetalji(){
        detalji.value=false
        detaljiStavke.value=null
    }




    const izracunateKalorije=computed(()=>{ 
        if(!detaljiStavke.value) return 0

        const g= detaljiStavke.value.novi_grami
        const p= detaljiStavke.value.podatak

        return p.grami ? Number(((g/p.grami) * p.kalorije).toFixed(2)) : 0
    })

    const izracunatiProteini=computed(()=>{ 
        if(!detaljiStavke.value) return 0

        const g= detaljiStavke.value.novi_grami
        const p= detaljiStavke.value.podatak

        return p.grami ? Number(((g/p.grami) * p.proteini).toFixed(2)) : 0
    })




    async function dodajStavku() {
        if (!danasnjaPrehrana.value || !aktivniObrok.value) return
        loading.value= true

        const g= detaljiStavke.value.novi_grami
        const p= detaljiStavke.value.podatak

        try{
            await axios.patch(
                `${ruta}/prehrana/${formatirajDatumISO(odabraniDatum.value)}/${aktivniObrok.value}/dodaj`,
                { id: p._id, grami: g },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiUserPodatke()
            await postaviPrehranuZaDatum(odabraniDatum.value)
        }catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false

            detalji.value = false
            izbornikHrane.value = false
            detaljiStavke.value = null
        }
    }

    async function obrisiStavku(ime_obroka, index){
        if(!danasnjaPrehrana.value) return 
        loading.value=true

        const stavka= danasnjaPrehrana.value.pojedeno[ime_obroka][index]

        try{
            await axios.patch(
                `${ruta}/prehrana/${formatirajDatumISO(odabraniDatum.value)}/${ime_obroka}/ukloni/${stavka._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiUserPodatke()
            await postaviPrehranuZaDatum(odabraniDatum.value)
        }catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }


    function urediStavku(imeObroka, index) {
        const stavka = danasnjaPrehrana.value.pojedeno[imeObroka][index]

        editObrok.value = imeObroka
        editIndex.value = index

        detaljiStavke.value = {
            podatak: {
                naziv: stavka.naziv,
                kalorije: stavka.kalorije,
                proteini: stavka.proteini,
                grami: stavka.grami
            },
            novi_grami: stavka.grami
        }

        editMode.value= true
        detalji.value = true
    }

    async function urediUredenuStavku(){
        if(!editObrok.value || editIndex.value === null || !detaljiStavke.value) return
        loading.value = true
        
        const obrok= editObrok.value
        const index= editIndex.value

        const stavka= danasnjaPrehrana.value.pojedeno[obrok][index]
        const noviGrami= detaljiStavke.value.novi_grami

        try{
            await axios.patch(
                `${ruta}/prehrana/${formatirajDatumISO(odabraniDatum.value)}/${obrok}/uredi/${stavka._id}`,
                { grami: noviGrami },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            await dohvatiUserPodatke()
            await postaviPrehranuZaDatum(odabraniDatum.value)
        }catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false

            editMode.value=false
            detalji.value = false
            detaljiStavke.value = null
            editIndex.value = null
            editObrok.value = null
        }
    }

    async function preracunaj(){
        loading.value=true

        try{
            await axios.put(
                `${ruta}/prehrana/update`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch(error){
            console.error(error)
            alert(error.response.data.greska)
        }finally{
            loading.value= false
        }
    }

    const postotakKalorije= computed(()=>{
        if(!userPodaci.value || !danasnjaPrehrana.value) return 0
        return Math.min(
            (danasnjaPrehrana.value.ostvareneKalorije / userPodaci.value.cilj_kalorije) * 100,
            100
        )
    })

    const postotakProteini = computed(() => {
        if (!userPodaci.value || !danasnjaPrehrana.value) return 0
        return Math.min(
            (danasnjaPrehrana.value.ostvareniProteini / userPodaci.value.cilj_proteini) * 100,
            100
        )
    })



    watch(()=> props.datum, async (novi)=>{
        odabraniDatum.value= new Date(novi)
        await postaviPrehranuZaDatum(odabraniDatum.value)
    })

    onMounted(async() => {
        await preracunaj()
        await dohvatiUserPodatke()
        await dohvatiHranu()
        await dohvatiObroke()

        await postaviPrehranuZaDatum(odabraniDatum.value)
    })
</script>

<template>
    <div v-if="!loading && !izbornikHrane && !detalji" class="min-h-screen flex flex-col items-center bg-gray-100 text-gray-800 px-4 py-8"
    >

        <RouterLink  to="/pocetna" class="text-center bg-red-600 text-white rounded hover:bg-red-400 p-2 font-semibold mb-4">
            Početna
        </RouterLink>
        
        <div class="flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-4 mb-6 w-full max-w-md">
            <button @click="nazad" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-bold">
                ◀
            </button>

            <div class="text-lg font-semibold tracking-wide text-gray-700">
                {{ formatirajDatumISO(odabraniDatum) }}
            </div>

            <button @click="naprijed" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-bold">
                ▶
            </button>
        </div>

        <div v-if="userPodaci" class="flex flex-col items-center">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Cilj kalorije:</span> 
            <span class="text-lg font-semibold text-green-600">{{ Number(userPodaci.cilj_kalorije).toFixed(2) ?? 'Nije definirano' }} kcal</span>
        </div>

        <div v-if="userPodaci" class="flex flex-col items-center">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Cilj proteini:</span> 
            <span class="text-lg font-semibold text-red-600">{{ Number(userPodaci.cilj_proteini).toFixed(2) ?? 'Nije definirano' }} g</span>
    
        </div>

        <div v-if="danasnjaPrehrana" class="bg-white shadow rounded-xl p-4 w-full max-w-md mb-6">
            <p class="font-semibold mb-1">Ostvarene kalorije: {{ Number(danasnjaPrehrana.ostvareneKalorije).toFixed(2) }}</p>
            
            <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div class="h-3 bg-green-500 rounded-full transition-all" :style="{ width: postotakKalorije + '%' }"></div>
            </div>


            <p class="font-semibold mb-1">Ostvareni proteini: {{ Number(danasnjaPrehrana.ostvareniProteini).toFixed(2) }}</p>

            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div class="h-3 bg-red-400 rounded-full transition-all" :style="{ width: postotakProteini + '%' }"></div>
            </div>



            <div v-for="(obrok, ime_obroka) in danasnjaPrehrana.pojedeno" :key="ime_obroka" class="border-t pt-3 mt-3">
                <b class="flex justify-between items-center font-semibold">{{ ime_obroka }}:</b> 
                <button @click="otvoriIzbornik(ime_obroka)" class="bg-red-500 text-white rounded px-2 hover:bg-red-600">+</button>
                <ul>
                    <li v-if="obrok.length === 0" class="text-gray-500 italic">
                        Nema unosa
                    </li>
                    <li v-for="(stavka, i) in obrok" :key="i" class="flex justify-between items-center text-sm py-1">
                        <span class="cursor-pointer hover:underline" @click="urediStavku(ime_obroka, i)">
                            {{ stavka.naziv }} - {{ stavka.grami }} g 
                            {{ stavka.proteini }} g proteina - {{ stavka.kalorije }} kalorija
                        </span>

                        <button class="text-red-600 font-bold ml-2 hover:text-red-800" @click="obrisiStavku(ime_obroka, i)">
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

    <div v-else-if="izbornikHrane && !detalji" class="min-h-screen flex flex-col items-center bg-gray-100 text-gray-800 px-4 py-8">
        <button @click="zatvoriIzbornik()" class="text-center bg-gray-600 text-white rounded hover:bg-gray-400 p-2 font-semibold mb-4">
            Zatvori
        </button>
        <h3>
            <b>
                Hrana
            </b>
        </h3>
        <div v-for="h in svaHrana" :key="h.id" @click="detaljiHrane(h)" class="bg-white rounded-lg shadow p-3 w-full max-w-md mb-2 cursor-pointer hover:bg-gray-50">
            {{ h.naziv }} – {{ h.kalorije }} kcal / {{ h.proteini }} g
            <b>{{ h.grami }} grama</b>
        </div>

        <h3>
            <b>
                Obroci
            </b>
        </h3>
        <div v-for="o in sviObroci" :key="o.id" @click="detaljiObroka(o)" class="bg-white rounded-lg shadow p-3 w-full max-w-md mb-2 cursor-pointer hover:bg-gray-50">
            {{ o.naziv }} – {{ o.kalorije }} kcal / {{ o.proteini }} g 
            <b>{{ o.grami }} grama</b>
        </div>

    </div>

    <div v-else-if="detalji" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm text-center space-y-3">
            <button @click="zatvoriDetalji()">
                Nazad
            </button>

            <div class="text-xl font-bold">
                {{ detaljiStavke.podatak.naziv }}
            </div>
            <div class="text-green-600 font-semibold">
                {{ izracunateKalorije }} kcal
            </div>
            <div class="text-red-500 font-semibold">
                {{ izracunatiProteini }} g
            </div>
            
            <label>
                Grami:
                <input type="number" min="1" v-model.number="detaljiStavke.novi_grami" class="border rounded px-2 py-1 w-24 text-center"/>
            </label>

            <button v-if="editMode" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full" @click="urediUredenuStavku">
                Spremi promjene
            </button>

            <button v-else class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full" @click="dodajStavku">
                Dodaj u {{ aktivniObrok }}
            </button>
        </div>
    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
</template>

