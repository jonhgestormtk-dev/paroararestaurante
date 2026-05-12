# Paroara | Restaurante | Beer Drik’s

Projeto de cardápio digital com temática de Rusticidade Amazônica Premium.

## Como exportar para o seu GitHub

Como sou um assistente de IA, não posso realizar o login e o push diretamente na sua conta, mas você pode fazer isso facilmente seguindo estes passos no terminal do Firebase Studio:

1. **Crie um repositório vazio no GitHub** (não adicione README ou licença ainda).
2. **Abra o Terminal** no Firebase Studio (ícone de terminal na barra inferior).
3. **Execute os seguintes comandos:**

```bash
# Inicie o repositório local (se ainda não o fez)
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: Paroara Menu"

# Renomeie a branch para main (padrão GitHub)
git branch -M main

# Conecte ao seu repositório remoto
# Se der erro "remote origin already exists", rode: git remote remove origin
git remote add origin https://github.com/jonhgestormtk-dev/paroararestaurante.git

# Envie os arquivos
git push -u origin main
```

### Problemas Comuns
- **Erro: "remote origin already exists"**: Rode `git remote remove origin` antes de tentar adicionar novamente ou use `git remote set-url origin <sua-url>`.
- **Permissão negada (403)**: Verifique se você está logado no terminal com as credenciais corretas do GitHub.

## Tecnologias Utilizadas

- **Next.js 15 (App Router)**
- **Firebase (Firestore & Auth)**
- **Genkit (AI para enriquecimento de descrições)**
- **Tailwind CSS & ShadCN UI**
- **Lucide Icons**

---
Desenvolvido como protótipo premium para culinária marajoara.
