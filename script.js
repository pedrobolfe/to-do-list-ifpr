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

////////////////////////// FAZER PUT E POST E DELET NO JSON - (JSON SERVER)

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
        } else {
            const errorText = await response.text();
            console.error('Erro ao atualizar a tarefa:', response.status, response.statusText, errorText);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function deletarTarefa(id) {
    try {
        const response = await fetch(`http://localhost:3000/tarefas/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log(`Tarefa com ID ${id} excluída com sucesso`);
        } else {
            const errorText = await response.text();
            console.error('Erro ao excluir a tarefa:', response.status, response.statusText, errorText);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

///////////////////////////////////
async function concluirTarefa(id) {
    let tarefa = dados.tarefas.find(tarefa => tarefa.id == id);
    
    if (!tarefa || tarefa.datafim || tarefa.concluido || tarefa.tempo.length <= 1) {
        return; 
    }

    tarefa.dataFim = new Date().toLocaleDateString('pt-BR');
    
    const tempoTarefaMili = Date.now() - tarefa.ultimoPlay; 
    
    tarefa.concluido = true;
    tarefa.tempo = tempoTarefaMili;

    await atualizarTarefa(id, tarefa); // Atualiza a tarefa no servidor
}

async function comecarTarefa(id){ // tempo atual em milisegundos
    console.log("comecando tarefa");
    let tarefa  = dados.tarefas.find(tarefa=> tarefa.id == id);

    if (tarefa.ultimoPlay !== null) { // se ja tiver começado, não alterar os valores
        return;
    }

    tarefa.dataIni =  new Date().toLocaleDateString('pt-BR');
    tarefa.ultimoPlay = Date.now(); // salva em milisegundos

    await atualizarTarefa(id, tarefa);
}

// evento de adicionar tarefar
async function criarTarefa(){
    const maiorId = Math.max(...dados.tarefas.map(tarefa => parseInt(tarefa.id)));
    const prioridade = document.getElementById("prioridade").value;
    const tarefa = document.getElementById("atividade").value;

    if(!prioridade || !tarefa){
        alert("Preencha todos os campos");
        return;
    }

    const novaTarefa = {
        id: ( maiorId+1).toString(), // tem que ser em string pq senao da pau
        prioridade: prioridade,
        nomeTarefa: tarefa,
        concluido: false,
        dataCreate: new Date().toLocaleDateString('pt-BR'),
        dataIni: "", // Data atual no formato dd/mm/yyyy
        dataFim: "",
        tempo: 0,
        ultimoPlay: null // começa em null
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
////////////////// modal

async function removerTarefa(id){
    console.log("remover ", id);
    
    await deletarTarefa(id);
}

function exibirModal(elemento, idTarefa, nomeTarefa) {
    const modalElement = document.getElementById('exampleModal'); // Referencia a div do modal existente

    // Adicionando conteúdo dentro da div do modal
    modalElement.innerHTML = `  <!-- Modal Dialog -->
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">Remover Tarefa ${idTarefa}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    Tem certeza que deseja remover a tarefa: <strong>${nomeTarefa}</strong>?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" onclick="removerTarefa(${idTarefa})">Confirmar</button>
                </div>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(modalElement);
    modal.show(); // Exibe o modal
}


////////////////////////// funcao para editar
async function salvarEdicao(botao, id){
    const row = botao.closest("tr");
    const nomeTarefa = row.cells[1].querySelector("input").value;
    const prioridade = row.cells[2].querySelector("select").value;

    let tarefa  = dados.tarefas.find(tarefa=> tarefa.id == id);
    tarefa.nomeTarefa = nomeTarefa;
    tarefa.prioridade = prioridade;
    // Recarrega a tabela para exibir os valores atualizados
    await atualizarTarefa(tarefa.id, tarefa);
}

function habilitarEdicao(botao, id) {
    // Encontra a linha correspondente
    const row = botao.closest("tr");

    // Obtém os dados do prato para preencher os inputs
    const tarefa = dados.tarefas.find(tarefa => tarefa.id == id);

    if (tarefa) {
        // Converte as células para inputs editáveis
        row.innerHTML = `
            <td>${tarefa.id}</td>
            <td><input type="text" value="${tarefa.nomeTarefa}"></td>
            <td>
                <select class="" id="prioridade">
                    <option value="alta">Selecione a prioridade</option>
                    <option value="Alta" style="background-color: red;">Alta</option>
                    <option value="Media" class="bg-warning">Média</option>
                    <option value="Baixa" class="bg-success">Baixa</option>
                </select>
            </td>
            <td><i class="fa fa-save" onclick="salvarEdicao(this, ${tarefa.id})"></i></td>
            <td>
                <i class="bi bi-trash" 
                    onclick="exibirModal(this, ${tarefa.id}, '${tarefa.nomeTarefa}')"
                    style="cursor: pointer;">
                </i>
            </td>
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
    } else if (tarefa.ultimoPlay != null){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Alta</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}">
            <i class="bi bi-trash" 
                onclick="exibirModal(this, ${tarefa.id}, '${tarefa.nomeTarefa}')">
            </i>
        </td>   
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
    } else if (tarefa.ultimoPlay != null){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Media</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}">
            <i class="bi bi-trash" 
                onclick="exibirModal(this, ${tarefa.id}, '${tarefa.nomeTarefa}')">
            </i>
        </td> 
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
    } else if (tarefa.ultimoPlay != null){
        classe = 'em-execucao';
    } else {
        classe = 'pendente';
    }

    novaLinha.innerHTML = `
        <td class="${classe}">${tarefa.id}</td>
        <td class="${classe}">${tarefa.nomeTarefa}</td>
        <td class="${classe}">Baixa</td>
        <td class="${classe}"><i class="fa fa-edit" onclick="habilitarEdicao(this, ${tarefa.id})"></i></td>
        <td class="${classe}">
            <i class="bi bi-trash" 
                onclick="exibirModal(this, ${tarefa.id}, '${tarefa.nomeTarefa}')">
            </i>
        </td> 
        <td class="${classe}"><i class="fa fa-play" onclick="comecarTarefa(${tarefa.id})"></i></td>
        <td class="${classe}"><i class="fas fa-check-circle" onclick="concluirTarefa(${tarefa.id})"></i></td>
    `;

    containerBaixas.appendChild(novaLinha);
}
