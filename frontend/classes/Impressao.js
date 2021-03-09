//----------------------------------------------- Classe Impressao -------------------------------------------

function impressaoDeRelatorioFinanceiro(){
    let codigoHTML=``;
    
    codigoHTML += `<div class="modal" id="modalimpressao">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><span class="fas fa-print"></span> Impressao</h5>
                        <button type="button" class="close btn-outline-danger" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="teladeimpressao">
                            <h3 class="text-center">Relatório (${document.getElementById('dataInicial').value} / ${document.getElementById('dataFinal').value})</h3>
                            <div id="camporeferenteimpressao"></div>
                    </div>
                </div>
            </div>
        </div>`

    document.getElementById('modal').innerHTML = codigoHTML;
    $('#modalimpressao').modal('show')

    document.getElementById('camporeferenteimpressao').innerHTML = document.getElementById('listaDadosGerais').innerHTML + document.getElementById('listaItens').innerHTML
    setTimeout(function(){imprimirImpressora('teladeimpressao')},500)
}