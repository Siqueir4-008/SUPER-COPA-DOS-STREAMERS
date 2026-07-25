// ==============================
// SUPER COPA DOS STREAMERS
// SCRIPT PRINCIPAL
// ==============================


// CONTADOR

import {
    doc,
    updateDoc,
    increment,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
const dataEvento = new Date("2026-07-26 20:00:00").getTime();

function atualizarContador(){

    const agora = Date.now();
    const distancia = dataEvento - agora;

    if(distancia <= 0){
        return;
    }

    document.getElementById("dias").innerText =
    Math.floor(distancia / 86400000).toString().padStart(2,"0");

    document.getElementById("horas").innerText =
    Math.floor((distancia % 86400000) / 3600000).toString().padStart(2,"0");

    document.getElementById("minutos").innerText =
    Math.floor((distancia % 3600000) / 60000).toString().padStart(2,"0");

    document.getElementById("segundos").innerText =
    Math.floor((distancia % 60000) / 1000).toString().padStart(2,"0");

}

setInterval(atualizarContador,1000);
atualizarContador();



// ELENCO

function toggleElenco(id){

    const elemento = document.getElementById(id);

    if(!elemento) return;


    if(elemento.style.display === "block"){
        elemento.style.display = "none";
    }else{
        elemento.style.display = "block";
    }

}

window.toggleElenco = toggleElenco;


window.fecharAviso = fecharAviso;

let segundosRestantes = 6;

window.addEventListener("DOMContentLoaded", () => {

    const botao = document.getElementById("btn-entendi");

    if (!botao) return;

    botao.disabled = true;
    botao.innerText = `Aguarde (${segundosRestantes}s)...`;

    const intervalo = setInterval(() => {

        segundosRestantes--;

        if (segundosRestantes > 0) {

            botao.innerText = `Aguarde (${segundosRestantes}s)...`;

        } else {

            clearInterval(intervalo);

            botao.disabled = false;
            botao.innerText = "Entendi";

        }

    }, 1000);

});

function fecharAviso() {

    if (segundosRestantes > 0) return;

    const modal = document.getElementById("modal-aviso");

    if (modal) {
        modal.style.display = "none";
    }

}

window.fecharAviso = fecharAviso;

// FIREBASE VOTOS


let ultimoClique = 0;


async function votarTime(time) {

    const hoje = new Date().toISOString().split("T")[0];

    let controle = JSON.parse(localStorage.getItem("controleVotos")) || {
        data: hoje,
        quantidade: 0
    };

    

    // Se mudou o dia, reseta
    if (controle.data !== hoje) {
        controle = {
            data: hoje,
            quantidade: 0
        };
    }

    

    try {

        // CONTROLE DE VOTOS PELO FIREBASE

const idUsuario = localStorage.getItem("idUsuario") || crypto.randomUUID();

localStorage.setItem("idUsuario", idUsuario);

const controleRef = doc(window.db, "controle-votos", idUsuario);

const controleDoc = await getDoc(controleRef);

let dadosControle = {
    data: hoje,
    quantidade: 0
};

if (controleDoc.exists()) {
    dadosControle = controleDoc.data();

    if (dadosControle.data !== hoje) {
        dadosControle = {
            data: hoje,
            quantidade: 0
        };
    }
}


// LIMITE DE VOTOS
if (dadosControle.quantidade >= 15) {
    mostrarToast("⚠️ Você já usou seus 15 votos de hoje!");
    return;
}

        const votoRef=doc(window.db, "times",time);

        await updateDoc(votoRef, {
            votos: increment(1)
        });

        // Salva controle no navegador
        dadosControle.quantidade++;

await setDoc(controleRef, dadosControle);
        mostrarToast("🔥 Voto registrado!");

        carregarVotos();

    } catch (erro) {
    console.error(erro);
    alert(erro.message);
}
}



window.votarTime = votarTime;



// CARREGAR VOTOS


function carregarVotos(){

    import("https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js")
    .then(({collection, onSnapshot})=>{


        onSnapshot(
            collection(window.db,"times"),
            (lista)=>{


                lista.forEach((doc)=>{


                    const dados = doc.data();


                    const contador =
                    document.getElementById(
                    "votos-"+doc.id
                    );


                    if(contador){

                        contador.innerText =
                        dados.votos || 0;

                    }


                });


            }
        );


    });
    carregarRanking();

}


setTimeout(()=>{

if(window.db){

carregarVotos();

}

},2000);


// TOAST

function mostrarToast(mensagem){

    const toast = document.getElementById("toast-voto");

    if(!toast) return;

    toast.innerText = mensagem;

    toast.classList.add("mostrar");

    setTimeout(()=>{

        toast.classList.remove("mostrar");

    },2500);

}


async function carregarRanking() {

    const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js");

    const lista = await getDocs(collection(window.db, "times"));

    let ranking = [];

    lista.forEach((time) => {
        ranking.push({
            nome: time.id,
            votos: time.data().votos || 0
        });
    });

    ranking.sort((a, b) => b.votos - a.votos);

    const div = document.getElementById("ranking-lista");

    if (!div) return;

    div.innerHTML = "";

    ranking.forEach((time, index) => {

        const medalha =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            index === 2 ? "🥉" : `#${index + 1}`;

        div.innerHTML += `
            <div class="ranking-item">
                <strong>${medalha} ${time.nome}</strong>
                <span>${time.votos} votos</span>
            </div>
        `;
    });

}




    const cards = document.querySelectorAll(".time-card");


    cards.forEach(card=>{

        const conteudo = card.innerText.toLowerCase();


        let links = "";

        card.querySelectorAll("a").forEach(link=>{
            links += " " + link.href.toLowerCase();
        });


        if(
            conteudo.includes(texto) ||
            links.includes(texto)
        ){

            resultadosAtuais.push(card);


            const nome =
            card.querySelector("h3")?.innerText || "Resultado";


            const item = document.createElement("div");

            item.className="resultado-item";

            item.innerHTML =
            `<strong>${nome}</strong>`;


            item.onclick = ()=>abrirResultado(card);


            resultado.appendChild(item);

        }

    });


    resultado.style.display =
    resultadosAtuais.length ? "block" : "none";





function abrirResultado(card){


    resultado.style.display="none";

    pesquisa.value="";


    card.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });


    const elenco =
    card.querySelector(".elenco");


    if(elenco){
        elenco.style.display="block";
    }


    card.classList.add("pesquisa-destaque");


    setTimeout(()=>{

        card.classList.remove("pesquisa-destaque");

    },3000);

}

const pesquisa = document.getElementById("pesquisa");
const resultado = document.getElementById("resultado-pesquisa");
let resultadosAtuais = [];

function pesquisar(){

    const texto = pesquisa.value.toLowerCase();

    resultadosAtuais = [];
    resultado.innerHTML = "";

    document.querySelectorAll(".time-card").forEach(card=>{

        const conteudo = card.innerText.toLowerCase();

        if(conteudo.includes(texto)){

            resultadosAtuais.push(card);

            resultado.innerHTML += `
            <div class="resultado-item">
            ${card.querySelector("h3").innerText}
            </div>
            `;
        }

    });

    resultado.style.display =
    resultadosAtuais.length ? "block" : "none";
}

pesquisa.addEventListener("input", pesquisar);



pesquisa.addEventListener("keydown",(e)=>{


    if(e.key === "Enter"){

        e.preventDefault();


        if(resultadosAtuais.length){

            abrirResultado(resultadosAtuais[0]);

        }

    }


});
