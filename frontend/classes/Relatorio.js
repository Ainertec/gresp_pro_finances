// --------------------------------------------- Classe Relatorio -----------------------------------------------------

//variaveis globais
let PORCENTAGEMGLOBAL = 100;
let TODASASORDERS = [];
let TODASASINFORMACOES = {};
let ORDERSSELECIONADOS = [];

//funcao responsavel por fazer a ligação necessaria com a tela de relatorio de caixa
function ligacaoRelatorioCaixaFacede() {
    const situacao = autenticacaoLogin()

    if (JSON.parse(situacao).tipo == 'Administrador') {
        chamadaDeMetodosRelatorio();
    } else {
        mensagemDeErro('Usuário não autorizado!')
    }
}

//funcao responsavel por selecionar todos os pedidos para adicionar dispesa
function adicionarDispesaTodososPedidos(adicionar){
    for (const iterator of TODASASORDERS) {
        document.getElementById(`selecionarOrder${iterator.order._id}`).checked = adicionar;
    }

    for (const iterator of TODASASORDERS) {
        adicionarRemoverItemSelecionado(adicionar, iterator.order._id,0);
    }
}

//funcao responsavel por gerar o modal de porcetagem de peso sobre dispesa
function modalPorcentagemPesoDispesa(identificador){
    let codigoHTML=`<div class="modal" id="modalPorcentagemDispesa">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><span class="fas fa-coins"></span> Adicionar peso ao pedido</h5>
                    <button type="button" class="close btn-outline-danger" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h5 class=${PORCENTAGEMGLOBAL>50? "text-success":"text-danger"}>Porcentagem Disponível: ${PORCENTAGEMGLOBAL}%</h5>
                    <input id="porcentagemDispesaPeso" type="number" class="form-control mb-2" value=0>
                    <button onclick="if(document.getElementById('porcentagemDispesaPeso').value<=${PORCENTAGEMGLOBAL}){adicionarRemoverItemSelecionado(true,'${identificador}',document.getElementById('porcentagemDispesaPeso').value) }" type="button" data-dismiss="modal" class="btn btn-primary border border-dark col-md-6">
                        <span class="fas fa-chevron-right"></span> Proximo
                    </button>
                </div>
            </div>
        </div>
    </div>`

    document.getElementById('modal').innerHTML = codigoHTML;
    $('#modalPorcentagemDispesa').modal('show')
}

//function adicionar ou remover item selecionado
function adicionarRemoverItemSelecionado(adicionar,identificador,porcentagem){

    porcentagem? PORCENTAGEMGLOBAL=PORCENTAGEMGLOBAL-porcentagem:null

    adicionar? ORDERSSELECIONADOS.push({_id:identificador,percent:porcentagem? porcentagem:0}):removerOrdemSelecionado(identificador)

    function removerOrdemSelecionado (identificador){
        let aux =[];
        for (const iterator of ORDERSSELECIONADOS) {
            iterator._id!=identificador? aux.push(iterator):null
        }
        ORDERSSELECIONADOS=aux;
    }
}

//funcao responsavel por adicionar uma dispesa ao pedido
function adicionarDispesaAoPedido(identificador,value){

    if(ORDERSSELECIONADOS[0]!=null){
        let countPercentOrders = 0;
        for (const iterator of ORDERSSELECIONADOS) {
            iterator.percent==0? countPercentOrders++:null
        }
        for (const iterator of ORDERSSELECIONADOS) {
            iterator.percent==0? iterator.percent=PORCENTAGEMGLOBAL/countPercentOrders:null;
        }

        for (const iterator of TODASASORDERS) {
            !iterator.order.dispesas? iterator.order.dispesas=[]:null

            for (const iterator2 of ORDERSSELECIONADOS) {
                if(iterator.order._id == iterator2._id){
                    iterator.order.dispesas.push({identification:identificador, value:value*iterator2.percent/100, percent:iterator2.percent});
                }
            }
        }

        exibirDispesas();
        zerarCheckeds();
        calcularLucroGeral();
        calcularCustoGeral();

    }else{
        mensagemDeErro('Selecione ao menos um pedido!')
    }
}

//function para zerar todos os checkeds
function zerarCheckeds(){
    PORCENTAGEMGLOBAL=100;
    document.getElementById(`selecionarOrderTodos`).checked = false;
    for (const iterator of ORDERSSELECIONADOS) {
        document.getElementById(`selecionarOrder${iterator._id}`).checked = false;
    }
    ORDERSSELECIONADOS=[];
    document.getElementById('indetificadorDispesa').value='';
    document.getElementById('valorDispesa').value='';
}

//funcao responsavel por exibir as dispesas
function exibirDispesas(){
    for (const iterator of TODASASORDERS) {
        let codigoHTML = `<table class="table table-sm table-warning">`
        let costTotalExtra = 0;
        for (const iterator2 of iterator.order.dispesas) {
            costTotalExtra+=iterator2.value;
            codigoHTML+=`<tr>
                            <td><small><strong>Referencia: ${iterator2.identification}</strong></small></td>
                            <td class=${iterator2.value>0? "text-success":"text-danger"}><small><strong>Valor: R$ ${(iterator2.value).toFixed(2)}</strong></small></td>
                        </tr>`
        }
        let lucroUnitario = iterator.order.total+(iterator.order.tip? iterator.order.tip:0)-iterator.costTotal-(iterator.order.cardfee? iterator.order.cardfee:0)+costTotalExtra
        

        codigoHTML+=`<tr class="table-info">
                    <td><small><strong>Total dispesas extras</strong></small></td>
                    <td class="text-danger"><small><strong>Valor: R$ ${(costTotalExtra).toFixed(2)}</strong></small></td>
                </tr>
                <tr class="table-info">
                    <td><small><strong>Total gasto com pedido</strong></small></td>
                    <td class="text-danger"><small><strong>Valor: R$ ${(iterator.costTotal+(iterator.order.cardfee? iterator.order.cardfee:0)-costTotalExtra).toFixed(2)}</strong></small></td>
                </tr>
                <tr class="table-info">
                    <td><small><strong>Lucro do pedido</strong></small></td>
                    <td class=${lucroUnitario>0? "text-success":"text-danger"}><small><strong>Valor: R$ ${(lucroUnitario).toFixed(2)}</strong></small></td>
                </tr>
            </table>`
        document.getElementById(`adddespesas${iterator.order._id}`).innerHTML = codigoHTML;
    }
}

//funcao responsavel por calcular o lucro geral
function calcularLucroGeral(){
    let costExtras = 0;
    for (const iterator of TODASASORDERS) {
        for (const iterator2 of iterator.order.dispesas) {
            costExtras+=iterator2.value;
        }
    }
    document.getElementById('valorTotalLucroGeral').innerHTML = `R$ ${(parseFloat(TODASASINFORMACOES.netValue) + costExtras).toFixed(2)}`;
}

//funcao resṕonsavel por calcular o custo geral
function calcularCustoGeral(){
    let costExtras = 0;
    for (const iterator of TODASASORDERS) {
        for (const iterator2 of iterator.order.dispesas) {
            costExtras+=iterator2.value;
        }
    }
    document.getElementById('valorTotalCustoGeral').innerHTML = `R$ ${parseFloat(TODASASINFORMACOES.totalCost)-costExtras>=0? (parseFloat(TODASASINFORMACOES.totalCost) - costExtras).toFixed(2):'0.00'}`;
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
                        <td scope="col"><small>
                            <div class="custom-control custom-switch">
                                <input type="checkbox" onclick="adicionarDispesaTodososPedidos(this.checked)" class="custom-control-input custom-switch" id="selecionarOrderTodos">
                                <label class="custom-control-label" for="selecionarOrderTodos">Todos</label>
                            </div>
                        </small></td>
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
                            <input type="checkbox" onclick="this.checked? modalPorcentagemPesoDispesa('${item.order._id}'):adicionarRemoverItemSelecionado(false,'${item.order._id}')" class="custom-control-input custom-switch" id="selecionarOrder${item.order._id}">
                            <label class="custom-control-label" for="selecionarOrder${item.order._id}"></label>
                        </div>
                    </td>
                </tr>
                <tr class="table-light">
                    <td colspan="9">
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
                            <h3 style="color:green">R$ ${json.data.total}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Receitas menos custos(Período)</h6>
                            <h3 style="color:green">R$ ${json.data.netValue}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Gastos com cortesia(Período)</h6>
                            <h3 style="color:red">R$ ${json.data.totalCourtesy}</h3>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taxas de cartão(Período)</h6>
                            <h3 style="color:red">R$ ${json.data.totalCardFee}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taxas de serviço/gorjeta(Período)</h6>
                            <h3 style="color:green">R$ ${json.data.totalTip}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Custos com pedidos(Período)</h6>
                            <h3 style="color:red">R$ ${json.data.totalCost}</h3>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Valor total em estoque(Total)</h6>
                            <h3 style="color:red">R$ ${(json2.data).toFixed(2)}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Lucro Geral(Período)</h6>
                            <h3 style="color:orange" id="valorTotalLucroGeral">R$ ${json.data.netValue}</h3>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Custo Geral(Período)</h6>
                            <h3 style="color:orange" id="valorTotalCustoGeral">R$ ${json.data.totalCost}</h3>
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