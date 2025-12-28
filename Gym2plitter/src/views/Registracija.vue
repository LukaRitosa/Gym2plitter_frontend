<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { createUserWithEmailAndPassword } from 'firebase/auth'
    import { auth } from '@/firebase.js'
    import { setDoc, doc } from "firebase/firestore"
    import { db } from "@/firebase.js"
    
    const username=ref("")    
    const email=ref("")    
    const password=ref("")    
    const password2=ref("")  
    const poruka=ref({ error: false, message: '' })      

    const router=useRouter()
    const userStore=useUserStore()
    const loading = ref(false)

    function formatirajDatumISO(datum) {
        const y = datum.getFullYear()
        const m = String(datum.getMonth() + 1).padStart(2, '0')
        const d = String(datum.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    function stvoriPrehranu(){
        const dani= []
        const danas= new Date()
        
        for(let i=6; i>=0; i--){
            let d= new Date(danas)
            d.setDate(danas.getDate()-i)

            dani.push({
                datum: formatirajDatumISO(d),
                ostvareneKalorije: 0,
                ostvareniProteini:0,
                pojedeno: {
                    nekarakterizirano: [],
                    marenda: [],
                    rucak: [],
                    vecera: [],
                    snack: []
                }
            })
        }

        return dani
    }

    
    const registracija = async () => {
        loading.value = true
        if(password.value!==password2.value){
            poruka.value.error = true
            poruka.value.message = 'Lozinke se ne podudaraju'
            loading.value = false
            return
        }
        try {            
            const preh= stvoriPrehranu()
            const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)

            userStore.setCurrentUserSignUp({
                username: username.value,
                email: userCredential.user.email,
                uid: userCredential.user.uid
            })

            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: username.value,
                email: userCredential.user.email,
                prehrana: preh,
                slobodnoVrijeme: null,
                trenutniSplit: null,
                slobodni_dani: [],
                tezina: null,
                visina: null,
                cilj: '',
                dob: null,
                sex: null,
                cilj_kalorije: null,
                cilj_proteini: null
            })
            

            router.push('/')
        } catch (error) {
            poruka.value = { error: true, message: 'Greška: ' + error.message }
        }
        finally {
            loading.value = false
        }
    }

    


</script>

<template>



    <div class="min-h-screen flex items-center justify-center bg-gray-100 text-red-900 px-4">
        
        <div class="bg-white p-6 rounded-md w-full max-w-md">
            
            <div class="text-center mb-6 p-4">
                    <div class="text-4xl font-serif font-bold">GymSplitter</div>
                    <div class="text-center text-3xl mt-2">🏋️‍♀️</div>
            </div>
            
            <div class="flex justify-center border-b border-gray-300 mb-6">
                <RouterLink to="/" class="px-4 py-2 font-semibold text-gray-700 hover:text-red-700">Prijava</RouterLink>
                <span class="px-4 py-2 font-semibold border-b-2 border-red-700 text-red-700">Registracija</span>
            </div>
            
            
        
            <form  @submit.prevent="registracija" class="space-y-4">

                <div>
                    <div>
                        <b>Ime i prezime:</b>
                    </div>    
                    <input type="text" class="border p-1 w-full" placeholder="Ime i prezime..." v-model="username">
                </div>

                <div>
                    <div>
                        <b>Email:</b>
                    </div>   
                    <input type="text" class="border p-1 w-full" placeholder="Mail..." v-model="email">
                </div>

                <div>   
                    <div>
                        <b>Lozinka:</b>                    
                    </div> 
                    <input type="password" class="border p-1 w-full" placeholder="Lozinka..." v-model="password">
                </div>
                
                <div>
                    <div>
                        <b>Ponovi lozinku:</b>
                    </div>
                    <input type="password" class="border p-1 w-full" placeholder="Ponovi lozinku..." v-model="password2">
                </div>

                <button :disabled="loading" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" type="submit">
                    <span v-if="!loading">Registracija</span>
                    <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
                </button>

                

                <div v-if="poruka.message" :class="poruka.error ? 'text-red-500' : 'text-green-600'">{{ poruka.message }}</div>
            
            </form>
        </div>
    </div>


</template>