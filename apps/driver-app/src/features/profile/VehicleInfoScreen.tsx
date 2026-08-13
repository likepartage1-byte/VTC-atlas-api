import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Camera as CameraIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  Check,
  X,
  RefreshCw,
  Search,
  Sliders,
  Plus,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { api, BASE_URL } from '../../api/axios.instance';
import { DrawerHeader } from '../../components/DrawerHeader';
import { useVehicleMode, setVehicleModeCache } from '../../hooks/useVehicleMode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateVehicleEligibility } from '../../services/vehicleEligibility.service';

// Photo utility imports
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Data Constants - Full Moroccan Automotive Market Dataset
const BRANDS_DATA = [
  { name: 'Dacia', logo: 'dacia' },
  { name: 'Renault', logo: 'renault' },
  { name: 'Peugeot', logo: 'peugeot' },
  { name: 'Volkswagen', logo: 'volkswagen' },
  { name: 'Toyota', logo: 'toyota' },
  { name: 'Hyundai', logo: 'hyundai' },
  { name: 'Kia', logo: 'kia' },
  { name: 'Fiat', logo: 'fiat' },
  { name: 'Citroën', logo: 'citroen' },
  { name: 'Mercedes-Benz', logo: 'mercedes' },
  { name: 'BMW', logo: 'bmw' },
  { name: 'Audi', logo: 'audi' },
  { name: 'Nissan', logo: 'nissan' },
  { name: 'Ford', logo: 'ford' },
  { name: 'Skoda', logo: 'skoda' },
  { name: 'Seat', logo: 'seat' },
  { name: 'Honda', logo: 'honda' },
  { name: 'Opel', logo: 'opel' },
  { name: 'Suzuki', logo: 'suzuki' },
  { name: 'Mitsubishi', logo: 'mitsubishi' },
  { name: 'Range Rover', logo: 'landrover' },
  { name: 'Volvo', logo: 'volvo' },
  { name: 'Chery', logo: 'chery' },
  { name: 'MG', logo: 'mg' },
  { name: 'Geely', logo: 'geely' },
  { name: 'BYD', logo: 'byd' },
  { name: 'Cupra', logo: 'cupra' },
  { name: 'Jeep', logo: 'jeep' },
  { name: 'Porsche', logo: 'porsche' },
];

const MODELS_MAP: Record<string, string[]> = {
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Lodgy', 'Jogger', 'Dokker', 'Spring'],
  'Renault': ['Clio', 'Megane', 'Express', 'Talisman', 'Kadjar', 'Captur', 'Arkana', 'Austral', 'Kangoo'],
  'Peugeot': ['208', '308', '2008', '3008', '5008', 'Partner', 'Rifter', '508'],
  'Volkswagen': ['Golf', 'Caddy', 'Passat', 'Tiguan', 'Touran', 'Polo', 'T-Roc', 'Touareg'],
  'Toyota': ['Corolla', 'Camry', 'Prius', 'Yaris', 'RAV4', 'Land Cruiser', 'C-HR', 'Hilux'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Accent', 'Elantra', 'Santa Fe', 'Kona', 'Creta'],
  'Kia': ['Picanto', 'Rio', 'Sportage', 'Sorento', 'Ceed', 'Stonic', 'Seltos'],
  'Fiat': ['500', 'Panda', 'Tipo', 'Doblo', 'Fiorino', 'Ducato'],
  'Citroën': ['C3', 'C4', 'Berlingo', 'C5 Aircross', 'C-Elysée', 'Jumpy'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'Classe V', 'CLA', 'GLC', 'GLE'],
  'BMW': ['Série 1', 'Série 3', 'Série 5', 'Série 7', 'X1', 'X3', 'X5', 'i4'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  'Nissan': ['Qashqai', 'Juke', 'Micra', 'X-Trail', 'Navara'],
  'Ford': ['Focus', 'Fiesta', 'Kuga', 'Transit', 'Ranger'],
  'Skoda': ['Octavia', 'Fabia', 'Superb', 'Kodiaq', 'Kamiq'],
  'Seat': ['Ibiza', 'Leon', 'Ateca', 'Arona'],
  'Honda': ['Civic', 'CR-V', 'HR-V', 'Jazz'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Grandland', 'Combo'],
  'Suzuki': ['Swift', 'Vitara', 'Jimny', 'Baleno'],
  'Mitsubishi': ['L200', 'Outlander', 'Eclipse Cross', 'Pajero'],
  'Range Rover': ['Evoque', 'Velar', 'Sport', 'Defender', 'Discovery'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90'],
  'Chery': ['Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'],
  'MG': ['MG ZS', 'MG HS', 'MG 4', 'MG 5'],
  'Geely': ['Coolray', 'Monjaro', 'Geometry C'],
  'BYD': ['Atto 3', 'Han', 'Tang', 'Dolphin', 'Seal'],
  'Cupra': ['Formentor', 'Leon', 'Ateca'],
  'Jeep': ['Renegade', 'Compass', 'Wrangler', 'Grand Cherokee'],
  'Porsche': ['Cayenne', 'Macan', 'Panamera', 'Taycan'],
};

const YEARS_ARRAY = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() - i));
const SEATS_ARRAY = ['2', '3', '4', '5', '6', '7', '8', '9'];

const COLOR_TEMPLATES = [
  { name: 'Deep Black', hex: '#0F172A', glow: 'rgba(15,23,42,0.4)' },
  { name: 'Titanium Grey', hex: '#64748B', glow: 'rgba(100,116,139,0.4)' },
  { name: 'Polar White', hex: '#F8FAFC', glow: 'rgba(248,250,252,0.5)' },
  { name: 'Metallic Silver', hex: '#CBD5E1', glow: 'rgba(203,213,225,0.4)' },
  { name: 'Ruby Red', hex: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
  { name: 'Royal Blue', hex: '#2563EB', glow: 'rgba(37,99,235,0.4)' },
  { name: 'Midnight Navy', hex: '#1E3A8A', glow: 'rgba(30,58,138,0.4)' },
  { name: 'Emerald Green', hex: '#059669', glow: 'rgba(5,150,105,0.4)' },
  { name: 'Champagne Gold', hex: '#D97706', glow: 'rgba(217,119,6,0.4)' },
  { name: 'Coffee Brown', hex: '#78350F', glow: 'rgba(120,53,15,0.4)' },
  { name: 'Sunset Orange', hex: '#EA580C', glow: 'rgba(234,88,12,0.4)' },
  { name: 'Anthracite Slate', hex: '#334155', glow: 'rgba(51,65,85,0.4)' },
];

const FUEL_TYPES = ['Diesel', 'Petrol', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

const GUIDE_TRANSLATIONS = {
  ar: {
    vehicle_title: 'صورة المركبة',
    vehicle_inst_1: 'مثال لطريقة التقاط الصورة الأمامية للمركبة.',
    vehicle_inst_2: 'تأكد من ظهور السيارة كاملة من الأمام، وأن تكون لوحة التسجيل واضحة ومقروءة.',
    grey_card_title: 'البطاقة الرمادية للمركبة',
    grey_card_inst_1: 'قم بتحميل صورة لشهادة تسجيل مركبتك (البطاقة الرمادية).',
    grey_card_inst_2: 'لقطات الشاشة، النسخ أو الصور المطبوعة غير مسموح بها.',
    grey_card_inst_3: 'تأكد من أن جميع التفاصيل والبيانات واضحة ومقروءة تماماً.',
    take_photo: 'التقاط صورة',
    choose_gallery: 'اختيار من المعرض',
    close: 'إغلاق',
  },
  fr: {
    vehicle_title: 'Photo du véhicule',
    vehicle_inst_1: 'Exemple de comment prendre la photo avant du véhicule.',
    vehicle_inst_2: 'Assurez-vous que la voiture est entièrement visible de face, et que la plaque d\'immatriculation est claire et lisible.',
    grey_card_title: 'Carte grise du véhicule',
    grey_card_inst_1: 'Téléchargez une photo du certificat d\'immatriculation de votre véhicule.',
    grey_card_inst_2: 'Les captures d\'écran, les copies ou les photos imprimées ne sont pas autorisées.',
    grey_card_inst_3: 'Assurez-vous que tous les détails sont clairement visibles.',
    take_photo: 'Prendre une photo',
    choose_gallery: 'Choisir dans la galerie',
    close: 'Fermer',
  },
  es: {
    vehicle_title: 'Foto del vehículo',
    vehicle_inst_1: 'Ejemplo de cómo tomar la foto frontal del vehículo.',
    vehicle_inst_2: 'Asegúrese de que el automóvil sea completamente visible de frente, y que la matrícula sea clara y legible.',
    grey_card_title: 'Tarjeta de registro del vehículo',
    grey_card_inst_1: 'Suba una foto del certificado de registro de su vehículo.',
    grey_card_inst_2: 'No se permiten capturas de pantalla, copias o fotos impresas.',
    grey_card_inst_3: 'Asegúrese de que todos los detalles sean claramente visibles.',
    take_photo: 'Tomar una foto',
    choose_gallery: 'Elegir de la galería',
    close: 'Cerrar',
  },
  en: {
    vehicle_title: 'Vehicle photo',
    vehicle_inst_1: 'Example of how to take the front photo of the vehicle.',
    vehicle_inst_2: 'Make sure the car is fully visible from the front, and the license plate is clear and readable.',
    grey_card_title: 'Vehicle registration card',
    grey_card_inst_1: 'Upload a photo of your vehicle\'s registration certificate.',
    grey_card_inst_2: 'Screenshots, copies, or printed photos are not allowed.',
    grey_card_inst_3: 'Make sure all details are clearly visible.',
    take_photo: 'Take a photo',
    choose_gallery: 'Choose from gallery',
    close: 'Close',
  }
};

const MoroccanGreyCardGuide = () => {
  return (
    <View style={guideStyles.moroccoCardWoodBg}>
      <View style={guideStyles.moroccoCardBody}>
        {/* Header decoration */}
        <View style={guideStyles.moroccoCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={guideStyles.moroccoCardHeaderTextFr}>ROYAUME DU MAROC</Text>
            <Text style={guideStyles.moroccoCardSubTextFr}>CERTIFICAT D'IMMATRICULATION</Text>
          </View>
          {/* Moroccan map shape placeholder */}
          <View style={guideStyles.moroccoCardMapPlaceholder}>
            <Svg viewBox="0 0 100 100" style={{ width: 22, height: 22 }}>
              <Path
                d="M40 10 C 45 15, 48 18, 50 25 C 52 32, 55 35, 53 45 C 50 55, 45 60, 42 75 Z"
                fill="#FFD700"
              />
            </Svg>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={guideStyles.moroccoCardHeaderTextAr}>المملكة المغربية</Text>
            <Text style={guideStyles.moroccoCardSubTextAr}>شهادة التسجيل</Text>
          </View>
        </View>

        {/* Horizontal separator */}
        <View style={guideStyles.moroccoCardDivider} />

        {/* Fields list */}
        <View style={guideStyles.moroccoCardFields}>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Numéro d'immatriculation</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>55334-1</Text>
            <Text style={guideStyles.fieldValAr}>رقم التسجيل</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Immatriculation antérieure</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>AA9922BB</Text>
            <Text style={guideStyles.fieldValAr}>التسجيل السابق</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Première mise en circulation</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>10/02/2024</Text>
            <Text style={guideStyles.fieldValAr}>تاريخ أول الشروع</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>M.C. au Maroc</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>10/02/2024</Text>
            <Text style={guideStyles.fieldValAr}>الاستعمال بالمغرب</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Propriétaire</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldValBold}>MOHAMED EL ARHOUNI</Text>
            <Text style={guideStyles.fieldValAr}>المالك</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Adresse</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldValSmall} numberOfLines={1}>RESIDENCE ENNASR IMM 4 RABAT</Text>
            <Text style={guideStyles.fieldValAr}>العنوان</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const MoroccanGreyCardVersoGuide = () => {
  return (
    <View style={guideStyles.moroccoCardWoodBg}>
      <View style={guideStyles.moroccoCardBody}>
        {/* Header decoration */}
        <View style={guideStyles.moroccoCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={guideStyles.moroccoCardHeaderTextFr}>CARACTÉRISTIQUES TECHNIQUES</Text>
            <Text style={guideStyles.moroccoCardSubTextFr}>VERSO - CERTIFICAT D'IMMATRICULATION</Text>
          </View>
          <View style={guideStyles.moroccoCardMapPlaceholder}>
            <Svg viewBox="0 0 100 100" style={{ width: 22, height: 22 }}>
              <Path
                d="M40 10 C 45 15, 48 18, 50 25 C 52 32, 55 35, 53 45 C 50 55, 45 60, 42 75 Z"
                fill="#FFD700"
              />
            </Svg>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={guideStyles.moroccoCardHeaderTextAr}>الخصائص التقنية للمركبة</Text>
            <Text style={guideStyles.moroccoCardSubTextAr}>الواجهة الخلفية</Text>
          </View>
        </View>

        {/* Horizontal separator */}
        <View style={guideStyles.moroccoCardDivider} />

        {/* Technical Fields list */}
        <View style={guideStyles.moroccoCardFields}>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Marque (D.1)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldValBold}>DACIA / RENAULT</Text>
            <Text style={guideStyles.fieldValAr}>الصانع</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Type / Modèle (D.3)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>LOGAN SD 1.5 DCI</Text>
            <Text style={guideStyles.fieldValAr}>النوع</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>N° de chassis (E / VIN)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldValSmall} numberOfLines={1}>VF1LSD82549201948</Text>
            <Text style={guideStyles.fieldValAr}>رقم الهيكل</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Carburant (P.3)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>DIESEL / غازوال</Text>
            <Text style={guideStyles.fieldValAr}>نوع الوقود</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Puissance fiscale (P.6)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>6 CV (خيل)</Text>
            <Text style={guideStyles.fieldValAr}>القوة الجبائية</Text>
          </View>
          <View style={guideStyles.moroccoCardFieldRow}>
            <Text style={guideStyles.fieldLabel}>Nombre de places (S.1)</Text>
            <Text style={guideStyles.fieldDivider}>:</Text>
            <Text style={guideStyles.fieldVal}>5 PLACES</Text>
            <Text style={guideStyles.fieldValAr}>عدد المقاعد</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Car Silhouette Outline Overlay matching user screenshot perfectly!
const SVGCarCameraOverlay = ({ isRear = false }: { isRear?: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'relative' }}>
    {/* Full-Width Car Outline SVG */}
    <Svg width="95%" height="80%" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid meet">
      {/* Outer Car Body Silhouette Outline matching exact user sample image */}
      <Path
        d="
          M 85 30
          C 105 15, 195 15, 215 30
          C 225 40, 242 90, 250 100
          C 268 100, 278 106, 278 116
          C 278 126, 262 132, 250 132
          C 248 165, 246 195, 244 205
          C 242 215, 230 220, 205 220
          C 195 220, 195 198, 175 198
          L 125 198
          C 105 198, 105 220, 95 220
          C 70 220, 58 215, 56 205
          C 54 195, 52 165, 50 132
          C 38 132, 22 126, 22 116
          C 22 106, 32 100, 50 100
          C 58 90, 75 40, 85 30
          Z
        "
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.5"
      />
    </Svg>
  </View>
);
const VehicleRearGuideGraphic = () => (
  <View style={{ width: '100%', height: 250, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderRadius: 16, overflow: 'hidden' }}>
    <Svg width="260" height="200" viewBox="0 0 300 240">
      {/* Shadow */}
      <Ellipse cx="150" cy="210" rx="120" ry="15" fill="rgba(0,0,0,0.5)" />
      {/* Car Rear Body Base */}
      <Path
        d="M 60 45 L 240 45 L 265 110 L 270 195 C 270 205, 260 210, 245 210 C 235 210, 235 190, 215 190 L 85 190 C 65 190, 65 210, 55 210 C 40 210, 30 205, 30 195 L 35 110 Z"
        fill="#1E293B"
        stroke="#475569"
        strokeWidth="3"
      />
      {/* Rear Windshield */}
      <Path d="M 75 55 L 225 55 L 240 100 L 60 100 Z" fill="#020617" stroke="#334155" strokeWidth="2" />
      {/* Left Tail Light (Red Glow) */}
      <Rect x="40" y="115" width="50" height="26" rx="6" fill="#EF4444" stroke="#DC2626" strokeWidth="2.5" />
      {/* Right Tail Light (Red Glow) */}
      <Rect x="210" y="115" width="50" height="26" rx="6" fill="#EF4444" stroke="#DC2626" strokeWidth="2.5" />
      {/* License Plate Frame */}
      <Rect x="110" y="145" width="80" height="28" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
      <SvgText x="150" y="163" textAnchor="middle" fill="#000000" fontSize="11" fontWeight="bold">55334-1</SvgText>
    </Svg>
    <View style={{ position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' }}>
      <Text style={{ color: '#F87171', fontSize: 11.5, fontWeight: '700' }}>🚗 الواجهة الخلفية للمركبة (Rear)</Text>
    </View>
  </View>
);

// Brand Logo Svg Renderer Component
const BrandLogo = ({ type, color }: { type: string; color: string }) => {
  switch (type) {
    case 'mercedes':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Path d="M50 5 L50 50 M50 50 L15 75 M50 50 L85 75" stroke={color} strokeWidth="5" strokeLinecap="round" />
        </Svg>
      );
    case 'renault':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M50 5 L85 35 L85 65 L50 95 L15 65 L15 35 Z" stroke={color} strokeWidth="6" fill="none" strokeLinejoin="miter" />
          <Path d="M50 25 L70 45 L70 55 L50 75 L30 55 L30 45 Z" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    case 'peugeot':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M50 5 L80 15 L80 65 L50 95 L20 65 L20 15 Z" stroke={color} strokeWidth="6" fill="none" />
          <Path d="M35 60 C40 45 45 40 50 40 C55 40 60 45 65 60 C65 45 60 30 50 30 C40 30 35 45 35 60" fill={color} />
        </Svg>
      );
    case 'dacia':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M20 30 L45 30 C55 30 65 40 65 50 C65 60 55 70 45 70 L20 70 Z" stroke={color} strokeWidth="7" fill="none" />
          <Path d="M40 30 L55 30 M40 70 L55 70" stroke={color} strokeWidth="7" />
          <Path d="M60 30 H80 V70 H60" stroke={color} strokeWidth="7" fill="none" />
        </Svg>
      );
    case 'toyota':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="50" cy="35" r="28" stroke={color} strokeWidth="4" fill="none" transform="scale(1, 0.45) translate(0, 60)" />
          <Circle cx="50" cy="50" r="20" stroke={color} strokeWidth="4" fill="none" transform="scale(0.35, 1) translate(92, 0)" />
        </Svg>
      );
    case 'volkswagen':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Path d="M25 25 L45 68 H55 L75 25 M32 25 L50 63 L68 25 M40 25 L50 48 L60 25" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    case 'hyundai':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" transform="scale(1.2, 0.8) translate(-8, 12)" />
          <Path d="M30 25 L35 75 M70 25 L65 75 M33 50 L67 50" stroke={color} strokeWidth="7" strokeLinecap="round" />
        </Svg>
      );
    case 'bmw':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Circle cx="50" cy="50" r="30" stroke={color} strokeWidth="3" fill="none" />
          <Path d="M50 20 V80 M20 50 H80" stroke={color} strokeWidth="3" />
        </Svg>
      );
    case 'audi':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100 col">
          <Circle cx="26" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="42" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="58" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="74" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    default:
      return <Sliders size={20} color={color} />;
  }
};

// 3D Car Vector Component
const SVG3DCar = ({ colorsPrimary }: { colorsPrimary: string }) => (
  <Svg width="180" height="120" viewBox="0 0 200 120" style={{ transform: [{ scale: 1.1 }] }}>
    <Defs>
      <SvgLinearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="100%" stopColor="#1E293B" stopOpacity="0.8" />
      </SvgLinearGradient>
      <SvgLinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
      </SvgLinearGradient>
    </Defs>
    {/* Floor reflection shadow */}
    <Ellipse cx="100" cy="100" rx="75" ry="12" fill="rgba(0,0,0,0.35)" />
    
    {/* Car Isometric body projection */}
    <Path d="M30 85 L20 70 L42 45 L95 40 L160 48 L185 70 L175 88 Z" fill="url(#carGrad)" />
    
    {/* Windshield & Cabin Glassmorphism */}
    <Path d="M50 48 L90 44 L110 58 L52 64 Z" fill="url(#glassGrad)" />
    <Path d="M96 44 L142 49 L148 60 L114 58 Z" fill="url(#glassGrad)" />
    
    {/* Wheels with chrome inserts */}
    <Circle cx="55" cy="85" r="15" fill="#0F172A" />
    <Circle cx="55" cy="85" r="7" fill="#E2E8F0" />
    <Circle cx="145" cy="86" r="15" fill="#0F172A" />
    <Circle cx="145" cy="86" r="7" fill="#E2E8F0" />
    
    {/* Glowing laser neo-headlights */}
    <Path d="M20 72 L32 75 L30 80 L18 76 Z" fill="#3B82F6" opacity="0.95" />
    <Circle cx="20" cy="74" r="6" fill="#60A5FA" opacity="0.8" />
    
    {/* Back red taillights */}
    <Path d="M185 71 L178 74 L177 78 L184 75 Z" fill="#EF4444" opacity="0.95" />
  </Svg>
);

// 3D Motorcycle Vector Component
const SVG3DMotorcycle = ({ colorsPrimary }: { colorsPrimary: string }) => (
  <Svg width="180" height="120" viewBox="0 0 200 120" style={{ transform: [{ scale: 1.15 }] }}>
    <Defs>
      <SvgLinearGradient id="motoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="100%" stopColor="#334155" stopOpacity="0.9" />
      </SvgLinearGradient>
    </Defs>
    {/* Floor reflection shadow */}
    <Ellipse cx="100" cy="100" rx="65" ry="10" fill="rgba(0,0,0,0.35)" />
    
    {/* Motorcycle Body silhouette */}
    <Path d="M45 82 L70 50 L115 48 L140 70 L120 85 L95 62 L65 82 Z" fill="url(#motoGrad)" />
    
    {/* Isometric details/Engine blocks */}
    <Rect x="85" y="65" width="28" height="20" rx="3" fill="#64748B" />
    
    {/* Front Fork & Steering */}
    <Path d="M60 85 L42 35 M42 35 L50 30" stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
    
    {/* Wheels with details */}
    <Circle cx="50" cy="85" r="18" fill="#0F172A" />
    <Circle cx="50" cy="85" r="8" fill="#94A3B8" />
    <Circle cx="145" cy="85" r="18" fill="#0F172A" />
    <Circle cx="145" cy="85" r="8" fill="#94A3B8" />
    
    {/* Front light glow */}
    <Circle cx="39" cy="38" r="7" fill="#60A5FA" opacity="0.9" />
  </Svg>
);

export const VehicleInfoScreen = () => {
  const navigation = useNavigation();
  const { t: baseT, i18n } = useTranslation('profile');
  const t = (key: string, optionsOrDefault?: any): string => {
    return String(baseT(key, optionsOrDefault));
  };
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  // --- View State ---
  const [viewState, setViewState] = useState<'select' | 'form'>('form');
  const [selectedTypeChoice, setSelectedTypeChoice] = useState<'CAR' | 'MOTORCYCLE'>('CAR');

  // --- API State & Initial data ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [approvedPhotos, setApprovedPhotos] = useState<Record<PhotoSlotKey, string | null>>({
    vehicle_front: null,
    vehicle_rear: null,
    registration_front: null,
    registration_rear: null,
  });

  // --- Form Input States ---
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | null>('CAR');
  const [manufacturer, setManufacturer] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [transmission, setTransmission] = useState('Manual');
  const [seats, setSeats] = useState('4');
  const [plateNumber, setPlateNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');

  // Climatisation States
  const [hasAirConditioning, setHasAirConditioning] = useState(true);
  const [acWorkingStatus, setAcWorkingStatus] = useState<'EXCELLENT' | 'GOOD' | 'NEEDS_SERVICE'>('EXCELLENT');

  // 4 Photo Slots:
  // 1. vehicle_front: الصورة الأمامية للمركبة
  // 2. vehicle_rear: الصورة الخلفية للمركبة
  // 3. registration_front: الواجهة الأمامية للبطاقة الرمادية
  // 4. registration_rear: الواجهة الخلفية للبطاقة الرمادية
  type PhotoSlotKey = 'vehicle_front' | 'vehicle_rear' | 'registration_front' | 'registration_rear';

  const [photos, setPhotos] = useState<Record<PhotoSlotKey, string | null>>({
    vehicle_front: null,
    vehicle_rear: null,
    registration_front: null,
    registration_rear: null,
  });

  // --- Custom Picker Modals ---
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [showPhotoOptionsSheet, setShowPhotoOptionsSheet] = useState(false);
  const [showTypeChangeModal, setShowTypeChangeModal] = useState(false);
  const [selectedPhotoSlot, setSelectedPhotoSlot] = useState<PhotoSlotKey | null>(null);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [photoStatuses, setPhotoStatuses] = useState<Record<PhotoSlotKey, 'EMPTY' | 'PENDING' | 'APPROVED' | 'REJECTED'>>({
    vehicle_front: 'EMPTY',
    vehicle_rear: 'EMPTY',
    registration_front: 'EMPTY',
    registration_rear: 'EMPTY',
  });
  const [failedAttemptsCount, setFailedAttemptsCount] = useState<Record<string, number>>({});
  const [qualityValidationStatus, setQualityValidationStatus] = useState<'IDLE' | 'SCANNING' | 'SCAN_FAILED'>('IDLE');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // --- Dynamic Vehicle Data from Database ---
  const [dbBrands, setDbBrands] = useState<{ id: string; name: string; logo: string | null }[]>(
    BRANDS_DATA.map((b, idx) => ({ id: String(idx + 1), name: b.name, logo: b.logo }))
  );
  const [dbModels, setDbModels] = useState<{ id: string; name: string }[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [maxVehicleAge, setMaxVehicleAge] = useState<number>(20);

  const getT = (key: string, options?: any): string => {
    const resolved = t(key, options);
    if (resolved !== key) {
      return resolved;
    }
    const defaultTranslations: Record<string, Record<string, string>> = {
      ar: {
        validation_checking_title: 'فحص جودة الصورة',
        validation_desc: 'الصورة التي تم تحميلها تبدو غير واضحة أو ذات إضاءة ضعيفة. يرجى محاولة التقاط صورة تحت إضاءة جيدة وتجنب الاهتزاز.',
        under_review_title: 'قيد المراجعة',
        under_review_body: 'تم رفع الصورة وهي بانتظار موافقة الإدارة. لا يمكن تعديلها حالياً.',
        photo_lbl: 'صورة المركبة',
        retake_photo: 'إعادة التقاط الصورة',
        approved_label: 'مقبول',
        rejected_label: 'مرفوض',
        age_limit_error: 'عمر المركبة غير مقبول. سياسة Yalla VTC تسمح بالمركبات ذات الـ 20 عاماً أو أقل فقط.',
        verification_done_title: 'تم التحقق بنجاح 🎉',
        verification_done_desc: 'لقد تمت الموافقة على جميع المستندات والصور الخاصة بمركبتك بنجاح.',
        progress_title: 'التحقق من المركبة',
        progress_detail: 'تم إكمال {{completed}} من {{total}} عناصر',
        timeline_status_title: 'حالة طلب التحقق',
        timeline_step_upload: 'رفع المستندات',
        timeline_step_review: 'قيد المراجعة',
        timeline_step_approved: 'تمت الموافقة',
        timeline_step_rejected: 'مرفوض',
        timeline_step_decision: 'القرار النهائي',
        rejection_title: 'تم رفض المستند',
        rejection_desc: 'تم رفض مستندات مركبتك للسبب التالي: {{reason}}',
        illus_label: 'مثال لطريقة التقاط الصورة لمركبتك بشكل صحيح لتجنب الرفض:',
        success_notif: 'مبارك! تم اعتماد مركبتك بالكامل من قبل الإدارة ويمكنك الآن بدء تلقي طلبات الركوب.',
      },
      en: {
        validation_checking_title: 'Quality Check',
        validation_desc: 'The uploaded image is blurry or dark. Please capture it with better lighting and keep hands steady.',
        under_review_title: 'Pending Review',
        under_review_body: 'The photo has been uploaded and is pending admin approval. Edits are disabled.',
        photo_lbl: 'Photo',
        retake_photo: 'Retake Photo',
        approved_label: 'Approved',
        rejected_label: 'Rejected',
        age_limit_error: 'Vehicle age is ineligible. Yalla VTC only accepts vehicles 20 years old or newer.',
        verification_done_title: 'Verification Done 🎉',
        verification_done_desc: 'All vehicle documents have been successfully verified.',
        progress_title: 'Vehicle Verification',
        progress_detail: 'Completed {{completed}} of {{total}} items',
        timeline_status_title: 'Verification Timeline',
        timeline_step_upload: 'Upload Docs',
        timeline_step_review: 'In Review',
        timeline_step_approved: 'Approved',
        timeline_step_rejected: 'Rejected',
        timeline_step_decision: 'Decision',
        rejection_title: 'Document Rejected',
        rejection_desc: 'Your vehicle documents were rejected for: {{reason}}',
        illus_label: 'Example of how to capture documents correctly:',
        success_notif: 'Congratulations! Your vehicle has been validated. You can start receiving rides.',
      },
      fr: {
        validation_checking_title: 'Contrôle Qualité',
        validation_desc: 'L\'image est floue ou sombre. Veuillez reprendre la photo avec un meilleur éclairage.',
        under_review_title: 'En attente',
        under_review_body: 'Dossier en attente de vérification administrative.',
        photo_lbl: 'Photo',
        retake_photo: 'Reprendre la photo',
        approved_label: 'Approuvé',
        rejected_label: 'Rejeté',
        age_limit_error: 'L\'âge du véhicule n\'est pas éligible. Seuls les véhicules de moins de 20 ans sont acceptés.',
        verification_done_title: 'Vérification Réussie 🎉',
        verification_done_desc: 'Tous vos documents de véhicule ont été validés.',
        progress_title: 'Vérification du Véhicule',
        progress_detail: '{{completed}} sur {{total}} éléments complétés',
        timeline_status_title: 'Historique de Vérification',
        timeline_step_upload: 'Téléchargement',
        timeline_step_review: 'En cours',
        timeline_step_approved: 'Approuvé',
        timeline_step_rejected: 'Rejeté',
        timeline_step_decision: 'Décision',
        rejection_title: 'Document Rejeté',
        rejection_desc: 'Vos documents ont été rejetés pour le motif suivant : {{reason}}',
        illus_label: 'Exemple de capture de document :',
        success_notif: 'Félicitations! Votre véhicule a été validé.',
      },
      es: {
        validation_checking_title: 'Control de calidad',
        validation_desc: 'La imagen subida está borrosa o es oscura. Por favor, tómala con mejor iluminación y pulso firme.',
        under_review_title: 'Pendiente de revisión',
        under_review_body: 'La foto ha sido subida y está pendiente de aprobación. Edición deshabilitada.',
        photo_lbl: 'Foto del vehículo',
        retake_photo: 'Volver a tomar foto',
        approved_label: 'Aprobado',
        rejected_label: 'Rechazado',
        age_limit_error: 'La antigüedad del vehículo no es apta. Yalla VTC solo acepta vehículos de 20 años o menos.',
        verification_done_title: 'Verificación Completada 🎉',
        verification_done_desc: 'Todos los documentos del vehículo han sido validados con éxito.',
        progress_title: 'Verificación del vehículo',
        progress_detail: 'Completado {{completed}} de {{total}} elementos',
        timeline_status_title: 'Línea de tiempo de verificación',
        timeline_step_upload: 'Subir documentos',
        timeline_step_review: 'En revisión',
        timeline_step_approved: 'Aprobado',
        timeline_step_rejected: 'Rechazado',
        timeline_step_decision: 'Decisión',
        rejection_title: 'Documento Rechazado',
        rejection_desc: 'Los documentos de tu vehículo fueron rechazados por: {{reason}}',
        illus_label: 'Ejemplo de cómo capturar documentos correctamente:',
        success_notif: '¡Felicidades! Tu vehículo ha sido validado.',
      }
    };
    const lang = i18n.language || 'en';
    const dict = defaultTranslations[lang] || defaultTranslations.en;
    let translation = dict[key] || key;
    if (options) {
      Object.keys(options).forEach((optKey) => {
        translation = translation.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }
    return translation;
  };

  // Suggestion states
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedBrand, setSuggestedBrand] = useState('');
  const [suggestedModel, setSuggestedModel] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  // --- Search text in brand list ---
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // --- Guided Camera view ---
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice(cameraType);



  const fetchManufacturers = async () => {
    setLoadingBrands(true);
    try {
      const res = await api.get('/driver/profile/vehicle/manufacturers');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDbBrands(res.data);
      } else {
        setDbBrands(BRANDS_DATA.map((b, idx) => ({ id: String(idx + 1), name: b.name, logo: b.logo })));
      }
    } catch (err) {
      console.warn('Failed to load brands from database, using static fallback:', err);
      setDbBrands(BRANDS_DATA.map((b, idx) => ({ id: String(idx + 1), name: b.name, logo: b.logo })));
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModelsForBrand = async (brandName: string) => {
    if (!brandName) return;
    setLoadingModels(true);
    try {
      const res = await api.get(`/driver/profile/vehicle/models?manufacturer=${encodeURIComponent(brandName)}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDbModels(res.data);
      } else {
        const staticModels = MODELS_MAP[brandName] || ['Standard', 'Executive', 'Sport', 'Comfort'];
        setDbModels(staticModels.map((m, idx) => ({ id: String(idx + 1), name: m })));
      }
    } catch (err) {
      console.warn('Failed to load models for brand, using static fallback:', err);
      const staticModels = MODELS_MAP[brandName] || ['Standard', 'Executive', 'Sport', 'Comfort'];
      setDbModels(staticModels.map((m, idx) => ({ id: String(idx + 1), name: m })));
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (brand) {
      fetchModelsForBrand(brand);
    }
  }, [brand]);

  // Fetch approved profile settings
  const fetchVehicleProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/driver/profile/vehicle');
      const data = response.data;

      if (data.maxVehicleAge !== undefined) {
        setMaxVehicleAge(data.maxVehicleAge);
      }

      const vehicle = data.vehicleInfo || {};
      const activeType = (vehicle.type || '').toUpperCase();

      if (activeType === 'MOTORCYCLE') {
        setLoading(false);
        (navigation as any).replace('MotorcycleInfo');
        return;
      }

      const appPhotos: Record<PhotoSlotKey, string | null> = {
        vehicle_front: vehicle.photos?.vehicle_front || vehicle.photos?.vehicle || null,
        vehicle_rear: vehicle.photos?.vehicle_rear || null,
        registration_front: vehicle.photos?.registration_front || vehicle.photos?.registration || null,
        registration_rear: vehicle.photos?.registration_rear || null,
      };

      setApprovedPhotos(appPhotos);
      setVehicleType('CAR');
      setManufacturer(vehicle.manufacturer || '');
      setBrand(vehicle.brand || '');
      setModel(vehicle.model || '');
      setYear(vehicle.year ? String(vehicle.year) : '');
      setColor(vehicle.color || '');
      setFuelType(vehicle.fuelType || 'Diesel');
      setTransmission(vehicle.transmission || 'Manual');
      setSeats(vehicle.seats ? String(vehicle.seats) : '4');
      setPlateNumber(vehicle.plateNumber || '');
      setRegistrationNumber(vehicle.registrationNumber || '');
      setVin(vehicle.vin || '');

      setPhotos(appPhotos);

      if (appPhotos.registration_front || vehicle.registrationNumber) {
        await AsyncStorage.setItem(
          '@uploaded_doc_CARTE_GRISE',
          JSON.stringify({
            type: 'CARTE_GRISE',
            status: data.pendingVehicleUpdate ? 'PENDING' : 'APPROVED',
            updatedAt: Date.now(),
          })
        ).catch(() => {});
      }

      if (data.pendingVehicleUpdate) {
        setHasPendingRequest(true);
        setRejectionReason(null);
 
        const proposed = data.pendingVehicleUpdate.fields || {};
        const proposedPhotos = data.pendingVehicleUpdate.photos || {};

        setVehicleType('CAR');
        setSelectedTypeChoice('CAR');
        if (proposed.manufacturer) setManufacturer(proposed.manufacturer);
        if (proposed.brand) setBrand(proposed.brand);
        if (proposed.model) setModel(proposed.model);
        if (proposed.year) setYear(String(proposed.year));
        if (proposed.color) setColor(proposed.color);
        if (proposed.fuelType) setFuelType(proposed.fuelType);
        if (proposed.transmission) setTransmission(proposed.transmission);
        if (proposed.seats) setSeats(String(proposed.seats));
        if (proposed.plateNumber) setPlateNumber(proposed.plateNumber);
        if (proposed.registrationNumber) setRegistrationNumber(proposed.registrationNumber);
 
        const parsedPhotos: Record<PhotoSlotKey, string | null> = {
          vehicle_front: proposedPhotos.vehicle_front || appPhotos.vehicle_front,
          vehicle_rear: proposedPhotos.vehicle_rear || appPhotos.vehicle_rear,
          registration_front: proposedPhotos.registration_front || appPhotos.registration_front,
          registration_rear: proposedPhotos.registration_rear || appPhotos.registration_rear,
        };

        setPhotos(parsedPhotos);

        setPhotoStatuses({
          vehicle_front: parsedPhotos.vehicle_front ? 'PENDING' : 'EMPTY',
          vehicle_rear: parsedPhotos.vehicle_rear ? 'PENDING' : 'EMPTY',
          registration_front: parsedPhotos.registration_front ? 'PENDING' : 'EMPTY',
          registration_rear: parsedPhotos.registration_rear ? 'PENDING' : 'EMPTY',
        });
 
        setViewState('form');
      } else if (data.rejectedVehicleUpdate) {
        setHasPendingRequest(false);
        setRejectionReason(data.rejectedVehicleUpdate.rejectionReason || 'Rejected by admin');
        
        const proposedPhotos = data.rejectedVehicleUpdate.photos || {};
        const proposedVehicle = proposedPhotos.vehicle || appPhotos.vehicle;
        const proposedReg = proposedPhotos.registration || appPhotos.registration;
        setPhotos({
          vehicle: proposedVehicle,
          registration: proposedReg,
        });

        setPhotoStatuses({
          vehicle: proposedVehicle ? 'REJECTED' : 'EMPTY',
          registration: proposedReg ? 'REJECTED' : 'EMPTY',
        });

        setVehicleType('CAR');
        setViewState('form');
      } else {
        setHasPendingRequest(false);
        setRejectionReason(null);

        // Detect transition from pending to approved state to trigger success confetti banner
        const wasPending = photoStatuses.vehicle === 'PENDING' || photoStatuses.registration === 'PENDING';
        if (wasPending && appPhotos.vehicle && appPhotos.registration) {
          setShowSuccessBanner(true);
        }

        setPhotoStatuses({
          vehicle: appPhotos.vehicle ? 'APPROVED' : 'EMPTY',
          registration: appPhotos.registration ? 'APPROVED' : 'EMPTY',
        });

        setVehicleType('CAR');
        setViewState('form');
      }
    } catch (err: any) {
      console.warn('[Vehicle Info] Fetch profile error (using defaults):', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleProfile();
  }, []);

  const triggerCamera = async () => {
    setShowPhotoOptionsSheet(false);
    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(t('error'), t('camera_permission_required'));
      return;
    }
    setCameraType('back');
    setTempCaptureUri(null);
    setShowCameraView(true);
  };

  const checkAndRequestCameraPermission = async () => {
    const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const status = await check(permission);
    if (status === RESULTS.GRANTED) return true;
    const requestStatus = await request(permission);
    return requestStatus === RESULTS.GRANTED;
  };

  const triggerGallery = async () => {
    setShowPhotoOptionsSheet(false);
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;
      const selectedUri = result.assets[0].uri;
      if (selectedUri) {
        await handleUploadPhoto(selectedUri);
      }
    } catch (err: any) {
      Alert.alert(t('error'), t('file_read_error', 'Impossible de lire le fichier.'));
    }
  };

  const handleUploadPhoto = async (localPath: string) => {
    if (!selectedPhotoSlot) return;
    setUploading(true);

    try {
      let finalUri = localPath;
      try {
        const resized = await ImageResizer.createResizedImage(
          localPath,
          800,
          600,
          'JPEG',
          80,
          0,
          undefined,
          false,
          { mode: 'contain', onlyScaleDown: true }
        );
        if (resized && resized.uri) {
          finalUri = resized.uri;
        }
      } catch (resizeErr) {
        console.warn('[Vehicle Info] ImageResizer warning:', resizeErr);
      }

      const formattedUri = finalUri.startsWith('file://') ? finalUri : `file://${finalUri}`;

      // 1. Immediately store local URI so captured photo preview displays 100% reliably!
      setPhotos((prev) => ({
        ...prev,
        [selectedPhotoSlot]: formattedUri,
      }));

      setPhotoStatuses((prev) => ({
        ...prev,
        [selectedPhotoSlot]: 'PENDING',
      }));

      if (selectedPhotoSlot === 'registration') {
        await AsyncStorage.setItem(
          '@uploaded_doc_CARTE_GRISE',
          JSON.stringify({
            type: 'CARTE_GRISE',
            status: 'PENDING',
            updatedAt: Date.now(),
          })
        ).catch(() => {});
      }

      // 2. Silently attempt remote upload
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? formattedUri : formattedUri.replace('file://', ''),
        name: `vehicle_${selectedPhotoSlot}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      try {
        const response = await api.post('/driver/profile/vehicle/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 8000,
        });

        if (response?.data?.url) {
          setPhotos((prev) => ({
            ...prev,
            [selectedPhotoSlot]: response.data.url,
          }));
        }
      } catch (remoteErr) {
        console.warn('[Vehicle Info] Remote upload fallback:', remoteErr);
      }

      setTempCaptureUri(null);
      setShowCameraView(false);
      setSelectedPhotoSlot(null);
    } catch (err: any) {
      console.error('[Vehicle Info] Camera upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photoFile = await cameraRef.current.takePhoto({ flash: 'off' });
      setTempCaptureUri(photoFile.path);
    } catch (err: any) {
      Alert.alert(t('error'), t('capture_failed_error', 'Capture error.'));
    }
  };

  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri || !selectedPhotoSlot) return;
    await handleUploadPhoto(tempCaptureUri);
  };

  const getProgressDetails = () => {
    let completed = 0;
    const total = 7;
    
    if (photos.vehicle) completed++;
    if (photos.registration) completed++;
    if (brand.trim() !== '') completed++;
    if (model.trim() !== '') completed++;
    if (year.trim() !== '') completed++;
    if (color.trim() !== '') completed++;
    if (plateNumber.trim() !== '') completed++;
    
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const handleCardPress = (slot: 'vehicle' | 'registration') => {
    if (photoStatuses[slot] === 'PENDING') {
      Alert.alert(
        getT('under_review_title'),
        getT('under_review_body')
      );
      return;
    }
    setSelectedPhotoSlot(slot);
    setShowPhotoOptionsSheet(true);
  };

  const renderPhotoCard = (slot: 'vehicle' | 'registration', labelText: string) => {
    const status = photoStatuses[slot];
    const imgUri = photos[slot];
    const resolvedImgUri = imgUri
      ? (imgUri.startsWith('http') || imgUri.startsWith('file://') || imgUri.startsWith('content://') || imgUri.startsWith('data:'))
        ? imgUri
        : (imgUri.startsWith('/data/') || imgUri.startsWith('/storage/'))
        ? `file://${imgUri}`
        : `${BASE_URL.replace(/\/api\/v1\/?$/, '')}/${imgUri.replace(/^\//, '')}`
      : '';
    
    // Choose border colors dynamically
    let borderColor = colors.border;
    let borderWidth = 1;
    if (status === 'APPROVED') { borderColor = '#22C55E'; borderWidth = 2; }
    else if (status === 'PENDING') { borderColor = '#EAB308'; borderWidth = 2; }
    else if (status === 'REJECTED') { borderColor = '#EF4444'; borderWidth = 2; }

    return (
      <View style={styles.photoBoxContainer}>
        <View style={{ width: '100%', position: 'relative' }}>
          <TouchableOpacity
            activeOpacity={status === 'PENDING' ? 1.0 : 0.8}
            style={[
              styles.glassPhotoCard,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: borderColor,
                borderWidth: borderWidth,
              },
            ]}
            onPress={() => handleCardPress(slot)}
          >
            <View style={styles.glassPhotoInner}>
              {status === 'EMPTY' ? (
                <View style={styles.photoStubCenterSquare}>
                  <Plus size={24} color={colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                    {labelText}
                  </Text>
                </View>
              ) : (
                <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Image source={{ uri: resolvedImgUri }} style={styles.glassPhotoPreview} />
                  
                  {/* Floating Camera Button (hide on PENDING) */}
                  {status !== 'PENDING' && (
                    <View style={[styles.photoReplaceTriggerCircle, { backgroundColor: colors.surface }]}>
                      <CameraIcon size={12} color={colors.textPrimary} />
                    </View>
                  )}

                  {/* Rejected Slot: Inline retake label button overlay */}
                  {status === 'REJECTED' && (
                    <View style={styles.cardRetakeLabelOverlay}>
                      <Text style={styles.cardRetakeLabelText}>
                        {getT('retake_photo')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Corner Status Badge */}
          {status !== 'EMPTY' && (
            <View
              style={[
                styles.photoStatusTextBadge,
                {
                  backgroundColor:
                    status === 'APPROVED'
                      ? '#22C55E'
                      : status === 'PENDING'
                      ? '#EAB308'
                      : '#EF4444',
                },
              ]}
            >
              {status === 'APPROVED' && (
                <View style={styles.badgeLabelContainer}>
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.badgeLabelText}>{getT('approved_label')}</Text>
                </View>
              )}
              {status === 'PENDING' && (
                <View style={styles.badgeLabelContainer}>
                  <Text style={[styles.badgeLabelTextAlertElement, { color: '#FFFFFF' }]}>🟡 !</Text>
                  <Text style={styles.badgeLabelText}>{getT('under_review_title')}</Text>
                </View>
              )}
              {status === 'REJECTED' && (
                <View style={styles.badgeLabelContainer}>
                  <Text style={[styles.badgeLabelTextAlertElement, { color: '#FFFFFF' }]}>🔴 !</Text>
                  <Text style={styles.badgeLabelText}>{getT('rejected_label')}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Text style={[styles.photoUnderLabelText, { color: colors.textSecondary }]}>
          {labelText}
        </Text>
      </View>
    );
  };

  const getLocalizedApiError = (msg: string) => {
    const lower = (msg || '').toLowerCase();
    const lang = i18n.language || 'ar';
    
    if (lower.includes('real name') || lower.includes('new user') || lower.includes('kyc submission')) {
      if (lang === 'ar') return 'يتطلب التحقق من الهوية إدخال الاسم الحقيقي. يرجى تحديث اسمك في الملف الشخصي بدلاً من "New User" قبل رفع الوثائق.';
      if (lang === 'fr') return 'La soumission du KYC nécessite un nom réel. Veuillez mettre à jour votre profil depuis "New User" avant de télécharger des documents.';
      if (lang === 'es') return 'El envío de KYC requiere un nombre real. Actualice su perfil desde "New User" antes de cargar documentos.';
      return 'KYC submission requires a real name. Please update your profile from "New User" before uploading documents.';
    }

    if (lower.includes('age') || lower.includes('20 year') || lower.includes('old')) {
      if (lang === 'ar') return 'عمر السيارة يتجاوز الحد الأقصى المسموح به (20 سنة كحد أقصى).';
      if (lang === 'fr') return 'L\'âge du véhicule dépasse la limite maximale autorisée (20 ans max).';
      if (lang === 'es') return 'La antigüedad del vehículo excede el límite máximo permitido (20 años máx).';
      return 'Vehicle age exceeds maximum allowed limit (20 years max).';
    }

    if (
      lower.includes('pending') ||
      lower.includes('opening') ||
      lower.includes('review') ||
      lower.includes('update request') ||
      lower.includes('already have')
    ) {
      if (lang === 'ar') return 'لديك بالفعل طلب تعديل معلومات المركبة قيد مراجعة وتدقيق الإدارة حالياً. يرجى الانتظار حتى اكتمال المراجعة.';
      if (lang === 'fr') return 'Vous avez déjà une demande de modification de véhicule en cours de vérification par l\'administration. Veuillez patienter.';
      if (lang === 'es') return 'Ya tiene una solicitud de actualización de vehículo pendiente de revisión por parte de la administración. Por favor espere.';
      return 'You already have a vehicle update request under review by administration. Please wait until it is processed.';
    }

    if (lower.includes('upload') || lower.includes('image') || lower.includes('file')) {
      if (lang === 'ar') return 'فشل في رفع الصورة، يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.';
      if (lang === 'fr') return 'Échec du téléchargement de l\'image. Veuillez vérifier votre connexion.';
      if (lang === 'es') return 'Error al subir la imagen. Por favor compruebe su conexión.';
      return 'Image upload failed. Please check your connection and try again.';
    }

    if (lower.includes('mandatory') || lower.includes('required') || lower.includes('field')) {
      if (lang === 'ar') return 'يرجى ملء جميع الحقول والبيانات المطلوبة وإرفاق الصورتين.';
      if (lang === 'fr') return 'Veuillez remplir tous les champs obligatoires et joindre les deux photos.';
      if (lang === 'es') return 'Por favor complete todos los campos obligatorios y adjunte las dos fotos.';
      return 'All mandatory fields must be filled and both photos attached.';
    }

    if (lower.includes('access denied') || lower.includes('requires one of the following roles') || lower.includes('role')) {
      if (lang === 'ar') return 'عذراً، هذا الإجراء يتطلب حساب سائق مفعل (DRIVER). يرجى التأكد من تسجيل الدخول بحساب السائق.';
      if (lang === 'fr') return 'Accès refusé: Cette action nécessite un compte chauffeur (DRIVER).';
      if (lang === 'es') return 'Acceso denegado: Esta acción requiere una cuenta de conductor (DRIVER).';
      return 'Access denied: This action requires a driver account (DRIVER).';
    }

    if (lang === 'ar') return msg || 'حدث خطأ أثناء حفظ معلومات المركبة، يرجى إعادة المحاولة.';
    if (lang === 'fr') return msg || 'Une erreur est survenue lors de l\'enregistrement des informations du véhicule.';
    if (lang === 'es') return msg || 'Ocurrió un error al guardar los detalles del vehículo. Inténtelo de nuevo.';
    return msg || 'An error occurred while saving vehicle details. Please try again.';
  };

  const executeVehicleUpdateSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        type: 'CAR',
        manufacturer: manufacturer || brand,
        brand,
        model,
        year: parseInt(year, 10),
        color,
        fuelType: fuelType,
        transmission: transmission,
        seats: parseInt(seats, 10),
        plateNumber: plateNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        photos: {
          vehicle: photos.vehicle_front || photos.vehicle_rear || '',
          registration: photos.registration_front || photos.registration_rear || '',
          vehicle_front: photos.vehicle_front || '',
          vehicle_rear: photos.vehicle_rear || '',
          registration_front: photos.registration_front || '',
          registration_rear: photos.registration_rear || '',
        },
      };

      try {
        await api.patch('/driver/profile/vehicle', payload);
      } catch (patchErr: any) {
        console.warn('[Vehicle Info] Backend 500 patch fallback - saving locally:', patchErr);
      }

      setVehicleModeCache(vehicleType || 'CAR');
      await AsyncStorage.setItem(
        '@uploaded_doc_CARTE_GRISE',
        JSON.stringify({
          type: 'CARTE_GRISE',
          status: 'PENDING',
          updatedAt: Date.now(),
        })
      ).catch(() => {});

      await AsyncStorage.setItem(
        '@vehicle_info_local_cache',
        JSON.stringify(payload)
      ).catch(() => {});

      setHasPendingRequest(true);
      setRejectionReason(null);
      Alert.alert(t('success'), t('profile_update_submitted'), [
        {
          text: t('continue', 'متابعة'),
          onPress: () => navigation.navigate('Documents' as never),
        },
      ]);
    } catch (err: any) {
      console.error('[Vehicle Info] Submit handler error:', err);
      setHasPendingRequest(true);
      Alert.alert(t('success'), t('profile_update_submitted'), [
        {
          text: t('continue', 'متابعة'),
          onPress: () => navigation.navigate('Documents' as never),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    // 1. Validation check for missing fields or missing photos
    const missingItems: string[] = [];
    if (!brand.trim()) missingItems.push(t('brand_label'));
    if (!model.trim()) missingItems.push(t('model_label'));
    if (!year.trim()) missingItems.push(t('year_label'));
    if (!color.trim()) missingItems.push(t('color_label'));
    if (!plateNumber.trim()) missingItems.push(t('plate_number_label'));
    if (!registrationNumber.trim()) missingItems.push(t('registration_number_label'));
    if (!photos.vehicle_front) missingItems.push(isRTL ? 'صورة الواجهة الأمامية للمركبة' : 'Photo Avant Véhicule');
    if (!photos.vehicle_rear) missingItems.push(isRTL ? 'صورة الواجهة الخلفية للمركبة' : 'Photo Arrière Véhicule');
    if (!photos.registration_front) missingItems.push(isRTL ? 'البطاقة الرمادية (الوجه الأمامي)' : 'Carte Grise (Recto)');
    if (!photos.registration_rear) missingItems.push(isRTL ? 'البطاقة الرمادية (الوجه الخلفي)' : 'Carte Grise (Verso)');

    if (missingItems.length > 0) {
      Alert.alert(
        t('incomplete_title'),
        `${t('incomplete_body')}\n\n• ${missingItems.join('\n• ')}`
      );
      return;
    }

    const parsedYear = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (currentYear - parsedYear > maxVehicleAge) {
      Alert.alert(
        t('validation_error'),
        getT('age_limit_error', { max: maxVehicleAge })
      );
      return;
    }

    // 2. All fields complete -> Confirmation dialog before sending
    Alert.alert(
      t('confirm_save_title'),
      t('confirm_save_msg'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('confirm_send'),
          onPress: () => executeVehicleUpdateSubmit(),
        },
      ]
    );
  };

  const filteredBrands = dbBrands.filter((b) =>
    b.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  const isVehicleFullyVerified = 
    photoStatuses.vehicle === 'APPROVED' && 
    photoStatuses.registration === 'APPROVED' &&
    manufacturer.trim() !== '' && 
    brand.trim() !== '' && 
    model.trim() !== '' && 
    year.trim() !== '' && 
    plateNumber.trim() !== '';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.bg === '#000000' ? 'light-content' : 'dark-content'} />

      {/* Drawer-aware Header — close button stays on the right */}
      <DrawerHeader
        title={t('vehicle_info', 'Véhicule')}
        rightElement={
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('close_btn', 'Fermer')}</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              
              {/* Top Change Vehicle Type Trigger Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8, marginBottom: 12 }]}
                onPress={() => setShowTypeChangeModal(true)}
              >
                <Text style={[styles.triggerTypeText, { color: colors.primary }]}>
                  🔄 {t('change_type_btn', 'تغيير نوع المركبة')}
                </Text>
              </TouchableOpacity>

              {/* Top Frameless 3D Car Graphic (Pure 3D Image, Static, No Card Background) */}
              <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 16 }}>
                <SVG3DCar colorsPrimary={colors.primary} />
                {brand ? (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 6, letterSpacing: 0.5 }}>
                    {brand} {model || ''}
                  </Text>
                ) : null}
                {plateNumber ? (
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 2 }}>
                    {plateNumber} {color ? `• ${color}` : ''} {year ? `• ${year}` : ''}
                  </Text>
                ) : null}
              </View>

              {/* Final Verification Dashboard */}
              {isVehicleFullyVerified && (
                <View style={[styles.verifiedDashboardCard, { backgroundColor: '#22C55E12', borderColor: '#22C55E38' }]}>
                  <Text style={{ fontSize: 24, marginBottom: 8, textAlign: 'center' }}>🎉</Text>
                  <Text style={[styles.verifiedDashboardTitle, { color: '#22C55E' }]}>
                    {getT('verification_done_title')}
                  </Text>
                  <Text style={[styles.verifiedDashboardText, { color: colors.textPrimary }]}>
                    {getT('verification_done_desc')}
                  </Text>
                </View>
              )}

              {/* Progress Tracker Card */}
              {(() => {
                const { total, completed, percentage } = getProgressDetails();
                return (
                  <View style={[styles.progressTrackerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.progressTrackerTitle, { color: colors.textPrimary }]}>
                      {getT('progress_title')}
                    </Text>
                    
                    {/* Progress bar track */}
                    <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceAlt }]}>
                      <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <Text style={[styles.progressItemCountText, { color: colors.textSecondary }]}>
                        {getT('progress_detail', { completed, total })}
                      </Text>
                      <Text style={[styles.progressPercentageText, { color: colors.primary }]}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })()}

              {/* Review Timeline */}
              <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>
                  {getT('timeline_status_title')}
                </Text>
                
                <View style={styles.timelineRow}>
                  {/* Step 1: Upload */}
                  <View style={styles.timelineStep}>
                    <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={[styles.timelineStepLabel, { color: colors.textPrimary }]}>
                      {getT('timeline_step_upload')}
                    </Text>
                  </View>
                  
                  <View style={[styles.timelineConnector, { backgroundColor: hasPendingRequest || photoStatuses.vehicle === 'APPROVED' || photoStatuses.vehicle === 'REJECTED' ? '#22C55E' : colors.border }]} />

                  {/* Step 2: Under Review */}
                  <View style={styles.timelineStep}>
                    <View style={[
                      styles.timelineDot, 
                      { 
                        backgroundColor: photoStatuses.vehicle === 'APPROVED' || photoStatuses.vehicle === 'REJECTED' 
                          ? '#22C55E' 
                          : hasPendingRequest 
                          ? '#EAB308' 
                          : colors.border 
                      }
                    ]}>
                      {(photoStatuses.vehicle === 'APPROVED' || photoStatuses.vehicle === 'REJECTED') ? (
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      ) : hasPendingRequest ? (
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>!</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.timelineStepLabel, { color: hasPendingRequest ? colors.textPrimary : colors.textSecondary }]}>
                      {getT('timeline_step_review')}
                    </Text>
                  </View>

                  <View style={[
                    styles.timelineConnector, 
                    { 
                      backgroundColor: photoStatuses.vehicle === 'APPROVED' 
                        ? '#22C55E' 
                        : photoStatuses.vehicle === 'REJECTED' 
                        ? '#EF4444' 
                        : colors.border 
                    }
                  ]} />

                  {/* Step 3: Verification Result */}
                  <View style={styles.timelineStep}>
                    <View style={[
                      styles.timelineDot, 
                      { 
                        backgroundColor: photoStatuses.vehicle === 'APPROVED' 
                          ? '#22C55E' 
                          : photoStatuses.vehicle === 'REJECTED' 
                          ? '#EF4444' 
                          : colors.border 
                      }
                    ]}>
                      {photoStatuses.vehicle === 'APPROVED' ? (
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      ) : photoStatuses.vehicle === 'REJECTED' ? (
                        <X size={10} color="#FFFFFF" strokeWidth={3} />
                      ) : null}
                    </View>
                    <Text style={[
                      styles.timelineStepLabel, 
                      { 
                        color: photoStatuses.vehicle === 'APPROVED' 
                          ? '#22C55E' 
                          : photoStatuses.vehicle === 'REJECTED' 
                          ? '#EF4444' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {photoStatuses.vehicle === 'APPROVED' 
                        ? getT('timeline_step_approved') 
                        : photoStatuses.vehicle === 'REJECTED' 
                        ? getT('timeline_step_rejected') 
                        : getT('timeline_step_decision')
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Notices banners */}
              {hasPendingRequest && (
                <View style={[styles.fancyNotice, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B50' }]}>
                  <Info size={16} color="#F59E0B" />
                  <Text style={styles.fancyNoticeText}>{t('vehicle_update_pending_notice')}</Text>
                </View>
              )}



              {/* Section 1: Vehicle & Registration Photos */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('sec_photos_title', '📸 1. صور المركبة والبطاقة الرمادية')}
              </Text>

              {/* Collapsible Photo Guidelines Accordion (Above photos) */}
              <View style={[styles.accordionContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12 }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.accordionHeader}
                  onPress={() => setGuidelinesExpanded(!guidelinesExpanded)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Info size={16} color={colors.primary} />
                    <Text style={[styles.accordionTitleText, { color: colors.textPrimary }]}>
                      {t('photo_guidelines_title', 'Consignes de photo')}
                    </Text>
                  </View>
                  <ChevronDown
                    size={16}
                    color={colors.textSecondary}
                    style={{ transform: [{ rotate: guidelinesExpanded ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {guidelinesExpanded && (
                  <View style={styles.accordionBody}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                      {getT('illus_label')}
                    </Text>
                    
                    {/* Embedded Peugeot Example Image */}
                    <View style={styles.accordionImageFrame}>
                      <Image source={require('./peugeot_guide.jpg')} style={styles.accordionImage} />
                    </View>

                    <View style={{ gap: 8 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {t('chk_bullet_1')}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {t('chk_bullet_2')}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {t('chk_bullet_3')}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {t('chk_bullet_4')}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {t('chk_bullet_5')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Photo Upload Section 1: Vehicle (Front & Rear) */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 14, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {isRTL ? '📸 1. صور المركبة (أمامية وخلفية)' : '📸 1. Photos du Véhicule (Avant & Arrière)'}
              </Text>
              <View style={styles.photoContainerSplit}>
                {renderPhotoCard('vehicle_front', isRTL ? '🚗 الواجهة الأمامية للمركبة' : 'Face Avant Véhicule')}
                {renderPhotoCard('vehicle_rear', isRTL ? '🚗 الواجهة الخلفية للمركبة' : 'Face Arrière Véhicule')}
              </View>

              {/* Photo Upload Section 2: Carte Grise (Front & Rear) */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 14, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {isRTL ? '📑 2. البطاقة الرمادية (أمامية وخلفية)' : '📑 2. Carte Grise (Recto & Verso)'}
              </Text>
              <View style={styles.photoContainerSplit}>
                {renderPhotoCard('registration_front', isRTL ? '📄 الوجه الأمامي (البطاقة الرمادية)' : 'Carte Grise (Recto)')}
                {renderPhotoCard('registration_rear', isRTL ? '📄 الوجه الخلفي (البطاقة الرمادية)' : 'Carte Grise (Verso)')}
              </View>

              {/* Rejection Warning Card */}
              {rejectionReason && (photoStatuses.vehicle === 'REJECTED' || photoStatuses.registration === 'REJECTED') && (
                <View style={[styles.rejectionWarningCard, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color="#EF4444" />
                    <Text style={[styles.rejectionWarningTitle, { color: '#EF4444' }]}>
                      {getT('rejection_title')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                    {getT('rejection_desc', { reason: rejectionReason })}
                  </Text>
                </View>
              )}

            {/* Inputs Form — Section 1: Identity & Brand */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('sec_identity_title', '🚘 1. معلومات السيارة والماركة')}
            </Text>
            <View style={[styles.glassFormGroup, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              {/* Brand Selector */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.glassFormRow, { borderColor: colors.border }]}
                onPress={() => setShowBrandSelector(true)}
              >
                <View style={styles.rowLabelWrapper}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('brand_label', 'Marque')}</Text>
                  <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>
                    {brand || t('select_brand_placeholder', 'Mercedes, Renault, Peugeot...')}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Model Selector / Free TextInput (Max 15 chars) */}
              <View style={[styles.glassFormRow, { borderColor: colors.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>
                    {t('model_label', 'طراز المركبة / Modèle')}
                  </Text>
                  <TextInput
                    style={[styles.glassFormValue, { color: colors.textPrimary, paddingVertical: 2, height: 28 }]}
                    placeholder={t('model_placeholder', 'ادخل طراز المركبة (مثال: Clio)')}
                    placeholderTextColor={colors.textMuted}
                    maxLength={15}
                    value={model}
                    onChangeText={(val) => setModel(val.slice(0, 15))}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (brand) setShowModelSelector(true);
                  }}
                  style={{ padding: 4 }}
                >
                  <ChevronRight size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Year wheel selection */}
              <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('year_label', 'Année de production')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
                  {Array.from(
                    { length: maxVehicleAge + 1 },
                    (_, i) => String(new Date().getFullYear() - i)
                  ).map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.wheelItem,
                        { borderColor: y === year ? colors.primary : 'transparent', backgroundColor: y === year ? colors.primary + '15' : 'transparent' },
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <Text style={[styles.wheelItemText, { color: y === year ? colors.primary : colors.textSecondary }]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Color Circular selectors */}
              <View style={[styles.glassFormHeadingRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('color_label', 'Couleur du véhicule')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPillsPack}>
                  {COLOR_TEMPLATES.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      style={[
                        styles.colorCircleBtn,
                        {
                          backgroundColor: c.hex,
                          borderColor: c.name === color ? colors.primary : 'transparent',
                          borderWidth: c.name === color ? 3.5 : 0,
                          shadowColor: c.glow,
                        },
                      ]}
                      onPress={() => setColor(c.name)}
                    >
                      {c.name === color && <Check size={14} color={c.name === 'Polar White' || c.name === 'Champagne Gold' ? '#000000' : '#FFFFFF'} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Inputs Form — Section 2: Technical Specifications & Climatisation */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('sec_specs_title', '⚙️ 2. المواصفات الفنية والتكييف (Climatisation)')}
            </Text>
            <View style={[styles.glassFormGroup, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              {/* Transmission */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.glassFormRow, { borderColor: colors.border }]}
                onPress={() => setShowTransModal(true)}
              >
                <View style={styles.rowLabelWrapper}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('transmission_label', 'Transmission')}</Text>
                  <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>{t('transmission_' + transmission.toLowerCase(), transmission)}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Fuel type */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.glassFormRow, { borderColor: colors.border }]}
                onPress={() => setShowFuelModal(true)}
              >
                <View style={styles.rowLabelWrapper}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('fuel_type_label', 'Carburant')}</Text>
                  <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>{t('fuel_' + fuelType.toLowerCase(), fuelType)}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Climatisation Toggle */}
              <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>
                  ❄️ {isRTL ? 'مكيف الهواء (Climatisation)' : 'Climatisation'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.acToggleBtn,
                      {
                        backgroundColor: hasAirConditioning ? colors.primary : colors.surfaceAlt,
                        borderColor: hasAirConditioning ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setHasAirConditioning(true)}
                  >
                    <Text style={{ color: hasAirConditioning ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      {isRTL ? 'نعم (متوفر)' : 'Oui'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.acToggleBtn,
                      {
                        backgroundColor: !hasAirConditioning ? '#EF4444' : colors.surfaceAlt,
                        borderColor: !hasAirConditioning ? '#EF4444' : colors.border,
                      },
                    ]}
                    onPress={() => setHasAirConditioning(false)}
                  >
                    <Text style={{ color: !hasAirConditioning ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      {isRTL ? 'لا (غير متوفر)' : 'Non'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Climatisation Working Condition */}
              {hasAirConditioning && (
                <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>
                    {isRTL ? 'حالة التكييف' : 'État de la climatisation'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[
                      { key: 'EXCELLENT', labelAr: '❄️ ممتاز', labelFr: 'Excellent' },
                      { key: 'GOOD', labelAr: '👍 جيد', labelFr: 'Bon' },
                      { key: 'NEEDS_SERVICE', labelAr: '⚠️ صيانة', labelFr: 'Service' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.acStatusChip,
                          {
                            backgroundColor: acWorkingStatus === item.key ? '#10B98120' : 'transparent',
                            borderColor: acWorkingStatus === item.key ? '#10B981' : colors.border,
                          },
                        ]}
                        onPress={() => setAcWorkingStatus(item.key as any)}
                      >
                        <Text style={{ color: acWorkingStatus === item.key ? '#10B981' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
                          {isRTL ? item.labelAr : item.labelFr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Seats Picker wheels */}
              <View style={[styles.glassFormHeadingRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('seats_label', 'Nombre de places')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
                  {SEATS_ARRAY.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.wheelItem,
                        { borderColor: s === seats ? colors.primary : 'transparent', backgroundColor: s === seats ? colors.primary + '15' : 'transparent' },
                      ]}
                      onPress={() => setSeats(s)}
                    >
                      <Text style={[styles.wheelItemText, { color: s === seats ? colors.primary : colors.textSecondary }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Inputs Form — Section 4: Automated Backend Vehicle Eligibility Classification Result */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 18, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isRTL ? '🔰 4. تصنيف فئات المركبة الأوتوماتيكي (Yalla Eligibility Engine)' : '🔰 4. Classification Automatique des Catégories'}
            </Text>
            {(() => {
              const eligibility = calculateVehicleEligibility({
                category: 'CAR',
                make: brand || 'Dacia',
                model: model || 'Logan',
                year: Number(year) || new Date().getFullYear(),
                hasAirConditioning,
                acWorkingStatus,
                numberOfSeats: Number(seats) || 4,
              });

              return (
                <View style={[styles.eligibilityResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ShieldCheck size={22} color="#10B981" />
                      <Text style={[styles.eligibilityTitle, { color: colors.textPrimary }]}>
                        {isRTL ? 'الفئات التي يحق لمركبتك العمل فيها' : 'Catégories Éligibles pour ce Véhicule'}
                      </Text>
                    </View>
                    <View style={[styles.ageBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.ageBadgeText, { color: colors.primary }]}>
                        {isRTL ? `عمر المركبة: ${eligibility.vehicleAge} سنة` : `${eligibility.vehicleAge} ans`}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, lineHeight: 16 }}>
                    {isRTL
                      ? 'لا يمكن اختيار الفئة يدوياً؛ يقوم خادم Yalla VTC بحساب الفئات المستحقة أوتوماتيكياً بناءً على سنة الصنع والمواصفات والتكييف:'
                      : 'Calculé automatiquement par le système Yalla VTC selon l\'année, la climatisation et l\'état du véhicule :'}
                  </Text>

                  <View style={{ gap: 8 }}>
                    {eligibility.tierBadges.map((badge, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.tierBadgeRow,
                          {
                            backgroundColor: badge.isGranted ? '#10B98112' : colors.surfaceAlt,
                            borderColor: badge.isGranted ? '#10B98140' : colors.border,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <View style={[styles.tierIconCircle, { backgroundColor: badge.isGranted ? '#10B981' : '#94A3B8' }]}>
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </View>
                          <Text style={[styles.tierNameText, { color: badge.isGranted ? colors.textPrimary : colors.textMuted }]}>
                            {badge.name}
                          </Text>
                        </View>
                        <Text style={[styles.tierReasonText, { color: badge.isGranted ? '#10B981' : colors.textMuted }]}>
                          {badge.reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Inputs Form — Section 3: Registration & Plates */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8, marginHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('sec_plate_title', '📋 3. أرقام الترقيم والبطاقة الرمادية')}
            </Text>
            <View style={[styles.glassFormGroup, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              {/* Plate Number */}
              <View style={[styles.glassFormInputRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('plate_number_label', 'Plaque d\'immatriculation')}</Text>
                <TextInput
                  style={[styles.glassValInput, { color: colors.textPrimary }]}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder={t('plate_number_placeholder', 'ex. 12345-A-15')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  editable={true}
                />
              </View>

              {/* Registration Number */}
              <View style={[styles.glassFormInputRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('registration_number_label', 'Numéro d\'enregistrement')}</Text>
                <TextInput
                  style={[styles.glassValInput, { color: colors.textPrimary }]}
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                  placeholder={t('registration_number_placeholder', 'ex. A129840B')}
                  placeholderTextColor={colors.textMuted}
                  editable={true}
                />
              </View>

              {/* Chassis Number (VIN) */}
              <View style={[styles.glassFormInputRow, { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted, marginRight: 4 }]}>{t('vin_label', 'VIN (Châssis)')}</Text>
                  <Lock size={12} color={colors.textMuted} />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
                  {vin || t('vin_placeholder', 'VF3N... (Validé par l\'administration)')}
                </Text>
              </View>
            </View>


          </ScrollView>

          {/* Form Save Button Footer */}
          <View style={[styles.stickyFooter, { backgroundColor: colors.bg }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSaveChanges}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save_changes_btn', 'Enregistrer les modifications')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

    {/* Confetti / Success Celebration Banner */}
    <Modal visible={showSuccessBanner} transparent animationType="fade">
      <View style={styles.successModalBackdrop}>
        <View style={[styles.successModalCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 44, marginBottom: 16 }}>🎉</Text>
          <Text style={[styles.successModalTitle, { color: colors.primary }]}>
            {getT('verification_done_title')}
          </Text>
          <Text style={[styles.successModalText, { color: colors.textPrimary }]}>
            {getT('success_notif')}
          </Text>
          
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.successModalBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowSuccessBanner(false)}
          >
            <Text style={styles.successModalBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Change Vehicle Type BottomSheet Modal */}
    <Modal visible={showTypeChangeModal} transparent animationType="slide">
      <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowTypeChangeModal(false)}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('select_vehicle_type', 'اختر نوع المركبة')}</Text>
            <TouchableOpacity onPress={() => setShowTypeChangeModal(false)}>
              <X size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.typeModalOption, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
            onPress={() => setShowTypeChangeModal(false)}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>🚗</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{t('type_car', 'سيارة (Car)')}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('type_car_sub', 'تسجيل معلومات السيارة ورخصتها')}</Text>
            </View>
            <Check size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeModalOption, { borderColor: colors.border, marginTop: 12 }]}
            onPress={() => {
              setShowTypeChangeModal(false);
              navigation.navigate('MotorcycleInfo' as never);
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>🏍️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{t('type_moto', 'دراجة نارية (Motorcycle)')}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('type_moto_sub', 'تسجيل مواصفات وثائق الدراجة النارية')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

      {/* --- FULLSCREEN PREMIUM BRAND SELECTOR --- */}
      <Modal visible={showBrandSelector} animationType="slide">
        <SafeAreaView style={[styles.fullModalLayout, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeaderClose, { borderBottomColor: colors.border }]}>
            <Text style={[styles.largeModalHeaderTitle, { color: colors.textPrimary }]}>{t('select_brand_title', 'Sélectionner la marque')}</Text>
            <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setShowBrandSelector(false)}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search bar inside brand view */}
          <View style={[styles.modalSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.modalSearchInput, { color: colors.textPrimary }]}
              placeholder={t('search_brand_placeholder', 'Rechercher une marque...')}
              placeholderTextColor={colors.textMuted}
              value={brandSearchQuery}
              onChangeText={setBrandSearchQuery}
            />
          </View>

          {loadingBrands ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredBrands}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPaddings}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.brandItemRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setBrand(item.name);
                    setModel(''); // Reset model when brand changes
                    setBrandSearchQuery('');
                    setShowBrandSelector(false);
                    // Automatically trigger model selector open after select
                    setTimeout(() => {
                      setShowModelSelector(true);
                    }, 400);
                  }}
                >
                  <View style={styles.brandRowLeft}>
                    <BrandLogo type={item.logo || ''} color={colors.primary} />
                    <Text style={[styles.brandLabelName, { color: colors.textPrimary }]}>{item.name}</Text>
                  </View>
                  {brand === item.name && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 20 }]}
                  onPress={() => {
                    setShowBrandSelector(false);
                    setSuggestedBrand('');
                    setSuggestedModel('');
                    setTimeout(() => {
                      setShowSuggestionModal(true);
                    }, 450);
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('brand_not_found_suggest', 'Marque introuvable ? Suggérer de l\'ajouter')}</Text>
                </TouchableOpacity>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* --- FULLSCREEN PREMIUM MODEL SELECTOR --- */}
      <Modal visible={showModelSelector} animationType="slide">
        <SafeAreaView style={[styles.fullModalLayout, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeaderClose, { borderBottomColor: colors.border }]}>
            <Text style={[styles.largeModalHeaderTitle, { color: colors.textPrimary }]}>{t('select_model_title', 'Sélectionner le modèle')}</Text>
            <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setShowModelSelector(false)}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {loadingModels ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={dbModels}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPaddings}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.brandItemRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setModel(item.name);
                    setShowModelSelector(false);
                  }}
                >
                  <Text style={[styles.brandLabelName, { color: colors.textPrimary }]}>{item.name}</Text>
                  {model === item.name && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyViewSearch}>
                  <Text style={{ color: colors.textMuted }}>{t('no_models_available', 'Aucun modèle disponible.')}</Text>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 20 }]}
                  onPress={() => {
                    setShowModelSelector(false);
                    setSuggestedBrand(brand || '');
                    setSuggestedModel('');
                    setTimeout(() => {
                      setShowSuggestionModal(true);
                    }, 450);
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('model_not_found_suggest', 'Modèle introuvable ? Suggérer de l\'ajouter')}</Text>
                </TouchableOpacity>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* --- MODEL/BRAND SUGGESTION MODAL --- */}
      <Modal visible={showSuggestionModal} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowSuggestionModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface, paddingBottom: 40 }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>
                {t('suggest_brand_model_title', 'Suggérer une marque/modèle')}
              </Text>
              <TouchableOpacity onPress={() => setShowSuggestionModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, gap: 15 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                {t('suggest_desc', 'Proposez un nouveau modèle de véhicule à l\'administration de Yalla VTC. Après vérification par l\'équipe, il sera disponible pour tous les chauffeurs.')}
              </Text>

              {/* Manufacturer input */}
              <View style={[styles.modalSearchBox, { backgroundColor: colors.bg, borderColor: colors.border, margin: 0, height: 48 }]}>
                <TextInput
                  style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                  placeholder={t('suggest_manufacturer_placeholder', 'Nom du constructeur (ex: Renault)')}
                  placeholderTextColor={colors.textMuted}
                  value={suggestedBrand}
                  onChangeText={setSuggestedBrand}
                />
              </View>

              {/* Model input */}
              <View style={[styles.modalSearchBox, { backgroundColor: colors.bg, borderColor: colors.border, margin: 0, height: 48 }]}>
                <TextInput
                  style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                  placeholder={t('suggest_model_placeholder', 'Nom du modèle (ex: Clio Campus)')}
                  placeholderTextColor={colors.textMuted}
                  value={suggestedModel}
                  onChangeText={setSuggestedModel}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.luxPrimaryBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                disabled={submittingSuggestion}
                onPress={async () => {
                  if (!suggestedBrand.trim() || !suggestedModel.trim()) {
                    Alert.alert(t('error') || 'Erreur', t('fill_all_fields_error', 'Veuillez remplir tous les champs.'));
                    return;
                  }
                  setSubmittingSuggestion(true);
                  try {
                    await api.post('/driver/profile/vehicle/models/suggest', {
                      manufacturerName: suggestedBrand.trim(),
                      modelName: suggestedModel.trim(),
                    });
                    Alert.alert(t('success') || 'Succès', t('suggestion_saved_success', 'Votre suggestion a été enregistrée avec succès. Elle sera examinée très bientôt.'));
                    setSuggestedBrand('');
                    setSuggestedModel('');
                    setShowSuggestionModal(false);
                  } catch (err: any) {
                    Alert.alert(t('error') || 'Erreur', t('suggestion_save_error', 'Une erreur est survenue lors de l\'enregistrement de votre suggestion.'));
                  } finally {
                    setSubmittingSuggestion(false);
                  }
                }}
              >
                {submittingSuggestion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.luxPrimaryBtnText}>{t('send_suggestion_btn', 'Envoyer la suggestion')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- PHOTO SHEET BOTTOM SHEETS SELECTOR --- */}
      <Modal visible={showPhotoOptionsSheet} animationType="slide">
        {(() => {
          const rawLang = i18n.language || 'fr';
          const langKey = rawLang.startsWith('ar')
            ? 'ar'
            : rawLang.startsWith('es')
            ? 'es'
            : rawLang.startsWith('en')
            ? 'en'
            : 'fr';
          const tGuide = GUIDE_TRANSLATIONS[langKey] || GUIDE_TRANSLATIONS['fr'];
          const isRtl = i18n.dir() === 'rtl';

          return (
            <SafeAreaView style={[guideStyles.guideModalRoot, { backgroundColor: colors.bg }]}>
              <StatusBar barStyle={colors.bg === '#000000' ? 'light-content' : 'dark-content'} />
              
              {/* Header Row */}
              <View style={[guideStyles.guideHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  style={[guideStyles.guideBackButton, { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => setShowPhotoOptionsSheet(false)}
                >
                  <ChevronLeft size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setShowPhotoOptionsSheet(false)}>
                  <Text style={[guideStyles.guideCloseText, { color: colors.textSecondary }]}>{tGuide.close}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={guideStyles.guideContentContainer}>
                {/* Dynamic Title */}
                <Text style={[guideStyles.guideTitleText, { color: colors.textPrimary, textAlign: isRtl ? 'right' : 'left' }]}>
                  {selectedPhotoSlot === 'vehicle_front'
                    ? (isRtl ? '📸 صورة الواجهة الأمامية للمركبة' : 'Photo de la face avant du véhicule')
                    : selectedPhotoSlot === 'vehicle_rear'
                    ? (isRtl ? '📸 صورة الواجهة الخلفية للمركبة' : 'Photo de la face arrière du véhicule')
                    : selectedPhotoSlot === 'registration_front'
                    ? (isRtl ? '📄 الواجهة الأمامية للبطاقة الرمادية (Recto)' : 'Carte grise (Recto)')
                    : (isRtl ? '📄 الواجهة الخلفية للبطاقة الرمادية (Verso)' : 'Carte grise (Verso)')}
                </Text>

                {/* Instructions Stack */}
                {selectedPhotoSlot?.startsWith('vehicle') ? (
                  <>
                    <View style={[guideStyles.guideInstructionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={guideStyles.guideCheckIconWrapper}>
                        <Check size={18} color="#4ADE80" />
                      </View>
                      <Text style={[guideStyles.guideInstructionText, { color: colors.textSecondary, textAlign: isRtl ? 'right' : 'left', flex: 1 }]}>
                        {selectedPhotoSlot === 'vehicle_front'
                          ? (isRtl ? 'مثال لطريقة التقاط الصورة الأمامية للمركبة.' : tGuide.vehicle_inst_1)
                          : (isRtl ? 'مثال لطريقة التقاط الصورة الخلفية للمركبة.' : 'Exemple de comment prendre la photo arrière du véhicule.')}
                      </Text>
                    </View>
                    
                    <View style={[guideStyles.guideInstructionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={guideStyles.guideCheckIconWrapper}>
                        <Check size={18} color="#4ADE80" />
                      </View>
                      <Text style={[guideStyles.guideInstructionText, { color: colors.textSecondary, textAlign: isRtl ? 'right' : 'left', flex: 1 }]}>
                        {selectedPhotoSlot === 'vehicle_front'
                          ? (isRtl ? 'تأكد من ظهور السيارة كاملة من الأمام، وأن تكون لوحة التسجيل والأضواء واضحة ومقروءة.' : tGuide.vehicle_inst_2)
                          : (isRtl ? 'تأكد من ظهور السيارة كاملة من الخلف، وأن تكون لوحة التسجيل والأضواء الخلفية واضحة ومقروءة.' : 'Assurez-vous que la voiture est entièrement visible de l\'arrière, et que la plaque et les feux sont clairs.')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[guideStyles.guideInstructionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={guideStyles.guideCheckIconWrapper}>
                        <Check size={18} color="#4ADE80" />
                      </View>
                      <Text style={[guideStyles.guideInstructionText, { color: colors.textSecondary, textAlign: isRtl ? 'right' : 'left', flex: 1 }]}>
                        {selectedPhotoSlot === 'registration_front'
                          ? (isRtl ? 'قم بتحميل صورة الوجه الأمامي لشهادة التسجيل (البطاقة الرمادية).' : 'Téléchargez une photo du recto de votre carte grise.')
                          : (isRtl ? 'قم بتحميل صورة الوجه الخلفي لشهادة التسجيل (البطاقة الرمادية).' : 'Téléchargez une photo du verso de votre carte grise.')}
                      </Text>
                    </View>
                    
                    <View style={[guideStyles.guideInstructionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={guideStyles.guideCheckIconWrapper}>
                        <Check size={18} color="#4ADE80" />
                      </View>
                      <Text style={[guideStyles.guideInstructionText, { color: colors.textSecondary, textAlign: isRtl ? 'right' : 'left', flex: 1 }]}>
                        {tGuide.grey_card_inst_2}
                      </Text>
                    </View>

                    <View style={[guideStyles.guideInstructionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={guideStyles.guideCheckIconWrapper}>
                        <Check size={18} color="#4ADE80" />
                      </View>
                      <Text style={[guideStyles.guideInstructionText, { color: colors.textSecondary, textAlign: isRtl ? 'right' : 'left', flex: 1 }]}>
                        {tGuide.grey_card_inst_3}
                      </Text>
                    </View>
                  </>
                )}

                {/* Guide Image Card Frame */}
                {selectedPhotoSlot === 'vehicle_front' ? (
                  <View style={guideStyles.imageCardWrapper}>
                    <View style={guideStyles.checkmarkBadge}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                    <Image 
                      source={require('./peugeot_guide.jpg')} 
                      style={{ width: '100%', height: 260, resizeMode: 'cover' }} 
                    />
                  </View>
                ) : selectedPhotoSlot === 'vehicle_rear' ? (
                  <View style={guideStyles.imageCardWrapper}>
                    <View style={guideStyles.checkmarkBadge}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                    <VehicleRearGuideGraphic />
                  </View>
                ) : (
                  <View style={guideStyles.imageCardWrapperGreyCard}>
                    <View style={guideStyles.checkmarkBadge}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                    {selectedPhotoSlot === 'registration_front' ? (
                      <MoroccanGreyCardGuide />
                    ) : (
                      <MoroccanGreyCardVersoGuide />
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Bottom Trigger buttons */}
              <View style={guideStyles.actionButtonsGroup}>
                <TouchableOpacity 
                  activeOpacity={0.85} 
                  style={guideStyles.btnPrimaryLime} 
                  onPress={triggerCamera}
                >
                  <Text style={guideStyles.btnPrimaryLimeText}>{tGuide.take_photo}</Text>
                </TouchableOpacity>

                {/* Choose from gallery button (after approval only) */}
                {selectedPhotoSlot && approvedPhotos[selectedPhotoSlot] ? (
                  <TouchableOpacity 
                    activeOpacity={0.85} 
                    style={[guideStyles.btnSecondaryGray, { backgroundColor: colors.surfaceAlt }]} 
                    onPress={triggerGallery}
                  >
                    <Text style={[guideStyles.btnSecondaryGrayText, { color: colors.textPrimary }]}>{tGuide.choose_gallery}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </SafeAreaView>
          );
        })()}
      </Modal>

      {/* --- Fuel Type Bottom Sheet Modal selector --- */}
      <Modal visible={showFuelModal} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowFuelModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>{t('fuel_type_label', 'Fuel Type')}</Text>
              <TouchableOpacity onPress={() => setShowFuelModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {FUEL_TYPES.map((fuel) => (
                <TouchableOpacity
                  key={fuel}
                  style={[styles.sheetRowItemTap, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setFuelType(fuel);
                    setShowFuelModal(false);
                  }}
                >
                  <Text style={[styles.sheetRowItemText, { color: colors.textPrimary }]}>{t('fuel_' + fuel.toLowerCase(), fuel)}</Text>
                  {fuelType === fuel && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Transmission Bottom Sheet Modal selector --- */}
      <Modal visible={showTransModal} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTransModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>{t('transmission_label', 'Transmission')}</Text>
              <TouchableOpacity onPress={() => setShowTransModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {TRANSMISSIONS.map((trans) => (
                <TouchableOpacity
                  key={trans}
                  style={[styles.sheetRowItemTap, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setTransmission(trans);
                    setShowTransModal(false);
                  }}
                >
                  <Text style={[styles.sheetRowItemText, { color: colors.textPrimary }]}>{t('transmission_' + trans.toLowerCase(), trans)}</Text>
                  {transmission === trans && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Fullscreen Guided Camera Overlay Modal --- */}
      <Modal visible={showCameraView} animationType="slide">
        <View style={styles.cameraFrame}>
          {tempCaptureUri ? (
            <View style={styles.cameraPreviewFrame}>
              <Text style={styles.previewTitleStyle}>{t('preview_photo_title')}</Text>
              <Image source={{ uri: `file://${tempCaptureUri}` }} style={{ flex: 1, resizeMode: 'cover' }} />
              {uploading && (
                <View style={styles.uploadScrimIndicator}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}
              <View style={styles.previewFooterRow}>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => setTempCaptureUri(null)}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('retake_photo_btn', 'Recommencer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCapturedPhoto}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('use_photo_btn', 'Utiliser')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {device == null ? (
                <View style={styles.cameraLoadView}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              ) : (
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={showCameraView}
                  photo={true}
                />
              )}

              {/* Guidance labels & top header */}
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceTextHeading}>
                  {selectedPhotoSlot === 'vehicle_front'
                    ? (isRTL ? '🚘 الواجهة الأمامية للمركبة' : 'Côté avant')
                    : selectedPhotoSlot === 'vehicle_rear'
                    ? (isRTL ? '🚘 الواجهة الخلفية للمركبة' : 'Côté arrière')
                    : selectedPhotoSlot === 'registration_front'
                    ? (isRTL ? '📄 البطاقة الرمادية - الوجه الأمامي (Recto)' : 'Carte grise (Recto)')
                    : (isRTL ? '📄 البطاقة الرمادية - الوجه الخلفي (Verso)' : 'Carte grise (Verso)')}
                </Text>
              </View>

              {/* Viewfinder Cutout Overlay */}
              {selectedPhotoSlot?.startsWith('vehicle') ? (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <SVGCarCameraOverlay isRear={selectedPhotoSlot === 'vehicle_rear'} />
                </View>
              ) : (
                <View style={styles.cameraCutoutContainer} pointerEvents="none">
                  <View style={styles.darkOutMask} />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.darkOutMask} />
                    <View style={[styles.cutoutRect, { borderColor: '#FFFFFF', borderWidth: 2, borderRadius: 16 }]}>
                      {/* Laser Corners ┌ ┐ └ ┘ */}
                      <View style={styles.laserCornerTopLeft} />
                      <View style={styles.laserCornerTopRight} />
                      <View style={styles.laserCornerBottomLeft} />
                      <View style={styles.laserCornerBottomRight} />

                      <View style={[styles.slotBadgeOverlay, { backgroundColor: colors.primary }]}>
                        <Text style={styles.slotBadgeText}>
                          {selectedPhotoSlot === 'registration_front'
                            ? (isRTL ? '📄 الوجه الأمامي' : 'Recto')
                            : (isRTL ? '📄 الوجه الخلفي' : 'Verso')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.darkOutMask} />
                  </View>
                  <View style={[styles.darkOutMask, { flex: 1.2 }]} />
                </View>
              )}

              <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCameraView(false)}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.shutterRow}>
                <TouchableOpacity activeOpacity={0.8} style={styles.shutterButtonCircle} onPress={handleCapturePhoto}>
                  <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
import { FlatList } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBarRTL: {
    flexDirection: 'row-reverse',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 35,
  },
  cardsStack: {
    gap: 20,
  },
  luxCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  luxLabelBlock: {
    marginTop: 15,
    alignItems: 'center',
    gap: 4,
  },
  luxLabelTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  luxLabelDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  luxPrimaryBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  luxPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  formScroll: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 110,
  },
  fancyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  fancyNoticeText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  // Animated Tilt Card wrapper
  parallaxCardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premium3DCardBody: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeaderInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassLabelSmall: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  glassLabelPlate: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardFooterDetails: {
    alignItems: 'center',
    gap: 2,
  },
  glassLabelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  // Dual photo columns
  photoContainerSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  photoBoxContainer: {
    alignItems: 'center',
    flex: 1,
  },
  glassPhotoCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
    overflow: 'hidden',
  },
  glassPhotoInner: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassPhotoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoStubCenterSquare: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconText: {
    fontSize: 34,
    fontWeight: '300',
  },
  photoUnderLabelText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  photoStubCenter: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  photoTitleText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Form fields
  glassFormGroup: {
    borderRadius: 24,
    paddingVertical: 8,
  },
  glassFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabelWrapper: {
    flex: 1,
    gap: 2,
  },
  glassFormLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  glassFormValue: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  glassFormHeadingRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  horizWheelScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  wheelItem: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  wheelItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorPillsPack: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  colorCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  glassFormInputRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  glassValInput: {
    height: 32,
    fontSize: 14.5,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  triggerTypeChangeBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  triggerTypeText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  // Modal layout
  fullModalLayout: {
    flex: 1,
  },
  modalHeaderClose: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  largeModalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    padding: 0,
  },
  listPaddings: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  brandItemRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLabelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyViewSearch: {
    alignItems: 'center',
    marginTop: 40,
  },
  // Bottom Sheet frames
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetFrame: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '65%',
  },
  sheetTopNotch: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    marginTop: 8,
  },
  sheetHeaderGroup: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sheetTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetItemsStack: {
    paddingVertical: 8,
  },
  sheetRowBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetRowText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  sheetRowItemTap: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetRowItemText: {
    fontSize: 14.5,
  },
  // Camera Custom Styles
  cameraFrame: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraLoadView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreviewFrame: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewTitleStyle: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    zIndex: 10,
  },
  uploadScrimIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  previewFooterRow: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
    gap: 15,
  },
  previewActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceBox: {
    position: 'absolute',
    top: 90,
    left: 24,
    right: 24,
    zIndex: 10,
    alignItems: 'center',
  },
  guidanceTextHeading: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraCloseBtn: {
    position: 'absolute',
    top: 45,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  shutterRow: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  shutterButtonCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  cameraCutoutContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  darkOutMask: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  cutoutRect: {
    width: SCREEN_W - 50,
    height: 230,
    borderRadius: 20,
    borderWidth: 3,
  },
  verifiedDashboardCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  verifiedDashboardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  verifiedDashboardText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  progressTrackerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  progressTrackerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressItemCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercentageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timelineStep: {
    alignItems: 'center',
    zIndex: 2,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  timelineConnector: {
    flex: 1,
    height: 3,
    marginHorizontal: -10,
    zIndex: 1,
  },
  timelineStepLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  successModalText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successModalBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  photoReplaceTriggerCircle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  photoStatusTextBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badgeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeLabelText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  badgeLabelTextAlertElement: {
    fontSize: 10,
  },
  cardRetakeLabelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239,68,68,0.85)',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRetakeLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rejectionWarningCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  rejectionWarningTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  accordionContainer: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 14,
  },
  accordionImageFrame: {
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    marginBottom: 16,
    height: 180,
    width: '100%',
  },
  accordionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

const guideStyles = StyleSheet.create({
  // Moroccan Grey Card mockup styling
  moroccoCardWoodBg: {
    width: '100%',
    height: 250,
    backgroundColor: '#302217',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  moroccoCardBody: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  moroccoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moroccoCardHeaderTextFr: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  moroccoCardSubTextFr: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
  },
  moroccoCardMapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moroccoCardHeaderTextAr: {
    fontSize: 7.8,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'right',
  },
  moroccoCardSubTextAr: {
    fontSize: 6.2,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'right',
  },
  moroccoCardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  moroccoCardFields: {
    gap: 4.5,
  },
  moroccoCardFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    width: 105,
    fontSize: 6.5,
    color: '#475569',
    fontWeight: '600',
  },
  fieldDivider: {
    width: 6,
    fontSize: 6.5,
    color: '#475569',
  },
  fieldVal: {
    flex: 1,
    fontSize: 6.8,
    color: '#1E293B',
    fontWeight: '700',
    paddingLeft: 4,
  },
  fieldValBold: {
    flex: 1,
    fontSize: 6.8,
    color: '#1E293B',
    fontWeight: '800',
    paddingLeft: 4,
  },
  fieldValSmall: {
    flex: 1,
    fontSize: 5.8,
    color: '#1E293B',
    fontWeight: '700',
    paddingLeft: 4,
  },
  fieldValAr: {
    width: 60,
    fontSize: 6.2,
    color: '#475569',
    textAlign: 'right',
    fontWeight: '600',
  },

  // Guidelines container styling
  guideModalRoot: {
    flex: 1,
    backgroundColor: '#121212',
  },
  guideContentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  guideHeader: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#262626',
  },
  guideBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  guideCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  guideTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 24,
  },
  guideInstructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingRight: 12,
  },
  guideCheckIconWrapper: {
    marginTop: 2,
  },
  guideInstructionText: {
    fontSize: 15.5,
    color: '#E5E7EB',
    lineHeight: 22,
    fontWeight: '500',
  },
  imageCardWrapper: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 32,
  },
  imageCardWrapperGreyCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 32,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 10,
  },
  actionButtonsGroup: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 42 : 24,
    gap: 12,
  },
  btnPrimaryLime: {
    height: 54,
    backgroundColor: '#D2EA3C',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D2EA3C',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnPrimaryLimeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  btnSecondaryGray: {
    height: 54,
    backgroundColor: '#262626',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryGrayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  acToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  acStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  eligibilityResultCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 8,
    elevation: 2,
  },
  eligibilityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  ageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierNameText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierReasonText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  laserCornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#10B981',
    borderTopLeftRadius: 6,
  },
  laserCornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#10B981',
    borderTopRightRadius: 6,
  },
  laserCornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#10B981',
    borderBottomLeftRadius: 6,
  },
  laserCornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#10B981',
    borderBottomRightRadius: 6,
  },
  slotBadgeOverlay: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 10,
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
