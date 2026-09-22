# COOP — Hospedando a sala no seu PC (custo zero)

Este modo cooperativo funciona de duas formas:

1. **Servidor gratuito do jogo (24/7)** — basta criar a sala e mandar o código `KYU-XXXX`. Nada para configurar.
2. **O anfitrião hospeda no próprio PC** — a sala passa a viver na sua máquina, sem depender de servidor externo (e sem limite de uptime). Esta é a **Opção 2** deste guia.

> 💡 Este repositório já inclui o servidor (`server/index.js`) e todas as
> dependências (`npm install`). O restante do jogo não precisa ser
> configurado — hospedar é opcional.

---

## 1. Pré-requisitos

- [Node.js 18+](https://nodejs.org) instalado no **PC do anfitrião**.
- Terminal (Windows: PowerShell / cmd; macOS/Linux: terminal).
- Os **dois jogadores** abrem o jogo pelo mesmo endereço de sempre
  (`https://kyuru1.github.io/ronin-arena/`).

### Passo 0 — instalar as dependências (só uma vez)

```bash
cd ronin-arena
npm install
```

---

## 2. Rodar o servidor de salas

No PC do anfitrião:

```bash
npm run server
```

Você deve ver algo como:

```
Ronin coop server (HTTP + WebSocket) ouvindo em http://0.0.0.0:3001
```

O servidor roda na porta **3001**. Deixe este terminal aberto.

> A porta pode ser trocada: `PORT=4000 npm run server` (Linux/macOS) ou
> `set PORT=4000 && npm run server` (Windows PowerShell). Se trocar, use a
> nova porta em todos os passos abaixo.

---

## 3. Abrir o túnel gratuito

Abra **outro terminal** no mesmo PC e rode **um** dos túneis abaixo.

### Opção A — localtunnel (a mais simples, sem instalar nada)

```bash
npx localtunnel --port 3001
```

Vai aparecer uma URL parecida com:

```
your url is: https://<aleatorio>.loca.lt
```

Copie essa URL inteira (ex.: `https://happy-goose-42.loca.lt`).

⚠️ **Primeira visita do parceiro à localtunnel**: ele verá uma página da
localtunnel pedindo o "tunnel password" (o IP público do anfitrião,
exibido na própria página). Basta copiar esse IP no campo e apertar
**Submit** uma vez por navegador. Depois disso o jogo conecta normalmente.

### Opção B — cloudflared (Cloudflare, rápida e estável)

1. Instale o `cloudflared` (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Rode o túnel **sem** usar o domínio do Cloudflare Access (modo "quick tunnel"):

```bash
cloudflared tunnel --url http://localhost:3001
```

Copie a URL `https://<aleatorio>.trycloudflare.com`.

### Opção C — URL fixa (playit.gg, ngrok)

Quer uma URL **fixa** que não muda a cada sessão? Use
[playit.gg](https://playit.gg) ou o [ngrok](https://ngrok.com). Ambos
instalam um agente e dão um endereço estável. Aponte-o para o protocolo
**TCP** na porta `3001`.

---

## 4. Criar a sala com a URL do túnel

1. No jogo, abra **COOPERATIVO**.
2. Vá em **HOSPEDAR SALA**.
3. No campo **“HOSPEDAR NO SEU PC (OPCIONAL)”**, cole a URL do túnel
   (ex.: `https://happy-goose-42.loca.lt`). A navegação `http(s)://` é
   convertida automaticamente para `ws(s)://` pelo jogo.
4. Clique em **CRIAR SALA**.

O código `KYU-XXXX` aparece na tela, junto com o endereço da sua sala.

---

## 5. Convidar o parceiro

- Clique em **COPIAR CONVITE** — agora ele copia o link completo:

  ```
  https://happy-goose-42.loca.lt#KYU-6F3K
  ```

- Mande esse convite pelo WhatsApp/Discord/etc.
- O parceiro abre **ENTRAR COM CÓDIGO** e cola o convite inteiro no mesmo
  campo. O jogo detecta a URL, conecta no seu túnel e entra na sala
  `KYU-6F3K` automaticamente.

> O campo de entrada continua aceitando **apenas o código** (`KYU-XXXX`)
> para as salas do servidor 24/7. Os dois formatos funcionam no mesmo campo.

---

## 6. Jogando

- O anfitrião inicia a partida quando o parceiro estiver **PRONTO**.
- Enquanto o terminal `npm run server` estiver aberto e o túnel ativo, a
  sala vive no seu PC — com quantas partidas quiserem, sem custo.

---

## 7. Como resolver problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Não foi possível conectar" / "Tempo de conexão esgotado" | Túnel apontando para porta errada, ou túnel caiu | Confirme `npm run server` ativo na porta do túnel; gere um novo túnel e atualize o convite |
| Parceiro cai do nada | Firewall/roteador derrubou a conexão, ou rede instável | Refazer o túnel; o servidor agora tem *heartbeat* (ping a cada 30s) para derrubar conexões mortas |
| Sala sumiu | Host fechou o jogo / derrubou o túnel | Recriar a sala; salas abandonadas são limpas automaticamente |
| Página de senha no localtunnel | localtunnel pede o "tunnel password" na 1ª visita | Copiar o IP público mostrado na página e clicar **Submit** |
| Esqueceu o `npm install` | `npm run server` não acha os módulos | Rodar `npm install` na pasta do projeto primeiro |
| Firewall do Windows bloqueando o Node | Porta 3001 fechada para a rede local | Permitir o Node.js no firewall (ver abaixo) |

### Liberar o Node.js no Firewall do Windows

Ao rodar `npm run server` pela primeira vez, o Windows pode perguntar se
quer permitir o acesso do Node.js à rede — marque **Permitir acesso** nas
redes **Privada e Pública**. Se não aparecer a pergunta:

1. Abra **Configurações → Rede e Internet → Firewall → Permitir aplicativo**.
2. Procure **Node.js: Server-side JavaScript**.
3. Marque as caixas **Privada** e **Pública** e confirme.

---

## 8. Mesma rede, sem internet (LAN)

Se os dois PCs estão **na mesma rede wi-fi**, dá para jogar sem túnel:

1. Descubra o IP local do anfitrião:
   - Windows: `ipconfig` → procure **Endereço IPv4** (ex.: `192.168.0.10`).
   - macOS: em **Ajustes de Sistema → Rede**.
   - Linux: `hostname -I`.
2. No campo **“HOSPEDAR NO SEU PC”**, cole `192.168.0.10:3001`
   (o IP **do anfitrião**, não o do parceiro).
3. Crie a sala. O convite sai assim:

   ```
   ws://192.168.0.10:3001#KYU-6F3K
   ```

   > O jogo monta `ws://` e não `wss://` porque IP local não tem
   > certificado HTTPS. Conecta normal na LAN.

---

## 9. Como tudo se conecta (para os curiosos)

```
 Ronin (host)            Túnel (localtunnel/cloudflared)          Ronin (convidado)
   ┌────────┐              ┌───────────────────────────┐            ┌────────┐
   │ browser├──WS──► localhost:3001 (server/index.js)  │            │ browser│
   │        │              │   ▲ publica a porta 3001   │            │        │
   │ code   │              │   ▼ https://xxxx.loca.lt   │            │ invite │
   └────────┘              └───────────┬───────────────┘            └────────┘
                                    WS conecta na URL
                                    + entra no código #KYU-6F3K
```

- `parseInvite` (no jogo) converte `URL#KYU-XXXX` em uma conexão WebSocket
  para o túnel **e** no código da sala.
- O servidor (`server/index.js`) só precisa das mensagens `CREATE_ROOM`,
  `JOIN_ROOM`, `GAME_PACKET` etc. — não precisa de banco de dados nem de
  configuração para o modo coop (o PostgreSQL é usado apenas pelo ranking).
```
