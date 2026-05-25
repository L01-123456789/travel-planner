# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Sentry (assignment)

This project is configured to use the supported Sentry SDK for Expo (`@sentry/react-native`).

### Step-by-step

1. Create a Sentry project (React Native) and copy the DSN.
2. Create a local env file (do not commit) using `.env.example` as a template.
   - Set `EXPO_PUBLIC_SENTRY_DSN=...`
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npx expo start
   ```

5. In the Home screen, use **Sentry Demo (for assignment)**:
   - **Send test error** → should appear in Sentry **Issues**.
   - **Send test performance trace** → should appear in Sentry **Performance**.

### What to submit

- Link to your Sentry Project.
- Screenshot showing at least:
  - 1 Issue (with stack trace)
  - 1 Performance transaction/trace

## Backend API demo screen

There is a quick demo UI in the **API Demo** tab (Explore) that calls the Go backend.

- Start backend (see [backend/README.md](../backend/README.md)). Default base URL: `http://localhost:8080/api/v1`
- In `.env`, set `EXPO_PUBLIC_API_BASE_URL` so the mobile app can reach your backend.
  - Android emulator: `http://10.0.2.2:8080/api/v1`
  - Physical device: `http://<your-pc-lan-ip>:8080/api/v1`

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
