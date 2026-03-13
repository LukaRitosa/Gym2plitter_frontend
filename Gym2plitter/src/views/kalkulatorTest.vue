<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, computed } from 'vue'
    import axios from 'axios'



    const router=useRouter()

    const loading=ref(false)

    const ciljevi= ['mršavljanje', 'održavanje', 'povećanje mase']
    const sex= ['m', 'f']

    const ruta= import.meta.env.VITE_BASE_URL


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

        try{
            const token= localStorage.getItem("token")
            await axios.patch(
                `${ruta}/user/kalkulator`,
                {
                    tezina: form.value.tezina,
                    visina: form.value.visina,
                    dob: form.value.dob,
                    sex: form.value.sex,
                    cilj: form.value.cilj
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            router.push('/pocetna')
        } catch (error){
            console.log(error)
            alert(error.response.data.greska)
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

        <div class="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">

            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Kalkulator prehrane</h1>

                <RouterLink 
                    to="/pocetna"
                    class="text-sm bg-red-400 text-white px-3 py-1 rounded hover:bg-red-300">
                    Početna
                </RouterLink>
            </div>

            <div v-if="ciljKalorije" class="bg-red-100 rounded-lg p-4 text-center">
                <p class="text-lg font-semibold">Cilj kalorije</p>
                <p class="text-2xl font-bold">{{ ciljKalorije }} kcal</p>

                <p class="mt-2 text-lg font-semibold">Proteini</p>
                <p class="text-xl">{{ ciljProteini }} g</p>
            </div>


            <div class="flex flex-col gap-1">
                <label class="font-semibold">Cilj</label>
                <select v-model="form.cilj" class="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-400">
                    <option disabled value="">Odaberi cilj</option>
                    <option v-for="c in ciljevi" :key="c" :value="c">
                        {{ c }}
                    </option>
                </select>
            </div>


            <div class="flex flex-col gap-1">
                <label class="font-semibold">Spol</label>
                <select v-model="form.sex" class="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-400">
                    <option disabled value="">Odaberi sex</option>
                    <option v-for="s in sex" :key="s" :value="s">
                        {{ s }}
                    </option>
                </select>
            </div>


            <div class="grid grid-cols-3 gap-3">

                <div class="flex flex-col">
                    <label class="text-sm font-semibold">Visina</label>
                    <input type="number" v-model.number="form.visina" class="border rounded p-2">
                    <span class="text-xs">cm</span>
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold">Dob</label>
                    <input type="number" v-model.number="form.dob" class="border rounded p-2">
                    <span class="text-xs">god</span>
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold">Težina</label>
                    <input type="number" v-model.number="form.tezina" class="border rounded p-2">
                    <span class="text-xs">kg</span>
                </div>

            </div>


            <button :disabled="loading || !popunjeno" class="w-full bg-red-800 text-white rounded-lg hover:bg-red-600 p-3 font-semibold disabled:opacity-50" @click="posaljiOdgovore">
                <span v-if="!loading">Pošalji odgovor</span>

                <span v-else class="flex justify-center">
                    <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="w-5 h-5" />
                </span>

            </button>

        </div>

    </div>

</template>