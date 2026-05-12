
# Paroara | Restaurante | Beer Drik’s

Projeto de cardápio digital com temática de Rusticidade Amazônica Premium.

## 🚀 Como configurar o NOVO Firebase (restaurante-paroara)

Siga estes passos para configurar seu novo ambiente:

1. **Acesse o Console:** [console.firebase.google.com](https://console.firebase.google.com)
2. **Crie o Projeto:**
   - Clique em "Adicionar projeto".
   - Nome: `restaurante-paroara`.
   - Google Analytics: Desative para este protótipo.
3. **Configure o Firestore:**
   - No menu lateral, vá em **Firestore Database**.
   - Clique em **Criar banco de dados**.
   - Escolha o modo de teste (regras abertas) para desenvolvimento inicial.
4. **Obtenha as Credenciais:**
   - Clique no ícone de engrenagem (Configurações do projeto).
   - Na aba "Geral", role até "Seus aplicativos" e adicione um Web App.
   - Copie o objeto `firebaseConfig` e cole aqui no chat para eu atualizar o código!

## 📦 Como exportar para o seu GitHub

1. **Abra o Terminal** no Firebase Studio.
2. **Execute os comandos:**

```bash
# Caso o origin já exista, remova-o primeiro:
git remote remove origin

# Conecte ao seu repositório
git remote add origin https://github.com/jonhgestormtk-dev/paroararestaurante.git

# Envie os arquivos (force se o repositório no GitHub não estiver vazio)
git add .
git commit -m "Setup: Novo projeto Firebase restaurante-paroara"
git push -u origin main --force
```

---
Desenvolvido como protótipo premium para culinária marajoara.
