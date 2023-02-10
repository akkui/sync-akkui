# Pra que serve esse projeto?
Sync Akkui é um projeto de assistir vídeo e escutar músicas em tempo real de forma sincronizada com todos seus amigos/streamers.
Esse projeto é a disponibilização do código completo do como o sistema funciona.

# Como o código funciona?
O código gira em torno de HTTP Request/Response, quando você entra em uma sala, um vídeo de poucos segundos começa a tocar de fundo, a API do Youtube detecta quando o vídeo acaba e envia um HTTP Request pro servidor para atualizar o vídeo atual, se não tiver atualização dos vídeos, continua a reprodução do vídeo de fundo, se tiver, atualiza para o vídeo com o tempo informado.<br><br>
Por motivos de segurança, toda a parte de como é feito o gerenciamento da <b>Fila de Vídeos</b> ocorre no server-side, quando um usuário adiciona um vídeo à lista, o código puxa pelo YoutubeAPI o tempo do vídeo, e então salva em um Object. Se o vídeo que está sendo reproduzido no momento for "undefined", o primeiro item da lista de reprodução é definido como o vídeo sendo reproduzido no momento, e então à cada 1 Segundo o código verifica se o tempo do vídeo bate com o tempo máximo do vídeo, se sim, define o vídeo atual como undefined e repete o processo.
<br><br><br>
### Disclaimer
O projeto ainda se encontra em uma versão beta mal otimizada, correções e um possível remake podem vir a ocorrer no futuro.
