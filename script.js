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

const controleRef = doc(window.db, "controle-votos", "contador");

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


