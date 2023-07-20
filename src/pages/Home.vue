<script setup>
import { computed, ref } from "vue";
import StockApi from "../api/stockApi";
import Header from "../components/Header.vue";

const stocksData = ref([])  // for caching response object
const haveSelectCheckBox = computed(() => {
    const checkBoxstatus = stocksData.value.filter(ele => ele.checkBoxStatus === true)
    return !!checkBoxstatus.length
})

// input
const stock = ref('')
const stockSymbolArray = ref([])
const stockTemp = ref([])
const addStockDialogVisible = ref(false)
const tableHeaderArray = ref(["股價", "漲跌", "漲跌幅(%)", "委買價", "委賣價", "開盤", "昨收", "最高", "最低", "成交量(張)", "更新時間"])
const alertString = ref('')
const headerCheckBoxStatus = ref(false)


// temp add to stockSymbolArray & call api
const submitstockSymbolArray = async () => {
    const result = stockTemp.value.map((element => element.stockSymbol))
    stockSymbolArray.value = stockSymbolArray.value.concat(result)
    stockTemp.value = []

    const resData = await Promise.all(
        stockSymbolArray.value.map((element) => StockApi.getStocks(element))
    )
    headerCheckBoxStatus.value = false
    resData.checkBoxStatus = false
    stocksData.value = resData
    resTemp.length = 0
}

// 上方刪除按鈕 判斷stocksData checkBoxStatus
const removeStock = () => {
    let t = stocksData.value.filter(ele => ele.checkBoxStatus !== true)
    console.log(11, t)
    stocksData.value = t
    headerCheckBoxStatus.value = false
    stockSymbolArray.value = t.map(ele => ele.stockCode)
}

const resTemp = []
const addStockToTemp = async () => {
    let res
    const regexIsNumber = /\d/g

    if (!stock.value) return

    if (stockIsExist()) {
        alertString.value = 'Stock is exist!'
        stock.value = ""
        return
    }

    if (regexIsNumber.test(stock.value)) { // 判斷為輸入為 stockSymbol
        res = await StockApi.getOneBystockSymbol(stock.value.toUpperCase())
        stock.value = res.stockSymbol
    } else { // 判斷為輸入為 stockName
        res = await StockApi.getOneBystockName(stock.value)
        stock.value = res.stockSymbol
    }

    if (!stock.value) {
        alertString.value = 'No stock data!'
        stock.value = ""
        return
    }

    resTemp.push(res.stockSymbol)
    stockTemp.value.push(res)
    stock.value = ''
    alertString.value = ''


    function stockIsExist() {
        return stockSymbolArray.value.includes(stock.value) || resTemp.includes(stock.value)
    }
}

const removeFromTemp = (stock) => {
    resTemp.splice(resTemp.indexOf(stock), 1)
    stockTemp.value.splice(stockTemp.value.indexOf(stock), 1)
}

const removeStockTemp = async () => {
    stockTemp.value = []
    await addStockToTemp()
}

// if not all checkBoxStatus is truw, toggle all checkBoxStatus to true
// if all checkBoxStatus is true, toggle all checkBoxStatus to false
const toggleHeaderCheckBox = () => {
    const checkBoxstatus = stocksData.value.filter(ele => ele.checkBoxStatus === true)
    if (checkBoxstatus.length === stocksData.value.length) {
        headerCheckBoxStatus.value = false
        stocksData.value.forEach(ele => {
            ele.checkBoxStatus = false
        })
    } else {
        headerCheckBoxStatus.value = true
        stocksData.value.forEach(ele => {
            ele.checkBoxStatus = true
        })
    }
}

const toggleCheckBox = (stock) => {
    stock.checkBoxStatus = !stock.checkBoxStatus
}
</script>

<template>
    <Header />
    <main>
        <div class="stockPicking w1260">
            <button class="btn" @click="addStockDialogVisible = true, alertString = ''">新增選股</button>
            <button v-if="haveSelectCheckBox" class="btn" @click="removeStock()">刪除股票</button>
            <button class="btn" @click="submitstockSymbolArray()">刷新</button>

            <div class="table">
                <div class="tableHeader">
                    <div class="tableSymbol">
                        <div class="checkBox">
                            <span class="checkBox" @click="toggleHeaderCheckBox()">
                                <svg v-if="headerCheckBoxStatus" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                    <path
                                        d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                    <path
                                        d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z" />
                                </svg>
                            </span>
                        </div>
                        <p>股名/股號</p>
                    </div>
                    <div class="tableCell" v-for="item in tableHeaderArray">
                        {{ item }}
                    </div>
                </div>
                <ul class="tableBody">
                    <li class="tableRow" v-for="item in stocksData">
                        <div class="tableSymbol">
                            <div class="checkBox">
                                <span class="checkBox" @click="toggleCheckBox(item)">
                                    <svg v-if="item.checkBoxStatus" xmlns="http://www.w3.org/2000/svg" width="20"
                                        height="20"
                                        viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                        <path
                                            d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                        viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                        <path
                                            d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z" />
                                    </svg>
                                </span>
                            </div>
                            {{ item.stockName }}
                        </div>
                        <div class="tableCell" v-for="col in item.info">
                            {{ col }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </main>


    <Transition name="bounce">
        <div class="addStockDialogContainer" v-if="addStockDialogVisible">
            <div class="overlay" @click="addStockDialogVisible = false, submitstockSymbolArray(), removeStockTemp()"></div>

            <div class="addStockDialog">
                <h3>新增股票</h3>
                <div class="alertString" v-if="alertString">{{ alertString }}</div>
                <div class="inputWrapper">
                    <div class="svg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5F6368">
                            <path
                                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                    </div>
                    <input class="input" type="text" placeholder="請輸入股票代碼 + <Enter>" v-model="stock"
                        @keyup.enter="addStockToTemp()" @click="alertString = ''">
                </div>
                <ul style="width: 80%;">
                    <li class="li" v-for="{ stockName, stockSymbol } in stockTemp">
                        <div>
                            <p>{{ stockName }}</p>
                            <p style="color: #979ba7">{{ stockSymbol }}.TW</p>
                        </div>
                        <div>
                            <svg class="star" viewBox="0 0 24 24" @click="removeFromTemp(stock)">
                                <path
                                    d="M22.954 8.952c-.126-.39-.49-.652-.9-.652H15.06L12.9 1.652C12.772 1.262 12.41 1 12 1s-.772.263-.898.652L8.94 8.3H1.945c-.41 0-.772.263-.898.652-.127.39.012.815.343 1.056l5.66 4.108-2.163 6.648c-.126.39.012.815.344 1.055.332.24.78.24 1.112 0L12 17.71l5.66 4.11c.165.12.36.18.555.18.194 0 .39-.06.555-.18.33-.24.47-.667.343-1.056l-2.16-6.648 5.658-4.108c.332-.24.47-.667.344-1.056z">
                                </path>
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </Transition>
</template>

<style>
* {
    margin: 0;
    padding: 0;
}

svg.star {
    width: 22px;
    height: 22px;
    fill: yellow;
    stroke: black;
    stroke-width: 1;
}

.overlay {
    z-index: 0;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, .5);
    overflow-y: auto;
}

.addStockDialog {
    display: flex;
    flex-direction: column;
    z-index: 1;
    position: absolute;
    background-color: blanchedalmond;
    width: 350px;
    min-height: 50%;
    top: 10%;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 20px;
    padding: 20px 30px;
    align-items: center;
}

.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.25);
    }

    100% {
        transform: scale(1);
    }
}

.inputWrapper {
    margin-top: 5px;
    height: 40px;
    width: 97%;
    background-color: white;
    border: 1px solid #e0e4e9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 5px;

}

.input {
    margin-left: 5px;
    width: 90%;
    height: 100%;
    border: none;
    font-size: 24px;
}

.input:focus {
    outline: none;
}

.alertString {
    color: red;
    font-weight: bold;
}

.li {
    font-size: 20px;
    list-style: none;
    margin: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.btn {
    background-color: lightblue;
    margin: 10px;
    font-size: 14px;
    padding: 10px 28px;
    border-radius: 4px;
}

.btn:hover {
    color: white;
    background-color: blueviolet;
}

.diologBtn {
    background-color: lightgreen;
    width: 50px;
    height: 36px;
    border-radius: 4px;
}

.diologBtn:hover {
    color: white;
    background-color: goldenrod;
}



.title {
    padding: 20px;
    height: auto;
    display: flex;
    align-content: center;
    flex-direction: row;
    align-items: center;
}

.stockPicking {
    height: 100%;
    margin-bottom: 32px;
    margin-left: auto;
    margin-right: auto;
}

.w1260 {
    width: 1260px;
}

.table {
    margin-bottom: 30px;
}

.tableHeader {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    background-color: aqua;
}

.tableRow {
    background-color: beige;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

.tableBody :hover {
    background-color: bisque;
}

.tableSymbol {
    width: 150px;
    display: flex;
    flex-direction: row;
    padding: 15px 10px;
}

div .checkBox {
    margin-right: 5px;
}

.tableCell {
    width: 8.3%;
    text-align: center;
    padding: 15px 0px;
}
</style>
