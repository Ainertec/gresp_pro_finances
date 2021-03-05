// --------------------------------------------- Classe Relatorio -----------------------------------------------------

//variaveis globais
let PORCENTAGEMGLOBAL = 100;
let TODASASORDERS = [];
let TODASASINFORMACOES = {};
let ORDERSSELECIONADOS = [];


//function adicionar ou remover item selecionado
function adicionarRemoverItemSelecionado(adicionar,identificador){
    console.log(adicionar,identificador)
    adicionar? ORDERSSELECIONADOS.push({_id:identificador,dispesas:[]}):removerOrdemSelecionado(identificador)

    function removerOrdemSelecionado (identificador){
        let aux =[];
        for (const iterator of ORDERSSELECIONADOS) {
            iterator._id!=identificador? aux.push(iterator):null
        }
        ORDERSSELECIONADOS=aux;
    }

    for (const iterator of ORDERSSELECIONADOS) {
        console.log(iterator)
    }
}

//funcao responsavel por adicionar uma dispesa ao pedido
function adicionarDispesaAoPedido(identificador,value){
    const valorDividido = value/ORDERSSELECIONADOS.length;

    for (const iterator of ORDERSSELECIONADOS) {
        iterator.dispesas.push({identification:identificador, value:valorDividido});
    }

    for (const iterator of ORDERSSELECIONADOS) {
        console.log(iterator);
    }
    exibirDispesas();
}

//funcao responsavel por exibir as dispesas
function exibirDispesas(){
    for (const iterator of ORDERSSELECIONADOS) {
        let codigoHTML = ``
        for (const iterator2 of iterator.dispesas) {
            codigoHTML+=`<p style="color:'#fff'">${iterator2.identification} - ${iterator2.value}</p>`
        }
        document.getElementById(`adddespesas${iterator._id}`).innerHTML = codigoHTML;
    }
}


//funcao responsavel por fazer a ligação necessaria com a tela de relatorio de caixa
function ligacaoRelatorioCaixaFacede() {
    const situacao = autenticacaoLogin()

    if (JSON.parse(situacao).tipo == 'Administrador') {
        telaRelatorioDeCaixa();
    } else {
        mensagemDeErro('Usuário não autorizado!')
    }
}

//funcao responsavel por chamar os metodos da classe relatorio
function chamadaDeMetodosRelatorio() {
    setTimeout(function () {
        tabelaDeRelatorioCaixa();
        tabelaGeralDeRelatorios();
    }, 300)
}

//funcao para gerar tabela com todos os pedidos registrados no caixa
async function tabelaDeRelatorioCaixa() {
    let codigoHTML = ``, json = null;

    try {
        await aguardeCarregamento(true)
        json = await requisicaoGET(`reports/orders?initial=${document.getElementById('dataInicial').value}&final=${document.getElementById('dataFinal').value}`, { headers: { Authorization: `Bearer ${buscarSessionUser().token}` } });
        await aguardeCarregamento(false)
        TODASASORDERS = json.data;

        codigoHTML += `<h5>Lista de Pedidos Fechados no Período</h5>
            <table class="table table-dark table-bordered text-center">
                <thead class="thead-dark">
                    <tr>
                        <td scope="col"><small>Data e hora</small></td>
                        <td scope="col"><small>Identificação</small></td>
                        <td scope="col"><small>Lista itens</small></td>
                        <td scope="col"><small>Forma pagamento</small></td>
                        <td scope="col"><small>Custo</small></td>
                        <td scope="col"><small>Taxa Cartão</small></td>
                        <td scope="col"><small>serviço/gorjeta</small></td>
                        <td scope="col"><small>Valor</small></td>
                        <td scope="col"><small>#</small></td>
                    </tr>
                </thead>
                <tbody>`

        for (let item of json.data) {
            codigoHTML += `<tr class="table-light text-dark">
                <td scope="col"><small><strong>${format(parseISO(item.order.updatedAt), 'dd/MM/yyyy HH:mm:ss')}</strong></small></td>
                <td scope="col"><small><strong>${item.order.identification}</strong></small></td>
                <td scope="col"><small>`
            for (let item2 of item.order.items) {
                codigoHTML += `(<strong>${item2.product.name}</strong> X ${item2.quantity}${item2.courtesy ? ' - <strong class="text-primary">Cortesia</strong>' : ''})`;
            }
            codigoHTML += `</small></td>
                    <td scope="col"><small><strong>${item.order.payment}</strong></small></td>
                    <td scope="col" class="text-danger"><small><strong>R$${(item.costTotal).toFixed(2)}</strong></small></td>
                    <td scope="col" class="text-danger"><small><strong>R$${item.order.cardfee? (item.order.cardfee).toFixed(2):'0.00'}</strong></small></td>
                    <td scope="col" class="text-danger"><small><strong>R$${item.order.tip? (item.order.tip).toFixed(2):'0.00'}</strong></small></td>
                    <td scope="col" class="text-danger"><small><strong>R$${(item.order.total).toFixed(2)}</strong></small></td>
                    <td scope="col">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" onclick="adicionarRemoverItemSelecionado(this.checked,'${item.order._id}')" class="custom-control-input custom-switch" id="selecionarOrder${item.order._id}">
                            <label class="custom-control-label" for="selecionarOrder${item.order._id}"></label>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="8">
                        <div id="adddespesas${item.order._id}"></div>
                    </td>
                </tr>`
        }
        codigoHTML += `</tbody>
            </table>`

        document.getElementById('listaItens').innerHTML = codigoHTML;

    } catch (error) {

        document.getElementById('listaItens').innerHTML = 'Não foi possivel carregar a lista!' + error
    }
}

//funcao para gerar tabela com todos os pedidos registrados no caixa
async function tabelaGeralDeRelatorios() {
    let codigoHTML = ``;

    try {
        await aguardeCarregamento(true)
        let json = await requisicaoGET(`reports?initial=${document.getElementById('dataInicial').value}&final=${document.getElementById('dataFinal').value}`, { headers: { Authorization: `Bearer ${buscarSessionUser().token}` } });
        let json2 = await requisicaoGET(`reports/coststock`, { headers: { Authorization: `Bearer ${buscarSessionUser().token}` } });
        await aguardeCarregamento(false)
        TODASASINFORMACOES = json.data;

        codigoHTML += `<h5>Informações gerais</h5>

        <div class="card-group">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Valor recebido bruto(Período)</h6>
                            <h3 style="color:green">R$${json.data.total}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Receitas menos custos(Período)</h6>
                            <h3 style="color:green">R$${json.data.netValue}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Gastos com cortesia(Período)</h6>
                            <h3 style="color:red">R$${json.data.totalCourtesy}</h3>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taxas de cartão(Período)</h6>
                            <h3 style="color:red">R$${json.data.totalCardFee}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taxas de serviço/gorjeta(Período)</h6>
                            <h3 style="color:green">R$${json.data.totalTip}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Custos com pedidos(Período)</h6>
                            <h3 style="color:red">R$${json.data.totalCost}</h3>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Valor total em estoque(Total)</h6>
                            <h3 style="color:red">R$${(json2.data).toFixed(2)}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Lucro Geral(Período)</h6>
                            <h3 style="color:orange">R$${json.data.netValue}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>`

        document.getElementById('listaDadosGerais').innerHTML = codigoHTML;

    } catch (error) {

        document.getElementById('listaDadosGerais').innerHTML = 'Não foi possivel carregar a lista!' + error
    }
}