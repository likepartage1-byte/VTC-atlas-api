import { AppRegistry } from 'react-native';
import App from './App';

// NOTE: This name MUST match getMainComponentName() in MainActivity.kt
// The APK is currently built to expect 'AtlasDriverShell'
AppRegistry.registerComponent('AtlasDriverShell', () => App);
