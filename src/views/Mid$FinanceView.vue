<script>
import NavBar from '../components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  
  data(){
    return{
      ModalActive: false,
      CurrentSearch: '',
      MyTickers: [
        {
          Ticker: 'Teste 01',
          TickerLongName: 'Nome completo',
          Quantity: 100,
          MidPrice: 0,
          Orders: [],
          FetchedData: {}
        }
      ]
    }
  },
  methods: {
    ModalHandler(){
      this.ModalActive = !this.ModalActive
    },

    testClick(){
      console.log(this.CurrentSearch.replaceAll(' ', '').toUpperCase())
    }
  },
}

</script>

<template>
  <NavBar />
  <main class=" h-[90vh] ">
    <div class="flex flex-col my-0 mx-auto w-8/12 max-w-8/12 pt-12">
      <div class="self-start p-2">
        <button type="button" class="text-green-500 hover:text-green-600" @click="ModalHandler()" > + Adicionar novo Ticker </button>
      </div>
      <div class="self-center w-full h-full">
        <table class="w-full text-center">
          <thead>
            <tr class="border-solid border-2 border-zinc-600">
              <th class="p-1">~</th>
              <th class="p-1" >Ticker</th>
              <th class="p-1" >Nome da Companhia</th>
              <th class="p-1" >Minhas Ações</th>
              <th class="p-1" >Preço Médio</th>
              <th class="p-1" >...</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(Ticker, index) in MyTickers">
              <td  class="p-1" > {{ index + 1 }} </td>
              <td  class="p-1" > {{ Ticker.Ticker }} </td>
              <td  class="p-1" > {{ Ticker.TickerLongName }} </td>
              <td  class="p-1" > {{ Ticker.Quantity }} </td>
              <td  class="p-1" > {{ Ticker.MidPrice }} </td>
              <td  class="p-1" >
                <div>
                  <button type="button"> I </button>
                  <button type="button" class="ml-2"> X </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="fixed z-10 top-[63px] bg-zinc-600/20 w-full h-full flex justify-center" :class="{hidden: this.ModalActive}" @click="ModalHandler()">
      <div class="z-20 grid grid-cols-6 w-8/12 h-4/5 bg-white mt-12 rounded-xl bg-zinc-900" @click.stop="">
        <div class=" col-start-3 col-end-5 my-8 mx-auto">
          <div class="flex flex-row">
            <input maxlength="9" v-model="this.CurrentSearch" @focus="this.CurrentSearch=''"
              type="search"
              class="w-28 m-0 uppercase rounded-l border border-solid border-neutral-300/20 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-500 outline-none transition duration-300 ease-in-out focus:text-neutral-200 focus:shadow-te-primary focus:outline-none"
              placeholder="Ticker"
              aria-label="Ticker"
              aria-describedby="button-addon1" />
            <button @click="testClick($event)"
              class="flex items-center rounded-r px-3 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out bg-blue-700 hover:bg-blue-500 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
              type="button"
              id="button-addon1"
              data-te-ripple-init
              data-te-ripple-color="light">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="white"
                class="h-5 w-5">
                <path
                  fill-rule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div class="col-start-6 col-end-7 justify-self-end m-4">
          <button type="button" class="text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="ModalHandler()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd">
              </path>
            </svg>  
          </button>
        </div>
        <div class="flex col-start-3 col-end-5 self-end justify-center mb-4">
          <button class="w-24 bg-transparent hover:bg-red-500 text-white font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" @click="ModalHandler()">
            Cancelar
          </button>
          <button class="w-24 bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 border-none rounded ml-4">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
