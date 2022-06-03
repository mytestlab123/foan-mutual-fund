Moralis.initialize("flqVyfiGHp0ZnP98praWONi2AStnRLDX1jOlLNc3"); // Application id from moralis.io
Moralis.serverURL = "https://prylzpawi05g.usemoralis.com:2053/server"

let currentTrade = {};
let currentSelectSide;
let tokens;
let myObj;
let MATIC = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
let USDC  = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
let USDT  = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
let DAI   = '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'

const fund = new Map([
    ['FTM','0xb85517b87bf64942adf3a0b9e4c71e4bc5caa4e5'],
    ['ONE','0x80c0cbdb8d0b190238795d376f0bd57fd40525f2']
  ]);
async function init(){
    await Moralis.initPlugins();
    // await Moralis.enable();
    await Moralis.enableWeb3();
    await listAvailableTokens();
    // await setMatic();
    currentUser = Moralis.User.current();
    if(currentUser){
        document.getElementById("swap_button").disabled = false;
    }
}

async function listAvailableTokens(){
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
      });
    tokens = result.tokens;
    let parent = document.getElementById("token_list");
    for( const address in tokens){
        if (address == MATIC || address == USDC ) {
            let token = tokens[address];
            console.log ("Successful ✅");
            // console.log (address);
            document.getElementById("test").innerHTML = address;
            let div = document.createElement("div");
            div.setAttribute("data-address", address)
            div.className = "token_row";
            let html = `
            <img class="token_list_img" src="${token.logoURI}">
            <span class="token_list_text">${token.symbol}</span>
            `
            div.innerHTML = html;
            div.onclick = (() => {selectToken(address)});
            parent.appendChild(div);
        }
    }
}


async function setMatic(){
    // {symbol: 'MATIC', name: 'MATIC', decimals: 18, address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', logoURI: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'}
    // const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    //     chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
    //   });
    // tokens = result.tokens;
    let parent = document.getElementById("token_list");
    // for( const address in tokens){
        let token = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        let div = document.createElement("div");
        div.setAttribute("data-address", address)
        div.className = "token_row";
        let html = `
        <img class="token_list_img" src="https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png">
        <span class="token_list_text">MATIC</span>
        `
        div.innerHTML = html;
        div.onclick = (() => {selectToken(address)});
        parent.appendChild(div);
    // }

}

function selectToken(address){
    closeModal();
    // console.log(tokens);
    currentTrade[currentSelectSide] = tokens[address];
    myObj = {"currentTrade": currentTrade};
    console.log(myObj);
    // console.log(currentTrade[currentSelectSide]);
    // console.log("currentTrade:" currentTrade);
    renderInterface();
    getQuote();
}

function renderInterface(){
    if(currentTrade.from){
        document.getElementById("from_token_img").src = currentTrade.from.logoURI;
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }
    if(currentTrade.to){
        document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}


async function login() {
    try {
        currentUser = Moralis.User.current();
        if(!currentUser){
            currentUser = await Moralis.Web3.authenticate();
        }
        document.getElementById("swap_button").disabled = false;
    } catch (error) {
        console.log(error);
    }
}

function openModal(side){
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}
function closeModal(){
    document.getElementById("token_modal").style.display = "none";
}

async function getQuote(){
    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    
    let amount = Number( 
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    )

    const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
    })
    console.log(quote);
    document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
    document.getElementById("to_amount").value = quote.toTokenAmount / (10**quote.toToken.decimals)
}

async function trySwap(){
    let address = Moralis.User.current().get("ethAddress");
    let amount = Number( 
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    )
    // if(currentTrade.from.symbol !== "ETH"){
    if(currentTrade.from.symbol !== "MATIC"){
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currentTrade.from.address, // The token you want to swap
            fromAddress: address, // Your wallet address
            amount: amount,
        })
        console.log(allowance);
        if(!allowance){
            await Moralis.Plugins.oneInch.approve({
                chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
                tokenAddress: currentTrade.from.address, // The token you want to swap
                fromAddress: address, // Your wallet address
              });
        }
    }
    try {
        // alert(JSON.stringify(receipt1));
        let receipt1 = await doSwap1(address, amount, "0xb85517b87bf64942adf3a0b9e4c71e4bc5caa4e5");
        alert('FTM,0xb85517b87bf64942adf3a0b9e4c71e4bc5caa4e5');

        let receipt2 = await doSwap1(address, amount, "0x80c0cbdb8d0b190238795d376f0bd57fd40525f2");
        alert('ONE,0x80c0cbdb8d0b190238795d376f0bd57fd40525f2');

        let receipt3 = await doSwap1(address, amount, "0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b");
        alert('ATOM,0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b');

        let receipt4 = await doSwap1(address, amount, "0x72bd80445b0db58ebe3e8db056529d4c5faf6f2f");
        alert("NEAR,0x72bd80445b0db58ebe3e8db056529d4c5faf6f2f");

        alert("Investment is completed.");
    
    } catch (error) {
        console.log(error);
    }

}

async function doSwap1(userAddress, amount, toaddress){
    return Moralis.Plugins.oneInch.swap({
        chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // The token you want to swap
        toTokenAddress: toaddress, // The token you want to receive
        amount: amount,
        fromAddress: userAddress, // Your wallet address
        slippage: 1,
      });
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
}

init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_token_select").onclick = (() => {openModal("from")});
// document.getElementById("to_token_select").onclick = (() => {openModal("to")});
document.getElementById("login_button").onclick = login;
// document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;
document.getElementById("btn-logout").onclick = logOut;
