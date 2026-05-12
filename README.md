# Paroara | Restaurante | Beer Drik’s

Projeto de cardápio digital com temática de Rusticidade Amazônica Premium.

## 🚀 Status da Integração
- [x] Projeto Firebase: `restaurante-paroara`
- [x] Hosting Site ID: `restaurante-paroara-a474a`
- [x] Firestore: Configurado e pronto

## 📦 Como Implantar (Guia Passo a Passo)

Siga estes passos no terminal para publicar seu site e as regras de segurança:

### 1. Pré-requisito
Certifique-se de ter o **Node.js** instalado (https://nodejs.org).

### 2. Instalar CLI do Firebase
Execute o comando abaixo para instalar a ferramenta globalmente (apenas uma vez):
```bash
npm install -g firebase-tools
```

### 3. Autenticação e Inicialização
Faça login com sua conta Google vinculada ao Firebase:
```bash
firebase login
```

Na pasta raiz do projeto, inicialize as configurações:
```bash
firebase init
```

**Configurações recomendadas no wizard:**
- Selecione (espaço): `◉ Firestore` e `◉ Hosting`
- **Project Setup:** `Use an existing project` → selecione `restaurante-paroara`
- **Firestore Rules:** `firestore.rules` (Enter)
- **Firestore Indexes:** `firestore.indexes.json` (Enter)
- **Public Directory:** `.next` (ou `public` dependendo da sua build)
- **Configure as single-page app:** `No`
- **Set up automatic builds with GitHub:** `No`

### 4. Publicar Regras de Segurança
Sempre que alterar o banco de dados, envie as regras:
```bash
firebase deploy --only firestore:rules
```

### 5. Publicar o Site
Para enviar as alterações visuais para `https://restaurante-paroara-a474a.web.app`:
```bash
npm run build
firebase deploy --only hosting:restaurante-paroara-a474a
```

---
Desenvolvido como protótipo premium para culinária marajoara.