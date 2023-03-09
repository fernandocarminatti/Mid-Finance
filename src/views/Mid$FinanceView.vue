<script>
import NavBar from '../components/NavBar.vue'

export default {
  components: {
    NavBar
  },

  beforeMount() {
    if(JSON.parse(localStorage.getItem('Tickers')) == null) {
      localStorage.setItem('Tickers', JSON.stringify(this.MyTickers))
    }
    this.MyTickers = JSON.parse(localStorage.getItem('Tickers'))
  },
  
  data(){
    return{
      ModalActive: false,
      CurrentSearch: '',
      CurrentSearchIndex: '',
      NewOrderDescription: '',
      NewOrderQuantity: '',
      NewOrderPrice: '',
      MyTickers: [],
      CurrentSearchTickerData:{
          Ticker: '',
          TickerLongName: '',
          TickerQuantity: 0,
          TickerMidPrice: 0,
          TickerOrders: [],
          FetchedData: {}
        }
    }
  },
  methods: {
    RemoveTicker(TickerIndex) {
      if(confirm('Deseja mesmo remover?')) {
        this.MyTickers.splice(TickerIndex, 1)
        this.UpdateStorage() 
      }
    },

    RemoveOrder(OrderIndex){
      this.CurrentSearchTickerData.TickerOrders.splice(OrderIndex, 1)
    },

    ModalHandler(){
      this.NewOrderDescription = '',
      this.NewOrderQuantity = '',
      this.NewOrderPrice = '',
      this.ModalActive = !this.ModalActive
    },

    EditTicker(TickerStr) {
      this.ModalHandler()
      this.CurrentSearch = TickerStr
      this.TickerSearch()
    },

    TickerSearch(){
      this.CurrentSearch = this.CurrentSearch.replaceAll(' ','').toUpperCase()
      this.CurrentSearchIndex = this.MyTickers.findIndex( x => x.Ticker === this.CurrentSearch)
      if(this.MyTickers[this.CurrentSearchIndex] !== undefined) {
        this.CurrentSearchTickerData = this.MyTickers[this.CurrentSearchIndex]
      } else {
        this.CurrentSearchTickerData = {
          Ticker: this.CurrentSearch,
          TickerLongName: '',
          TickerOrders: [],
          TickerQuantity: 0,
          TickerMidPrice: 0,
          FetchedData: {}
        }
      }
    },

    AddNewOrder(){
      if( this.CurrentSearch !== '') {

        this.CurrentSearchTickerData.TickerOrders.unshift(
          {
            Description: this.NewOrderDescription,
            OrderQuantity: this.NewOrderQuantity,
            OrderPrice: this.NewOrderPrice
          }
        )
        
      }
    },

    async SaveTicker() {
      if( this.CurrentSearch !== '') {
        let CurrQuantity = 0
        let CurrMidPrice = 0
        this.CurrentSearchTickerData.TickerOrders.forEach( el => CurrQuantity += parseInt(el.OrderQuantity))
        this.CurrentSearchTickerData.TickerOrders.forEach( el => CurrMidPrice += parseFloat(el.OrderPrice))
        this.CurrentSearchTickerData.TickerQuantity = CurrQuantity
        this.CurrentSearchTickerData.TickerMidPrice = ( CurrMidPrice / this.CurrentSearchTickerData.TickerOrders.length )
        await this.FetchTickerData()
        if(this.CurrentSearchIndex == -1) {
          this.MyTickers.unshift(this.CurrentSearchTickerData)
        } else {
          this.MyTickers.splice([this.CurrentSearchIndex], 1, this.CurrentSearchTickerData)
        }
        this.ModalHandler()
        this.UpdateStorage()
      }       
    },

    async FetchTickerData() {
      let ResponseData = await fetch(`https://brapi.dev/api/quote/${this.CurrentSearch}?range=1d`)
      let FetchedData = await ResponseData.json()
      if (!ResponseData.ok) {
        alert('Não foi possível encontrar dados do Ticker informado.')
        throw new Error(`ERRO! -> status: ${ResponseData.status}`);
      }
      this.CurrentSearchTickerData.TickerLongName = FetchedData.results[0].longName
      this.CurrentSearchTickerData.LastFetch = FetchedData.requestedAt
      this.CurrentSearchTickerData.FetchedData = FetchedData.results[0]
    },

    UpdateStorage() {
      localStorage.setItem('Tickers', JSON.stringify(this.MyTickers))
    }
  }
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
        <table class="w-full text-center table-auto">
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
            <tr v-for="(Ticker, TickerIndex) in MyTickers" :key="TickerIndex" class="shadow-md">
              <td  class="p-1" > {{ TickerIndex + 1 }} </td>
              <td @click="EditTicker(Ticker.Ticker)" class="p-1" > {{ Ticker.Ticker }} </td>
              <td  class="p-1" > {{ Ticker.TickerLongName }} </td>
              <td  class="p-1" > {{ Ticker.TickerQuantity }} </td>
              <td  class="p-1" > {{ Ticker.TickerMidPrice.toFixed(2) }} </td>
              <td  class="p-1" >
                <div>
                  <button type="button"> I </button>
                  <button @click="RemoveTicker(TickerIndex)" type="button" class="ml-2"> X </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="fixed z-10 top-[63px] bg-zinc-600/20 w-full h-full flex justify-center" :class="{hidden: !this.ModalActive}" @click="ModalHandler()">
      <div class="z-20 grid grid-cols-8 grid-rows-6 w-8/12 h-4/5 bg-white mt-12 rounded-xl bg-zinc-900" @click.stop="">
        <div class=" col-start-4 col-end-6 my-8 mx-auto">
          <div class="flex flex-row">
            <input maxlength="9" v-model.lazy="this.CurrentSearch" @focus="this.CurrentSearch=''"
              type="search"
              class="w-28 m-0 uppercase rounded-l border border-solid border-neutral-300/20 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-500 outline-none transition duration-300 ease-in-out focus:text-neutral-200 focus:shadow-te-primary focus:outline-none"
              placeholder="Ticker"
              aria-label="Ticker"
              aria-describedby="button-addon1" />
            <button @click="TickerSearch(this.CurrentSearch)"
              class="flex items-center rounded-r px-3 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out bg-blue-600 hover:bg-blue-500 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
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
        <div class="col-start-8 col-end-9 justify-self-end m-4">
          <button type="button" class="text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="ModalHandler()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd">
              </path>
            </svg>  
          </button>
        </div>
        <div class="flex flex-row jusfity-center items center col-start-3 col-end-7 h-12 mt-4">
            <div class="relative">
                <input v-model.lazy="NewOrderDescription" type="text" id="OrderDescription" class="block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderDescription" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Descrição</label>
            </div>
            <div class="relative ml-8">
                <input v-model="NewOrderQuantity" type="number" required id="OrderDescription" class="appearance-none block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderDescription" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Quantidade</label>
            </div>
            <div class="relative ml-8">
                <input v-model="NewOrderPrice" type="number" required  id="OrderDescription" class="appearance-none block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderDescription" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Preço</label>
            </div>
            <div class="relative ml-8 flex justify-center items-center">
              <button @click="AddNewOrder()" class=" bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 border-none rounded ml-4">
                Adicionar
              </button>
            </div>
        </div>
        <div class="col-start-2 col-end-8">
          <table class="w-full text-center table-auto" >
            <thead>
              <tr class="border-solid border-2 border-zinc-600">
                <th class="p-1">~</th>
                <th class="p-1" >Descrição</th>
                <th class="p-1" >Quantidade</th>
                <th class="p-1" >Preço</th>
                <th class="p-1" >...</th>
              </tr>
            </thead>
            <tbody v-if="this.CurrentSearchTickerData !== undefined">
              <tr v-for="(TickerOrder, OrderIndex) in this.CurrentSearchTickerData.TickerOrders" :key="OrderIndex">
                <td  class="p-1" > {{ OrderIndex + 1 }} </td>
                <td  class="p-1" > {{ TickerOrder.Description }} </td>
                <td  class="p-1" > {{ TickerOrder.OrderQuantity }} </td>
                <td  class="p-1" > {{ TickerOrder.OrderPrice.toFixed(2) }} </td>
                <td  class="p-1" >
                  <div>
                    <button type="button"> I </button>
                    <button @click="RemoveOrder(OrderIndex)" type="button" class="ml-2"> X </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex col-start-4 col-end-6 row-start-6 self-end justify-center mb-4">
          <button class="w-24 bg-transparent hover:bg-red-500 text-white font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" @click="ModalHandler()">
            Cancelar
          </button>
          <button @click="SaveTicker()" class="w-24 bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 border-none rounded ml-4">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
