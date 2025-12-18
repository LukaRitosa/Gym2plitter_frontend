<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref, computed } from 'vue'
    import { updateDoc, doc } from "firebase/firestore"
    import { db } from '@/firebase' 



    const router=useRouter()
    const userStore=useUserStore()

    const loading=ref(false)

    const ciljevi= ['mršavljanje', 'održavanje', 'povećanje mase']
    const sex= ['m', 'f']



    const bmr= computed(() => {
        if (!form.value.tezina || !form.value.visina || !form.value.dob) return 0

        if (form.value.sex === 'm') {
            return 10 * form.value.tezina + 6.25 * form.value.visina - 5 * form.value.dob + 5
        } else {
            return 10 * form.value.tezina + 6.25 * form.value.visina - 5 * form.value.dob - 161
        }
    })


    const ciljKalorije= computed(() => {
        let kcal = bmr.value * 1.4

        if (form.value.cilj === 'mršavljanje') kcal -= 400
        if (form.value.cilj === 'povećanje mase') kcal += 300

        return Math.round(kcal)
    })


    const ciljProteini= computed(()=>{
        return form.value.tezina ? Math.round(form.value.tezina * 2) : 0
    })

    const form= ref({
        cilj: '',
        sex: '',
        visina: null,
        dob: null,
        tezina: null,
    })

    const posaljiOdgovore= async ()=>{
        loading.value= true
        const user= userStore.currentUser

        try{
            await updateDoc(doc(db, 'users', user.uid),{
                tezina: form.value.tezina,
                visina: form.value.visina,
                cilj: form.value.cilj,
                dob: form.value.dob,
                sex: form.value.sex,
                cilj_kalorije: ciljKalorije.value,
                cilj_proteini: ciljProteini.value
            })
            router.push('/pocetna')
        } catch (error){
            console.log(error)
            alert("Došlo je do greške.")
        } finally{
            loading.value= false
        }
    }

    const popunjeno = computed(() => {
        return (
            form.value.cilj &&
            form.value.sex &&
            form.value.visina > 0 &&
            form.value.dob > 0 &&
            form.value.tezina > 0
        )
    })




</script>

<template>

    <div class="min-h-screen flex items-center justify-center bg-red-200 text-red-900 px-4">

        <div>

            <div class="m-4">
                <RouterLink to="/pocetna" class="w-full bg-red-400 text-white rounded hover:bg-red-300 p-2 font-semibold"> Početna</RouterLink>
            </div>

            <div v-if="ciljKalorije" class="mt-4 font-semibold">
                <p>Cilj kalorije: {{ ciljKalorije }} kcal</p>
                <p>Cilj proteini: {{ ciljProteini }} g</p>
            </div>



            <select v-model="form.cilj">
                <option disabled value="">Odaberi cilj</option>
                <option v-for="c in ciljevi" :key="c" :value="c">
                    {{ c }}
                </option>
            </select>



            <select v-model="form.sex">
                <option disabled value="">Odaberi sex</option>
                <option v-for="s in sex" :key="s" :value="s">
                    {{ s }}
                </option>
            </select>


            <input type="number" v-model.number="form.visina" /> cm
            <input type="number" v-model.number="form.dob" /> godina
            <input type="number" v-model.number="form.tezina" /> kg


            <button :disabled="loading || !popunjeno" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" @click="posaljiOdgovore">
                <span v-if="!loading">Pošalji odgovor</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>
        
        </div>
    
    </div>

</template>