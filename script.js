// ==============================
// SUPER COPA DOS STREAMERS
// SCRIPT PRINCIPAL
// ==============================

import {
    doc,
    updateDoc,
    increment,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// CONTADOR REGRESSIVO DO EVENTO
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

setInterval(atualizarContador, 1000);
atualizarContador();


// MOSTRAR/OCULTAR ELENCO DO TIME
function toggleElenco(id){
    const elemento = document.getElementById(id);
    if(!elemento) return;

    if(elemento.style.display === "block"){
        elemento.style.display = "none";
    } else {
        elemento.style.display = "block";
    }
}
window.toggleElenco = toggleElenco;


// TEMPO MÍNIMO DE LEITURA DO AVISO
let tempoMinimo = 9;

function iniciarContadorAviso() {
    const btn = document.getElementById("btn-entendi");
    const contadorSpan = document.getElementById("tempo-restante");

    if (!btn || !contadorSpan) return;

    const intervalo = setInterval(() => {
        tempoMinimo--;
        if (tempoMinimo > 0) {
            contadorSpan.innerText = tempoMinimo;
        } else {
            clearInterval(intervalo);
            btn.disabled = false;
            btn.innerText = "Entendi";
        }
    }, 1000);
}

// FECHAR MODAL DE AVISO
function fecharAviso(){
    const modal = document.getElementById("modal-aviso");
    if(modal){
        modal.style.display = "none";
    }
}
window.fecharAviso = fecharAviso;

// Inicia o contador assim que o DOM carregar
document.addEventListener("DOMContentLoaded", iniciarContadorAviso);


// FIREBASE VOTOS
async function votarTime(time) {
    const hoje = new Date().toISOString().split("T")[0];

    try {
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

        const votoRef = doc(window.db, "times", time);

        await updateDoc(votoRef, {
            votos: increment(1)
        });

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
    .then(({collection, onSnapshot}) => {
        onSnapshot(
            collection(window.db, "times"),
            (lista) => {
                lista.forEach((doc) => {
                    const dados = doc.data();
                    const contador = document.getElementById("votos-" + doc.id);

                    if(contador){
                        contador.innerText = dados.votos || 0;
                    }
                });
            }
        );
    });

    carregarRanking();
}

setTimeout(() => {
    if(window.db){
        carregarVotos();
    }
}, 2000);


// TOAST DE NOTIFICAÇÃO
function mostrarToast(mensagem){
    const toast = document.getElementById("toast-voto");
    if(!toast) return;

    toast.innerText = mensagem;
    toast.classList.add("mostrar");

    setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2500);
}


// CARREGAR RANKING DE TORCIDAS
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
