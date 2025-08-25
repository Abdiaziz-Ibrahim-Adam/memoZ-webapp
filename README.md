<p align="center">
  <img src="assets/images/memoz-icon.png" alt="memoZ Logo" width="140"/>
</p>

# 📱 memoZ – Tillgänglighetsanpassad Dagplaneringsapp

memoZ är en tillgänglighetsanpassad mobil- och webbapplikation byggd med **React Native (Expo)** och **Firebase**.  
Appen hjälper användare att minnas och organisera viktiga vardagliga aktiviteter – schemalagda uppgifter och dagliga rutiner.  

🌍 **Live demo (webb via Netlify):**  
👉 [https://memoz-app.netlify.app/](https://memoz-app.netlify.app/)

---

## ✨ Funktioner

- 🗂 **Mappar & Listor** – organisera uppgifter i olika kategorier.
- 📝 **Uppgifter (Tasks)** – skapa, redigera, markera som klara.
- ⏰ **Påminnelser** – lägg till datum, tid och prioritet (låg/medel/hög).
- 📅 **Kalender** – dagvy och månadsöversikt med schemalagda uppgifter.
- 📊 **Veckovy** – veckostrip som ger översikt över dagens och veckans uppgifter.
- 🎨 **Modern UI** – färgkodade prioriteringar, minimalistisk och tillgänglig design.
- 🌐 **Plattformsstöd** – fungerar på **iOS**, **Android** och **Webb (Netlify)**.
- 🔐 **Firebase-integration** – autentisering och molndatabas för uppgifter och mappar.

---

## 🖼 Screenshots

### Onboarding
Introduktion som guidar nya användare genom appens funktioner.  

![Onboarding1](docs/screenshots/onboarding1.png)
![Onboarding2](docs/screenshots/onboarding2.png)
![Onboarding3](docs/screenshots/onboarding3.png)

### Landing
Startsida för appen innan inloggning/registrering.  

![Landing](docs/screenshots/landing.png)

### Logga in
Inloggning med e-post via Firebase Authentication.  

![Login](docs/screenshots/login.png)

### Registrera
Registreringsformulär för nya användare.  

![Register](docs/screenshots/register.png)

### Hemskärm (Dashboard)
Ger en snabb överblick över mappar, dagens uppgifter och veckostrip.  

![Home](docs/screenshots/home.png)

### Uppgifter (Tasks)
Lista där användaren kan se, filtrera och markera uppgifter som klara.  

![Tasks](docs/screenshots/tasks.png)

### Kalender
Månads- och dagsvy för planering på längre sikt.  

![Calendar](docs/screenshots/calender.png)

### Lägg till Uppgift
Formulär för att skapa nya uppgifter med datum, tid, prioritet och mapp.  

![Add Task](docs/screenshots/add.png)


---

## 🛠 Teknisk Arkitektur

- **Frontend:** [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/)  
- **Navigation:** [Expo Router](https://expo.github.io/router/)  
- **UI-ikoner:** [lucide-react-native](https://lucide.dev/)  
- **Databas & Backend:** [Firebase Firestore](https://firebase.google.com/docs/firestore)  
- **Autentisering:** [Firebase Auth](https://firebase.google.com/docs/auth)  
- **Webbexport:** `expo export --platform web`  
- **Deployment (webb):** [Netlify](https://www.netlify.com/)  

---

## 🚀 Installation & Körning

### 1. Klona projektet
```bash
git clone https://github.com/Abdiaziz-Ibrahim-Adam/memoZ-webapp.git
cd memoZ-webapp
