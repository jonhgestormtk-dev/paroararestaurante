# Paroara | Restaurante | Beer Drik’s

Projeto de cardápio digital com temática de Rusticidade Amazônica Premium.

## 🚀 Como subir para o GitHub

Se você recebeu o erro `remote origin already exists`, siga estes passos no terminal do Studio:

1. **Remover a conexão antiga:**
   ```bash
   git remote remove origin
   ```

2. **Adicionar o seu repositório:**
   ```bash
   git remote add origin https://github.com/jonhgestormtk-dev/paroararestaurante.git
   ```

3. **Subir os arquivos:**
   ```bash
   git add .
   git commit -m "feat: setup initial project"
   git push -u origin main
   ```

## 🌐 Como fazer Deploy no Netlify

1. Acesse o [Netlify](https://app.netlify.com/).
2. Clique em **"Add new site"** -> **"Import an existing project"**.
3. Escolha **GitHub** e selecione o repositório `paroararestaurante`.
4. O Netlify detectará automaticamente que é um projeto Next.js.
5. **IMPORTANTE (Configuração Firebase):**
   Vá em **Site Settings** -> **Environment variables** e adicione as variáveis necessárias do seu arquivo `.env` (se houver segredos), mas como o Firebase Config está em `src/firebase/config.ts`, ele já deve funcionar nativamente.
6. Clique em **Deploy**.

## 📦 Status da Integração Firebase
- [x] Projeto Firebase: `restaurante-paroara`
- [x] Hosting Site ID: `restaurante-paroara-a474a`
- [x] Firestore: Configurado e pronto

---
Desenvolvido como protótipo premium para culinária marajoara.
