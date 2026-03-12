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
            postaviPrehranuZaDatum(odabraniDatum.value)
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
            postaviPrehranuZaDatum(odabraniDatum.value)
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
            postaviPrehranuZaDatum(odabraniDatum.value)
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

    async function preracunajan(){
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



    watch(()=> props.datum, (novi)=>{
        odabraniDatum.value= new Date(novi)
        postaviPrehranuZaDatum(odabraniDatum.value)
    })

    onMounted(async() => {
        await preracunajan()
        await dohvatiUserPodatke()
        await dohvatiHranu()
        await dohvatiObroke()

        await postaviPrehranuZaDatum(odabraniDatum.value)
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
