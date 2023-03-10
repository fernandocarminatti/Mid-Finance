<script>
import NavBar from '../components/NavBar.vue'

export default {
  components: {
    NavBar
  },

  beforeMount() {
    if(JSON.parse(localStorage.getItem('Tickers')) == null || JSON.parse(localStorage.getItem('Orders')) == null) {
      localStorage.setItem('Tickers', JSON.stringify(this.MyTickers))
      localStorage.setItem('Orders', JSON.stringify(this.MyOrders))
    }
    this.MyTickers = JSON.parse(localStorage.getItem('Tickers'))
    this.MyOrders = JSON.parse(localStorage.getItem('Orders'))
  },
  
  data(){
    return{
      NewOrderModalActive: false,
      TickerModalActive: false,
      CurrentSearch: '',
      CurrentSearchIndex: '',
      OrderDate: '',
      OrderQuantity: 0,
      OrderTotalTax: 0,
      NewTickerOrder: '',
      NewTickerOrderQuantity: '',
      NewTickerOrderPrice: '',
      CurrentOrder: [],
      MyOrders: [],
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
        this.UpdateTickerStorage() 
      }
    },

    RemoveOrder(OrderIndex){
      this.CurrentOrder.Data.splice(OrderIndex, 1)
    },

    NewOrderModalHandler(){
      this.NewOrderModalActive = !this.NewOrderModalActive
    },

    TickerModalHandler(){
      this.TickerModalActive = !this.TickerModalActive
      this.TickerSearch()
    },

    EditTicker(TickerStr) {
      this.TickerModalHandler()
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

    OrderSearch() {
      if( this.MyOrders.find(el => el.OrderDate == this.OrderDate) !== undefined ){
        let strFinder = this.MyOrders.findIndex( el => el.OrderDate == this.OrderDate)
        console.log('ja tem', strFinder)
        this.CurrentOrder = this.MyOrders[strFinder]
        this.OrderQuantity = this.CurrentOrder.OrderQuantity
        this.OrderTotalTax = this.CurrentOrder.OrderTotalTax
      } else {
        this.CurrentOrder = {
            OrderDate: this.OrderDate,
            OrderQuantity: this.OrderQuantity,
            OrderTotalTax: this.OrderTotalTax,
            Data: []
          }
        console.log('nao tem')
        console.log(this.MyOrders.findIndex(el => el.OrderDate == this.OrderDate))
      }
    },

    AddNewOrder(){
      if( this.NewTickerOrderQuantity !== '' || this.NewTickerOrderPrice !== '') {
        this.CurrentOrder.Data.unshift({
          TickerOrder: this.NewTickerOrder.replaceAll(' ','').toUpperCase(),
          TickerQuantity: this.NewTickerOrderQuantity,
          TickerPrice: this.NewTickerOrderPrice
        }
        )
        this.NewTickerOrder = ''
        this.NewTickerOrderQuantity = ''
        this.NewTickerOrderPrice = ''      
        console.log(this.CurrentOrder)

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
        this.UpdateTickerStorage()
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

    NewOrderSave() {
      if( this.MyOrders.find(el => el.OrderDate == this.OrderDate) !== undefined ) {
        let strFinder = this.MyOrders.findIndex( el => el.OrderDate == this.OrderDate)
        this.CurrentOrder.OrderQuantity = this.OrderQuantity
        this.CurrentOrder.OrderTotalTax = this.OrderTotalTax 
        this.MyOrders.splice([strFinder], 1, this.CurrentOrder)
        console.log(this.MyOrders)
        this.UpdateOrderStorage()
      } else {
        this.MyOrders.push(this.CurrentOrder)
        console.log(this.MyOrders)
        this.UpdateOrderStorage()
      }
    },

    UpdateOrderStorage() {
      console.log('update Order')
      localStorage.setItem('Orders', JSON.stringify(this.MyOrders))
    },

    UpdateTickerStorage() {
      localStorage.setItem('Tickers', JSON.stringify(this.MyTickers))
    }
  }
}

</script>

<template>
  <NavBar />
  <main class=" h-[90vh]">
    <div class="flex flex-col my-0 mx-auto w-8/12 max-w-8/12 max-h-4/5 pt-12 overflow-y-auto scroll-smooth">
      <div class="self-start p-2">
        <button type="button" class="text-green-500 hover:text-green-600" @click="NewOrderModalHandler()" > + Novo Ticker </button>
      </div>
      <div class="self-center w-full h-full bg-stone-900">
        <table class="w-full text-center table-auto">
          <thead>
            <tr class="border-solid border-2 border-zinc-600 bg-zinc-600/20">
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 ">~</th>
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 " >Ticker</th>
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 " >Nome da Companhia</th>
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 " >Minhas Ações</th>
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 " >Preço Médio</th>
              <th class="p-1 border-solid border-2 border-black bg-zinc-600 " >...</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(Ticker, TickerIndex) in MyTickers" :key="TickerIndex" class="shadow-md">
              <td  class="p-1" > {{ TickerIndex + 1 }} </td>
              <td @click="EditTicker(Ticker.Ticker)" class="p-1" > {{ Ticker.Ticker }} </td>
              <td  class="p-1" > {{ Ticker.TickerLongName }} </td>
              <td  class="p-1" > {{ Ticker.TickerQuantity }} </td>
              <td  class="p-1" > {{ Ticker.TickerMidPrice.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}) }} </td>
              <td  class="p-1" >
                <div class="flex flex-row justify-center items-center">
                  <button type="button" class="w-8 h-8">
                    <svg width="32px" height="32px" viewBox="-1.4 -1.4 28.80 28.80" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16.75C11.8019 16.7474 11.6126 16.6676 11.4725 16.5275C11.3324 16.3874 11.2526 16.1981 11.25 16V11C11.25 10.8011 11.329 10.6103 11.4697 10.4697C11.6103 10.329 11.8011 10.25 12 10.25C12.1989 10.25 12.3897 10.329 12.5303 10.4697C12.671 10.6103 12.75 10.8011 12.75 11V16C12.7474 16.1981 12.6676 16.3874 12.5275 16.5275C12.3874 16.6676 12.1981 16.7474 12 16.75Z" fill="white">
                        </path> 
                        <path d="M12 9.25C11.8019 9.24741 11.6126 9.16756 11.4725 9.02747C11.3324 8.88737 11.2526 8.69811 11.25 8.5V8C11.25 7.80109 11.329 7.61032 11.4697 7.46967C11.6103 7.32902 11.8011 7.25 12 7.25C12.1989 7.25 12.3897 7.32902 12.5303 7.46967C12.671 7.61032 12.75 7.80109 12.75 8V8.5C12.7474 8.69811 12.6676 8.88737 12.5275 9.02747C12.3874 9.16756 12.1981 9.24741 12 9.25Z" fill="white">
                        </path>
                        <path d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89472 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17294C11.99 2.82567 13.7996 3.0039 15.4442 3.68509C17.0887 4.36628 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.387 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21ZM12 4.5C10.5166 4.5 9.0666 4.93987 7.83323 5.76398C6.59986 6.58809 5.63856 7.75943 5.07091 9.12988C4.50325 10.5003 4.35473 12.0083 4.64411 13.4632C4.9335 14.918 5.64781 16.2544 6.6967 17.3033C7.7456 18.3522 9.08197 19.0665 10.5368 19.3559C11.9917 19.6453 13.4997 19.4968 14.8701 18.9291C16.2406 18.3614 17.4119 17.4001 18.236 16.1668C19.0601 14.9334 19.5 13.4834 19.5 12C19.5 10.0109 18.7098 8.10323 17.3033 6.6967C15.8968 5.29018 13.9891 4.5 12 4.5Z" fill="white">
                       </path>
                      </svg>
                  </button>
                  <button @click="RemoveTicker(TickerIndex)" type="button" class="w-8 h-8"> 
                    <svg width="32px" height="32px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.00024000000000000003">
                      <path d="M13.06 12L17.48 7.57996C17.5537 7.5113 17.6128 7.4285 17.6538 7.3365C17.6948 7.2445 17.7168 7.14518 17.7186 7.04448C17.7204 6.94378 17.7018 6.84375 17.6641 6.75036C17.6264 6.65697 17.5703 6.57214 17.499 6.50092C17.4278 6.4297 17.343 6.37356 17.2496 6.33584C17.1562 6.29811 17.0562 6.27959 16.9555 6.28137C16.8548 6.28314 16.7555 6.30519 16.6635 6.34618C16.5715 6.38717 16.4887 6.44627 16.42 6.51996L12 10.94L7.58 6.51996C7.43782 6.38748 7.24978 6.31535 7.05548 6.31878C6.86118 6.32221 6.67579 6.40092 6.53838 6.53834C6.40096 6.67575 6.32225 6.86113 6.31882 7.05544C6.3154 7.24974 6.38752 7.43778 6.52 7.57996L10.94 12L6.52 16.42C6.37955 16.5606 6.30066 16.7512 6.30066 16.95C6.30066 17.1487 6.37955 17.3393 6.52 17.48C6.66062 17.6204 6.85125 17.6993 7.05 17.6993C7.24875 17.6993 7.43937 17.6204 7.58 17.48L12 13.06L16.42 17.48C16.5606 17.6204 16.7512 17.6993 16.95 17.6993C17.1488 17.6993 17.3394 17.6204 17.48 17.48C17.6204 17.3393 17.6993 17.1487 17.6993 16.95C17.6993 16.7512 17.6204 16.5606 17.48 16.42L13.06 12Z" fill="#ffffff">
                      </path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DO TICKER -->

    <div class="fixed z-10 top-[63px] bg-zinc-600/20 w-full h-full flex justify-center" :class="{hidden: !this.TickerModalActive}" @click="TickerModalHandler()">
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
          <button type="button" class="text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="TickerModalHandler()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd">
              </path>
            </svg>  
          </button>
        </div>
        <div class="col-start-2 col-end-8 row-start-3 row-end-6 bg-stone-900 rounded-lg overflow-y-auto scroll-smooth">
          <table class="w-full text-center table-auto rounded-t-lg border-separate" >
            <thead>
              <tr>
                <th class="p-2 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 ">~</th>
                <th class="p-2 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Descrição</th>
                <th class="p-2 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Quantidade</th>
                <th class="p-2 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Preço</th>
                <th class="p-2 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >...</th>
              </tr>
            </thead>
            <tbody v-if="this.CurrentSearchTickerData !== undefined">
              <tr v-for="(TickerOrder, OrderIndex) in this.CurrentSearchTickerData.TickerOrders" :key="OrderIndex" class="shadow-md">
                <td  class="p-2 " > {{ OrderIndex + 1 }} </td>
                <td  class="p-2 " > {{ TickerOrder.Description }} </td>
                <td  class="p-2 " > {{ TickerOrder.OrderQuantity }} </td>
                <td  class="p-2 " > {{ TickerOrder.OrderPrice.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}) }} </td>
                <td  class="p-2 " >
                  <div>
                    <button @click="RemoveOrder(OrderIndex)" type="button" class="ml-2">
                      <svg width="32px" height="32px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.00024000000000000003">
                      <path d="M13.06 12L17.48 7.57996C17.5537 7.5113 17.6128 7.4285 17.6538 7.3365C17.6948 7.2445 17.7168 7.14518 17.7186 7.04448C17.7204 6.94378 17.7018 6.84375 17.6641 6.75036C17.6264 6.65697 17.5703 6.57214 17.499 6.50092C17.4278 6.4297 17.343 6.37356 17.2496 6.33584C17.1562 6.29811 17.0562 6.27959 16.9555 6.28137C16.8548 6.28314 16.7555 6.30519 16.6635 6.34618C16.5715 6.38717 16.4887 6.44627 16.42 6.51996L12 10.94L7.58 6.51996C7.43782 6.38748 7.24978 6.31535 7.05548 6.31878C6.86118 6.32221 6.67579 6.40092 6.53838 6.53834C6.40096 6.67575 6.32225 6.86113 6.31882 7.05544C6.3154 7.24974 6.38752 7.43778 6.52 7.57996L10.94 12L6.52 16.42C6.37955 16.5606 6.30066 16.7512 6.30066 16.95C6.30066 17.1487 6.37955 17.3393 6.52 17.48C6.66062 17.6204 6.85125 17.6993 7.05 17.6993C7.24875 17.6993 7.43937 17.6204 7.58 17.48L12 13.06L16.42 17.48C16.5606 17.6204 16.7512 17.6993 16.95 17.6993C17.1488 17.6993 17.3394 17.6204 17.48 17.48C17.6204 17.3393 17.6993 17.1487 17.6993 16.95C17.6993 16.7512 17.6204 16.5606 17.48 16.42L13.06 12Z" fill="#ffffff">
                      </path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex col-start-4 col-end-6 row-start-6 self-end justify-center mb-4">
          <button class="w-24 bg-transparent hover:bg-red-500 text-white font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" @click="TickerModalHandler()">
            Cancelar
          </button>
          <button @click="SaveTicker()" class="w-24 bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 border-none rounded ml-4">
            Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL NOVA ORDER -->

    <div class="fixed z-10 top-[63px] bg-zinc-600/20 w-full h-full flex justify-center" :class="{hidden: !this.NewOrderModalActive}" @click="NewOrderModalHandler()">
      <div class="z-20 grid grid-cols-8 grid-rows-6 w-8/12 h-4/5 bg-white mt-12 rounded-xl bg-zinc-900" @click.stop="">
        <div class=" col-start-4 col-end-6 my-8 mx-auto">
          <div class="flex flex-row">
            <input maxlength="10" v-model.lazy="this.OrderDate"
              type="date"
              class="w-38 uppercase rounded border border-solid border-neutral-300/20 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-500 outline-none transition duration-300 ease-in-out focus:text-neutral-200 focus:shadow-te-primary focus:outline-none"
              aria-label="OrderDate"
            />
            <input
              type="number" v-model.lazy="this.OrderQuantity"
              class="w-24 ml-2 rounded border border-solid border-neutral-300/20 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-500 outline-none transition duration-300 ease-in-out focus:text-neutral-200 focus:shadow-te-primary focus:outline-none"
              placeholder="Qtde."
              aria-label="TotalOrderQuantity"
            />
            <input
              type="number" v-model.lazy="this.OrderTotalTax"
              class="w-28 ml-2 rounded border border-solid border-neutral-300/20 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-500 outline-none transition duration-300 ease-in-out focus:text-neutral-200 focus:shadow-te-primary focus:outline-none"
              placeholder="Taxa"
              aria-label="TotalOrderTax"
            />
            <button @click="OrderSearch()"
              class="flex items-center rounded ml-4 px-3 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out bg-blue-600 hover:bg-blue-500 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
              type="button">
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
          <button type="button" class="text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="NewOrderModalHandler()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd">
              </path>
            </svg>  
          </button>
        </div>
        <div class="flex flex-row jusfity-center items center col-start-3 col-end-7 h-12 mt-4">
            <div class="relative">
                <input v-model.lazy="NewTickerOrder" maxlength="7"  type="text" id="OrderTicker" class="uppercase block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderTicker" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Ticker</label>
            </div>
            <div class="relative ml-8">
                <input v-model="NewTickerOrderQuantity" type="number" id="OrderDescription" class="block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderDescription" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Quantidade</label>
            </div>
            <div class="relative ml-8">
                <input v-model="NewTickerOrderPrice" type="number" id="OrderDescription" class=" block py-2.5 px-0 text-sm text-stone-300 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="OrderDescription" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Preço</label>
            </div>
            <div class="relative ml-8 flex justify-center items-center">
              <button @click="AddNewOrder()" class=" bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 border-none rounded ml-4">
                Adicionar
              </button>
            </div>
        </div>
        <div class="col-start-2 col-end-8 row-start-3 row-end-6 bg-stone-900 rounded-lg overflow-y-auto scroll-smooth">
          <table class="w-full text-center table-auto rounded-t-lg border-separate" >
            <thead>
              <tr>
                <th class="p-1 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 ">~</th>
                <th class="p-1 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Ticker</th>
                <th class="p-1 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Quantidade</th>
                <th class="p-1 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >Preço</th>
                <th class="p-1 sticky top-0 border-solid border-2 border-zinc-600 bg-zinc-600 " >...</th>
              </tr>
            </thead>
            <tbody v-if="this.CurrentOrder !== undefined">
              <tr v-for="(TickerOrder, OrderIndex) in this.CurrentOrder.Data" :key="OrderIndex" class="shadow-md">
                <td  class="p-1 " > {{ OrderIndex + 1 }} </td>
                <td  class="p-1 " > {{ TickerOrder.TickerOrder }} </td>
                <td  class="p-1 " > {{ TickerOrder.TickerQuantity }} </td>
                <td  class="p-1 " > {{ TickerOrder.TickerPrice.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}) }} </td>
                <td  class="p-1 " >
                  <div>
                    <button @click="RemoveOrder(OrderIndex)" type="button" class="ml-2">
                      <svg width="32px" height="32px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.00024000000000000003">
                      <path d="M13.06 12L17.48 7.57996C17.5537 7.5113 17.6128 7.4285 17.6538 7.3365C17.6948 7.2445 17.7168 7.14518 17.7186 7.04448C17.7204 6.94378 17.7018 6.84375 17.6641 6.75036C17.6264 6.65697 17.5703 6.57214 17.499 6.50092C17.4278 6.4297 17.343 6.37356 17.2496 6.33584C17.1562 6.29811 17.0562 6.27959 16.9555 6.28137C16.8548 6.28314 16.7555 6.30519 16.6635 6.34618C16.5715 6.38717 16.4887 6.44627 16.42 6.51996L12 10.94L7.58 6.51996C7.43782 6.38748 7.24978 6.31535 7.05548 6.31878C6.86118 6.32221 6.67579 6.40092 6.53838 6.53834C6.40096 6.67575 6.32225 6.86113 6.31882 7.05544C6.3154 7.24974 6.38752 7.43778 6.52 7.57996L10.94 12L6.52 16.42C6.37955 16.5606 6.30066 16.7512 6.30066 16.95C6.30066 17.1487 6.37955 17.3393 6.52 17.48C6.66062 17.6204 6.85125 17.6993 7.05 17.6993C7.24875 17.6993 7.43937 17.6204 7.58 17.48L12 13.06L16.42 17.48C16.5606 17.6204 16.7512 17.6993 16.95 17.6993C17.1488 17.6993 17.3394 17.6204 17.48 17.48C17.6204 17.3393 17.6993 17.1487 17.6993 16.95C17.6993 16.7512 17.6204 16.5606 17.48 16.42L13.06 12Z" fill="#ffffff">
                      </path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex col-start-4 col-end-6 row-start-6 self-end justify-center mb-4">
          <button class="w-24 bg-transparent hover:bg-red-500 text-white font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" @click="NewOrderModalHandler()">
            Cancelar
          </button>
          <button @click="NewOrderSave()" class="w-24 bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 border-none rounded ml-4">
            Salvar
          </button>
        </div>
      </div>
    </div>

  </main>
</template>

<style scoped>

::-webkit-scrollbar {
  width: 7px;
}
::-webkit-scrollbar-track {
  background: #888; 
}
::-webkit-scrollbar-thumb {
  background: #242424; 
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(46, 46, 46); 
}
input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button {
    appearance: none;
  }

</style>
