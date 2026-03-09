<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref } from 'vue'
    import axios from 'axios'

    const email = ref('')
    const password = ref('')
    const poruka=ref({ error: false, message: '' })

    const loading = ref(false)
    
    const prijava = async () => {
        loading.value = true
        try {

            const rez= await axios.post('http://localhost:3000/user/prijava', {
                email: email.value,
                lozinka: password.value,
            })

            const token= rez.data.jwt_token

            localStorage.setItem("token", token)

            poruka.value={ error: false, message: rez.data.message }

            router.push("/pocetna")

        } catch (error) {
            poruka.value= {error: true, message: error.response.data.greska}
        }
        finally {
            loading.value = false
        }
    }

    const router=useRouter()

</script>

<template>



    <div class="min-h-screen flex items-center justify-center bg-gray-100 text-red-900 px-4">
        
        <div class="bg-white p-6 rounded-md w-full max-w-md">
            
            <div class="text-center mb-6 p-4">
                    <div class="text-4xl font-serif font-bold">GymSplitter</div>
                    <div class="text-center text-3xl mt-2">🏋️‍♀️</div>
            </div>
            
            <div class="flex justify-center border-b border-gray-300 mb-6">
                <span class="px-4 py-2 border-b-2 font-semibold border-red-700 text-red-700">Prijava</span>
                <RouterLink to="/registracija" class="px-4 py-2 font-semibold text-gray-700 hover:text-red-700">Registracija</RouterLink>
            </div>

        <form @submit.prevent="prijava" class="space-y-4">

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

            <button :disabled="loading" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" type="submit">
                <span v-if="!loading">Prijava</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>

            

            <div v-if="poruka.message" :class="poruka.error ? 'text-red-500' : 'text-green-600'">{{ poruka.message }}</div>

            <RouterLink to="/adminPrijava" class="block bg-black text-white rounded hover:bg-red-600 p-2 font-semibold w-full text-center">
                Admin
            </RouterLink>

        </form>
        
        
        

        </div>

    </div>




</template>