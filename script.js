
let dados = [];

// carregar dados
async function carregarJson() {
    return fetch('./data.json')
        .then(resposta => resposta.json())
        .catch(erro => console.error('Erro ao carregar JSON:', erro));
}
async function carregarDados() {
    try {
        dados = await carregarJson();
        console.log('Dados carregados:', dados);

        // Agora você pode processar os dados carregados aqui
        for (let tarefa of dados.tarefas) {
            if (tarefa.prioridade === "Alta") {
                addInPrioridadeAlta(tarefa);
            } else if (tarefa.prioridade === "Media") {
                addInPrioridadeMedia(tarefa);
            } else {
                addInPrioridadeBaixa(tarefa);
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar os dados:', erro);
    }
}

carregarDados();

////////////////////////// FAZER PUT E POST NO JSON - (JSON SERVER)

async function criarNovaTarefaJson(novaTarefa){
    await fetch('http://localhost:3000/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaTarefa)
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Erro:', error));
}

async function atualizarTarefa(id, tarefaAtualizada) {
    try {
        const response = await fetch(`http://localhost:3000/tarefas/${id}`, {
            method: 'PUT', // Método PUT para atualizar
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarefaAtualizada) 
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Tarefa atualizada com sucesso:', data);
        } else {
            const errorText = await response.text();
            console.error('Erro ao atualizar a tarefa:', response.status, response.statusText, errorText);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function concluirTarefa(id) {
    console.log('Função concluirTarefa chamada com id:', id); // Verifica se a função está sendo chamada
    
    let tarefa = dados.tarefas.find(tarefa => tarefa.id == id);
    
    if (!tarefa) {
        console.log('Tarefa não encontrada');
        return; // Adiciona uma verificação para evitar erros caso a tarefa não seja encontrada
    }

    tarefa.dataFim = new Date().toLocaleDateString('pt-BR');
    
    const tempoTarefaMili = Date.now() - tarefa.ultimoPlay; 
    
    tarefa.concluido = true;
    tarefa.tempo = tempoTarefaMili;

    console.log('Tarefa após atualização:', tarefa); // Verifica se a tarefa foi atualizada corretamente
    
    await atualizarTarefa(id, tarefa); // Atualiza a tarefa no servidor
}

async function comecarTarefa(id){ // tempo atual em milisegundos
    console.log('btn de começar clicado')
    let tarefa  = dados.tarefas.find(tarefa=> tarefa.id == id);

    if (tarefa.dataIni && tarefa.ultimoPlay) { // se ja tiver começado, não alterar os valores
        return;
    }

    tarefa.dataIni =  new Date().toLocaleDateString('pt-BR');
    tarefa.ultimoPlay = Date.now(); // salva em milisegundos

    await atualizarTarefa(id, tarefa);
}


// evento de adicionar tarefar
async function criarTarefa(){
    const prioridade = document.getElementById("prioridade").value;
    const tarefa = document.getElementById("atividade").value;

    if(!prioridade || !tarefa){
        alert("Preencha todos os campos");
        return;
    }

    const novaTarefa = {
        id: (dados.tarefas.length + 1), // ID único com base no tempo atual
        prioridade: prioridade,
        nomeTarefa: tarefa,
        concluido: false,
        dataCreate: new Date().toLocaleDateString('pt-BR'),
        dataIni: "", // Data atual no formato dd/mm/yyyy
        dataFim: "",
        tempo: 0,
        ultimoPlay: 0
    };

    dados.tarefas.push(novaTarefa)

    if (prioridade === "Alta") {
        addInPrioridadeAlta(novaTarefa);
    } else if (prioridade === "Media") {
        addInPrioridadeMedia(novaTarefa);
    } else {
        addInPrioridadeBaixa(novaTarefa);
    }

    criarNovaTarefaJson(novaTarefa);
}

////////////////////////// funcao para editar
async function salvarEdicao(botao, id){
    const row = botao.closest("tr");
    console.log(row, id);
    const nomeTarefa = row.cells[1].querySelector("input").value;
    console.log(nomeTarefa)
    let tarefa  = dados.tarefas.find(tarefa=> tarefa.id == id);
    tarefa.nomeTarefa = nomeTarefa;

    // Recarrega a tabela para exibir os valores atualizados
    console.log(tarefa);

    await atualizarTarefa(tarefa.id, tarefa);
}

function habilitarEdicao(botao, id) {
    // Encontra a linha correspondente
    const row = botao.closest("tr");
    console.log(botao, id)

    // Obtém os dados do prato para preencher os inputs
    const tarefa = dados.tarefas.find(tarefa => tarefa.id == id);

    if (tarefa) {
        // Converte as células para inputs editáveis
        row.innerHTML = `
            <td>${tarefa.id}</td>
            <td><input type="text" value="${tarefa.nomeTarefa}"></td>
            <td>Alta</td>
            <td><i class="fa fa-save" onclick="salvarEdicao(this, ${tarefa.id})"></i></td>
            <td><i class="fa fa-play" onclick="comecarTarefa(${tarefa.id})"></i></td>
            <td><i class="fas fa-check-circle" onclick="concluirTarefa(${tarefa.id})"></i></td>
        `;
    }
}

////////////////// EXIBIR TAREFAS

function addInPrioridadeAlta(tarefa) {
    const containerAltas = document.getElementById('list-alta');
    const novaLinha = document.createElement('tr');
    novaLinha.classList.add('list-alta');

    let classe = ""; //classe adicional 
    if (tarefa.concluido){
        classe = 'concluida';
        novaLinha.classList.remove('em-execucao');
    } else if (!tarefa.concluido && tarefa.ultimoPlay > 0){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Alta</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fa fa-play" onclick="comecarTarefa(${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fas fa-check-circle" onclick="concluirTarefa(${tarefa.id})"></i></td>
    `;

    containerAltas.appendChild(novaLinha);
}
// Função para adicionar tarefa de média prioridade
function addInPrioridadeMedia(tarefa) {
    const containerMedias = document.getElementById('list-media');
    const novaLinha = document.createElement('tr');
    novaLinha.classList.add('list-media');

    let classe = ""; //classe adicional 
    if (tarefa.concluido){
        classe = 'concluida';
        novaLinha.classList.remove('em-execucao');
    } else if (!tarefa.concluido && tarefa.ultimoPlay > 0){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Alta</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fa fa-play" onclick="comecarTarefa(${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fas fa-check-circle" onclick="concluirTarefa(${tarefa.id})"></i></td>
    `;

    containerMedias.appendChild(novaLinha);
}

// Função para adicionar tarefa de baixa prioridade
function addInPrioridadeBaixa(tarefa) {
    const containerBaixas = document.getElementById('list-baixa');
    const novaLinha = document.createElement('tr');
    novaLinha.classList.add('list-baixa');

    let classe = ""; //classe adicional 
    if (tarefa.concluido){
        classe = 'concluida';
        novaLinha.classList.remove('em-execucao');
    } else if (!tarefa.concluido && tarefa.ultimoPlay > 0){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Alta</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fa fa-play" onclick="comecarTarefa(${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fas fa-check-circle" onclick="concluirTarefa(${tarefa.id})"></i></td>
    `;

    containerBaixas.appendChild(novaLinha);
}



///////////////////// METODOS PARA OS BOTOES DE EDITAR, COMECAR E CONCLUIR


//adicionar a tarefa no arquiivo json
function salvarDadosAtualizados() {
    fetch('./data.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
        .then(response => {
            if (response.ok) {
                console.log('Dados salvos com sucesso!');
            } else {
                console.error('Erro ao salvar os dados.');
            }
        })
        .catch(erro => console.error('Erro na comunicação com o servidor:', erro));
}