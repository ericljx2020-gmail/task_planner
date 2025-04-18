<template>
  <div class="login-form">
    <div v-if="isRegistration" class="pb-6">
      <h2 class="text-2xl font-bold mb-6">Create Account</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-sm mb-2" for="username">Username</label>
          <input 
            id="username"
            v-model="registerForm.username" 
            type="text" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm mb-2" for="email">Email</label>
          <input 
            id="email"
            v-model="registerForm.email" 
            type="email" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm mb-2" for="first_name">First Name</label>
          <input 
            id="first_name"
            v-model="registerForm.first_name" 
            type="text" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm mb-2" for="last_name">Last Name</label>
          <input 
            id="last_name"
            v-model="registerForm.last_name" 
            type="text" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm mb-2" for="register_password">Password</label>
          <input 
            id="register_password"
            v-model="registerForm.password" 
            type="password" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm mb-2" for="confirm_password">Confirm Password</label>
          <input 
            id="confirm_password"
            v-model="registerForm.confirm_password" 
            type="password" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
          <p v-if="passwordsDoNotMatch" class="text-red-500 text-sm mt-1">
            Passwords do not match
          </p>
        </div>
        
        <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>
        
        <button 
          type="submit" 
          class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        >
          Create Account
        </button>
        
        <p class="text-center">
          Already have an account?
          <a href="#" @click.prevent="isRegistration = false" class="text-blue-400 hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </div>
    
    <div v-else class="pb-6">
      <h2 class="text-2xl font-bold mb-6">Sign In</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm mb-2" for="login_username">Username</label>
          <input 
            id="login_username"
            v-model="loginForm.username" 
            type="text" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm mb-2" for="login_password">Password</label>
          <input 
            id="login_password"
            v-model="loginForm.password" 
            type="password" 
            class="w-full p-2 rounded bg-app-light border border-gray-600"
            required
          />
        </div>
        
        <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>
        
        <button 
          type="submit" 
          class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        >
          Sign In
        </button>
        
        <p class="text-center">
          Don't have an account?
          <a href="#" @click.prevent="isRegistration = true" class="text-blue-400 hover:underline">
            Create Account
          </a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '../services/api';

const emit = defineEmits(['login-success']);

// Form toggle state
const isRegistration = ref(false);

// Form data
const loginForm = ref({
  username: '',
  password: ''
});

const registerForm = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  confirm_password: ''
});

// Error handling
const errorMessage = ref('');

// Password validation
const passwordsDoNotMatch = computed(() => {
  return registerForm.value.password !== registerForm.value.confirm_password && 
         registerForm.value.confirm_password.length > 0;
});

// Form handlers
const handleLogin = async () => {
  try {
    errorMessage.value = '';
    const response = await api.login(loginForm.value);
    
    if (response.detail && response.detail === 'Invalid credentials') {
      errorMessage.value = 'Invalid username or password';
      return;
    }
    
    // Success - notify parent component
    emit('login-success', response);
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Error during login. Please try again.';
  }
};

const handleRegister = async () => {
  try {
    errorMessage.value = '';
    
    // Check if passwords match
    if (registerForm.value.password !== registerForm.value.confirm_password) {
      errorMessage.value = 'Passwords do not match';
      return;
    }
    
    // Create the registration data
    const registerData = { ...registerForm.value };
    delete registerData.confirm_password;
    
    // Send registration request
    const response = await api.register(registerData);
    
    if (response.id) {
      // Registration successful, switch to login
      isRegistration.value = false;
      loginForm.value.username = registerForm.value.username;
      loginForm.value.password = '';
      
      // Clear registration form
      registerForm.value = {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: ''
      };
    } else if (response.username) {
      errorMessage.value = response.username[0];
    } else if (response.email) {
      errorMessage.value = response.email[0];
    } else if (response.password) {
      errorMessage.value = response.password[0];
    } else {
      errorMessage.value = 'Registration error. Please check your information.';
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value = 'Error during registration. Please try again.';
  }
};
</script> 