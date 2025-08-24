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

### Hemskärm (Dashboard)
Får en snabb överblick över mappar, dagens uppgifter och veckostrip.  

![Dashboard](docs/screenshots/home.png)

### Lägg till Uppgift
Skapa uppgifter med datum, tid, prioritet och välj mapp.  

![Add Task](docs/screenshots/add.png)

### Kalender
Månads- och dagsvy för att planera mer långsiktigt.  

![Calendar](docs/screenshots/calendar.png)

### Uppgiftslista
Se, filtrera och markera uppgifter som klara.  

![Tasks](docs/screenshots/tasks.png)

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
