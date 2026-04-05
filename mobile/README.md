# Hotel Shreegopal Manager - Mobile App

A React Native mobile application for managing Hotel Shreegopal's pricing and scheduling. Built with Expo for easy cross-platform development.

## Features

### Price Update Section
- Update pricing for 4 room categories:
  - Category A (Standard Room)
  - Category B (Deluxe Room)
  - Category C (Premium Room)
  - Category D (Suite)
- Schedule price update time
- Real-time form validation
- Success feedback with visual confirmation

### Night Update Section
- Schedule night pricing activation time
- Daily automatic scheduling
- Visual time picker
- Current settings display
- Feature overview

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tab Navigation)
- **UI Components**: React Native Paper
- **Icons**: Material Community Icons
- **Date/Time Picker**: @react-native-community/datetimepicker
- **Storage**: AsyncStorage (for future persistence)

## Installation

### Prerequisites
- Node.js and npm/yarn/pnpm installed
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Setup Steps

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   # or
   pnpm start
   ```

4. **Run on your device**
   - **iOS**: Press `i` in the terminal or scan the QR code with Camera app
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go app

## Project Structure

```
mobile/
├── App.tsx                    # Main app entry and navigation setup
├── screens/
│   ├── PriceUpdateScreen.tsx  # Price management interface
│   └── NightUpdateScreen.tsx  # Night scheduling interface
├── app.json                   # Expo configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Key Components

### PriceUpdateScreen
- Form with 4 price input fields (Categories A-D)
- Time picker for scheduling price updates
- Real-time validation
- Category information cards
- "Update All Prices" submit button

### NightUpdateScreen
- Time picker for night mode activation
- Information card explaining functionality
- Current settings display
- Features list
- "Schedule Night Update" submit button

## Styling

The app uses a warm, professional color scheme matching Hotel Shreegopal's branding:
- Primary Color: `#b88a5f` (Gold)
- Secondary Color: `#6b5344` (Brown)
- Background: `#f9f7f4` (Light Cream)
- Text: `#1a1a1a` (Dark)

All styles are responsive and optimized for mobile devices.

## Navigation

The app uses Bottom Tab Navigation with two main screens:
1. **Price Update**: Currency icon with "Price Update" label
2. **Night Update**: Moon icon with "Night Update" label

## Future Enhancements

- [ ] AsyncStorage integration for saving prices locally
- [ ] Backend API integration
- [ ] Push notifications for price updates
- [ ] Historical pricing data view
- [ ] User authentication
- [ ] Multi-language support
- [ ] Dark mode support
- [ ] Analytics tracking

## Running on Different Platforms

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (Testing)
```bash
npm run web
```

## Troubleshooting

**Issue**: Port already in use
```bash
npm start -- --clear
```

**Issue**: Dependencies not installing
```bash
npm install --legacy-peer-deps
```

**Issue**: Module not found errors
```bash
npm install
npx expo prebuild
```

## Building for Production

### Create iOS App
```bash
eas build --platform ios
```

### Create Android App
```bash
eas build --platform android
```

*Note: Requires EAS (Expo Application Services) account*

## License

Proprietary - Hotel Shreegopal

## Support

For issues and feature requests, contact the development team.
