# 📱 SAGAS Brasil — Mobile & Web Store (D2C)

Aplicativo oficial da loja **SAGAS Brasil**, construído com **React 19 + Vite 8 + Capacitor 8.5** para execução híbrida no navegador web e nativa em dispositivos Android (APK/AAB).

---

## 📜 Scripts Disponíveis

```bash
# Iniciar a loja em modo desenvolvimento web (Porta 3000)
npm run dev

# Compilar o bundle web otimizado para a pasta dist/
npm run build

# Compilar o bundle e sincronizar automaticamente com a pasta android/
npx cap sync android

# Compilar o APK Android de Desenvolvimento completo
npm run build:apk

# Abrir o projeto no Android Studio
npm run open:android
```

---

## 🤖 Como Testar no Emulador Android

1. **Abra o Android Studio** e inicie um dispositivo virtual (AVD) no Gerenciador de Dispositivos (ex: *Pixel 7 - API 35*).
2. Certifique-se de que o backend ERP está rodando em `http://localhost:3001`.
3. Verifique que no arquivo `.env.local` a variável `VITE_BACKEND_URL_MOBILE` está configurada como:
   ```env
   VITE_BACKEND_URL_MOBILE="http://10.0.2.2:3001"
   ```
   *(No emulador Android oficial, `10.0.2.2` é o alias que aponta para o `localhost` da máquina host).*
4. Instale o APK no emulador:
   ```powershell
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. O aplicativo `SAGAS Brasil` estará disponível na gaveta de aplicativos.

---

## 📲 Como Testar no Dispositivo Físico (USB Debugging)

1. **No seu smartphone Android:**
   - Acesse **Configurações > Sobre o telefone**.
   - Toque em **Número da Versão** 7 vezes consecutivas para liberar o **Modo Desenvolvedor**.
   - Em **Opções do Desenvolvedor**, ative a opção **Depuração USB** (USB Debugging).
2. **Conecte o smartphone ao computador via cabo USB.**
   - No celular, autorize a chave RSA do computador marcada como "Sempre permitir deste computador".
3. **Verifique se o dispositivo foi reconhecido:**
   ```powershell
   adb devices
   ```
   *(Deve listar o serial do aparelho seguido de `device`).*
4. **Configure a rede para o dispositivo físico:**
   - **Opção A (Recomendada via ADB Reverse):**
     Execute no terminal para redirecionar as portas locais para o celular:
     ```powershell
     adb reverse tcp:3001 tcp:3001
     ```
     Desta forma, o app no celular consegue acessar o backend mesmo apontando para `http://localhost:3001`.
   - **Opção B (Via Wi-Fi na mesma rede):**
     Descubra o IP da sua máquina (ex: `192.168.1.100`) e configure no `.env.local`:
     ```env
     VITE_BACKEND_URL_MOBILE="http://192.168.1.100:3001"
     ```
     Depois reconstrua o app: `npm run build:apk`.
5. **Instale e execute no aparelho:**
   ```powershell
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## ⚙️ Variáveis de Ambiente Específicas

| Variável | Padrão | Utilidade |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `http://localhost:3001` | URL da API consumida quando rodando no navegador |
| `VITE_BACKEND_URL_MOBILE` | `http://10.0.2.2:3001` | URL da API quando o app detecta ambiente Capacitor/Nativo |
| `VITE_ERP_API_KEY` | `sagas_erp_sec_...` | Chave de segurança para reserva de estoque e criação de pedidos |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | `TEST-...` | Chave do SDK Mercado Pago para renderização do formulário PIX |
