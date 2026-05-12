# Paroara | Restaurante | Beer Drik’s

Projeto de cardápio digital com temática de Rusticidade Amazônica Premium.

## 🚀 Como configurar o Firebase

Se você está criando um novo projeto do zero, siga estes passos:

1. **Acesse o Console:** [console.firebase.google.com](https://console.firebase.google.com)
2. **Crie o Projeto:**
   - Clique em "Adicionar projeto".
   - Nome: `restaurante-paroara`.
   - Google Analytics: Pode desativar para este protótipo.
3. **Configure o Firestore:**
   - No menu lateral, clique em **Firestore Database**.
   - Clique em **Criar banco de dados**.
   - Escolha o modo de teste (regras abertas) ou aplique as regras do arquivo `firestore.rules`.
4. **Obtenha as Credenciais:**
   - Clique no ícone de engrenagem (Configurações do projeto).
   - Na aba "Geral", role até "Seus aplicativos" e adicione um Web App.
   - Copie o objeto `firebaseConfig` e me envie para eu atualizar o código!

## 📦 Como exportar para o seu GitHub

Como sou um assistente de IA, não posso realizar o login e o push diretamente na sua conta, mas você pode fazer isso facilmente seguindo estes passos no terminal do Firebase Studio:

1. **Crie um repositório vazio no GitHub** (sem README ou licença).
2. **Abra o Terminal** no Firebase Studio (ícone de terminal na barra inferior).
3. **Execute os seguintes comandos:**

```bash
# Inicie o repositório local
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: Paroara Menu"

# Renomeie a branch para main
git branch -M main

# Conecte ao seu repositório remoto
git remote add origin https://github.com/jonhgestormtk-dev/paroararestaurante.git

# Envie os arquivos (force se o repositório não estiver vazio)
git push -u origin main --force
```

### Problemas Comuns
- **Erro: "remote origin already exists"**: Rode `git remote remove origin` antes de tentar adicionar novamente.
- **Erro: "rejected (fetch first)"**: Use a flag `--force` no push para sobrescrever o remoto.

---
Desenvolvido como protótipo premium para culinária marajoara.
