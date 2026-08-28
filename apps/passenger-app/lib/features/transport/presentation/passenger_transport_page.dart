// lib/features/transport/presentation/passenger_transport_page.dart
// Yalla VTC — Passenger Fret & Cargo Transport Page

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../ride/services/passenger_ride_service.dart';

// ─── 4-LANGUAGE TRANSLATIONS DICTIONARY (AR, FR, EN, ES) ─────────────────────
const Map<String, Map<String, String>> kFreightTranslations = {
  'ar': {
    'pageTitle': 'الشحن والنقل',
    'selectVehicleTitle': 'أي مركبة تناسب شحنتك؟',
    'pickupLabel': 'مكان الشحن (نقطة الاستلام)',
    'dropoffLabel': 'مكان التسليم (الوجهة)',
    'timeLabel': 'وقت الاستلام',
    'timeAsap': '10 إلى 20 دقيقة',
    'time1h': 'خلال ساعة',
    'timeSched': 'جدولة التسليم',
    'cargoDescLabel': 'وصف الشحنة',
    'cargoDescHint': 'أثاث، أجهزة كهربائية، طرود وصناديق...',
    'vehicleSizeLabel': 'تأكيد حمولة ونوع المركبة',
    'optionsLabel': 'خيارات إضافية',
    'optCash': 'نقداً',
    'optHelper1': 'مساعد 1',
    'optHelper2': 'مساعدين 2',
    'optElevator': 'مصعد متوفر',
    'optPassenger': 'مع ركاب',
    'photoLabel': 'صورة الشحنة',
    'photoModalTitle': 'صورة الشحنة - اختر طريقة الإضافة',
    'takePhoto': '📷 التقاط صورة بالكاميرا',
    'chooseGallery': '🖼️ اختيار صورة من المعرض',
    'deletePhoto': '🗑️ حذف الصورة الحالية',
    'tariffLabel': 'السعر المقترح',
    'confirmTariff': 'تأكيد السعر المقترح',
    'minFareWarning': 'الحد الأدنى لـ',
    'is': 'هو',
    'createOrderBtn': 'إرسال طلب الشحن 📦',
    'selectCity': 'اختر المدينة',
    'searchCityHint': 'ابحث عن المدينة (مراكش، الرباط...)...',
    'streetLabel': 'رقم المنزل/المبنى والشارع',
    'streetHint': 'أدخل الشارع، الحي، أو رقم المبنى...',
    'done': 'تم',
    'save': 'حفظ',
    'activeRideBanner': '⚡ طلب شحن قيد التنفيذ',
    'activeRideSearching': 'جاري البحث عن سائق',
    'successTitle': 'نجاح 🚀',
    'successMsg': 'تم إرسال طلب الشحن بنجاح! جاري البحث عن سائقين قريبين.',
    'errorTitle': 'خطأ ⚠️',
    'errorMsg': 'تعذر إرسال الطلب، يرجى التأكد من البيانات والإعادة.',
  },
  'fr': {
    'pageTitle': 'Fret et Transport',
    'selectVehicleTitle': 'Quel véhicule convient à votre cargaison ?',
    'pickupLabel': 'Lieu de prise en charge',
    'dropoffLabel': 'Destination',
    'timeLabel': 'Heure de prise en charge',
    'timeAsap': '10 à 20 min',
    'time1h': "Jusqu'à 1 heure",
    'timeSched': 'Planifier la livraison',
    'cargoDescLabel': 'Description de la cargaison',
    'cargoDescHint': 'Ex: Meubles de salon, 5 cartons, électroménager...',
    'vehicleSizeLabel': 'Taille du véhicule et capacité',
    'optionsLabel': 'Options supplémentaires',
    'optCash': 'Espèces',
    'optHelper1': 'Un déménageur',
    'optHelper2': 'Deux déménageurs',
    'optElevator': 'Ascenseur',
    'optPassenger': 'Trajet avec passager',
    'photoLabel': 'Photo de votre cargaison',
    'photoModalTitle': 'Photo de cargaison - Choisissez une méthode',
    'takePhoto': '📷 Prendre une photo',
    'chooseGallery': '🖼️ Choisir depuis la galerie',
    'deletePhoto': '🗑️ Supprimer la photo actuelle',
    'tariffLabel': 'Proposez votre tarif',
    'confirmTariff': 'Confirmer le tarif',
    'minFareWarning': 'Le tarif minimum pour',
    'is': 'est de',
    'createOrderBtn': 'Créer une demande 📦',
    'selectCity': 'Sélectionnez votre ville',
    'searchCityHint': 'Rechercher une ville (Marrakech, Casablanca...)...',
    'streetLabel': 'Numéro de domicile et rue',
    'streetHint': 'Entrez la rue, numéro, quartier...',
    'done': 'Terminé',
    'save': 'Enregistrer',
    'activeRideBanner': '⚡ Demande en cours',
    'activeRideSearching': 'Recherche de chauffeur',
    'successTitle': 'Succès 🚀',
    'successMsg': 'Demande créée avec succès ! Recherche de chauffeurs à proximité.',
    'errorTitle': 'Erreur ⚠️',
    'errorMsg': 'Impossible d\'envoyer la demande, veuillez réessayer.',
  },
  'en': {
    'pageTitle': 'Freight & Cargo',
    'selectVehicleTitle': 'Which vehicle fits your cargo?',
    'pickupLabel': 'Pickup Location',
    'dropoffLabel': 'Destination',
    'timeLabel': 'Pickup Time',
    'timeAsap': '10 to 20 min',
    'time1h': 'Within 1 hour',
    'timeSched': 'Schedule Delivery',
    'cargoDescLabel': 'Cargo Description',
    'cargoDescHint': 'E.g., Living room furniture, 5 boxes, appliances...',
    'vehicleSizeLabel': 'Vehicle Type & Capacity',
    'optionsLabel': 'Extra Options',
    'optCash': 'Cash',
    'optHelper1': '1 Helper',
    'optHelper2': '2 Helpers',
    'optElevator': 'Elevator Available',
    'optPassenger': 'Ride with Passengers',
    'photoLabel': 'Cargo Photo',
    'photoModalTitle': 'Cargo Photo - Choose Method',
    'takePhoto': '📷 Take a photo with camera',
    'chooseGallery': '🖼️ Choose from phone gallery',
    'deletePhoto': '🗑️ Delete current photo',
    'tariffLabel': 'Propose Your Fare',
    'confirmTariff': 'Confirm Proposed Fare',
    'minFareWarning': 'Minimum fare for',
    'is': 'is',
    'createOrderBtn': 'Submit Freight Order 📦',
    'selectCity': 'Select City',
    'searchCityHint': 'Search city (Marrakech, Rabat...)...',
    'streetLabel': 'Street Address & House Number',
    'streetHint': 'Enter street, building number, district...',
    'done': 'Done',
    'save': 'Save',
    'activeRideBanner': '⚡ Active Freight Order',
    'activeRideSearching': 'Searching for driver',
    'successTitle': 'Success 🚀',
    'successMsg': 'Freight order submitted successfully! Searching for nearby drivers.',
    'errorTitle': 'Error ⚠️',
    'errorMsg': 'Could not send request. Please check your data and retry.',
  },
  'es': {
    'pageTitle': 'Carga y Transporte',
    'selectVehicleTitle': '¿Qué vehículo se adapta a su carga?',
    'pickupLabel': 'Lugar de recogida',
    'dropoffLabel': 'Destino',
    'timeLabel': 'Hora de recogida',
    'timeAsap': '10 a 20 min',
    'time1h': 'En 1 hora',
    'timeSched': 'Programar entrega',
    'cargoDescLabel': 'Descripción de la carga',
    'cargoDescHint': 'Ej: Muebles de salón, 5 cajas, electrodomésticos...',
    'vehicleSizeLabel': 'Tipo de vehículo y capacidad',
    'optionsLabel': 'Opciones adicionales',
    'optCash': 'Efectivo',
    'optHelper1': '1 Ayudante',
    'optHelper2': '2 Ayudantes',
    'optElevator': 'Ascensor disponible',
    'optPassenger': 'Viaje con pasajeros',
    'photoLabel': 'Foto de su carga',
    'photoModalTitle': 'Foto de Carga - Seleccionar Método',
    'takePhoto': '📷 Tomar una foto con cámara',
    'chooseGallery': '🖼️ Elegir de la galería',
    'deletePhoto': '🗑️ Eliminar foto actual',
    'tariffLabel': 'Proponga su tarifa',
    'confirmTariff': 'Confirmar tarifa propuesta',
    'minFareWarning': 'La tarifa mínima para',
    'is': 'es de',
    'createOrderBtn': 'Enviar solicitud de carga 📦',
    'selectCity': 'Seleccione su ciudad',
    'searchCityHint': 'Buscar ciudad (Marrakech, Rabat...)...',
    'streetLabel': 'Calle y número de casa',
    'streetHint': 'Ingrese calle, número de edificio, barrio...',
    'done': 'Hecho',
    'save': 'Guardar',
    'activeRideBanner': '⚡ Solicitud en curso',
    'activeRideSearching': 'Buscando conductor',
    'successTitle': 'Éxito 🚀',
    'successMsg': '¡Solicitud enviada con éxito! Buscando conductores cercanos.',
    'errorTitle': 'Error ⚠️',
    'errorMsg': 'No se pudo enviar la solicitud, إستعادة.',
  },
};

class PassengerTransportPage extends StatefulWidget {
  final PassengerRideService rideService;
  final String currentLang;

  const PassengerTransportPage({
    super.key,
    required this.rideService,
    required this.currentLang,
  });

  @override
  State<PassengerTransportPage> createState() => _PassengerTransportPageState();
}

class _PassengerTransportPageState extends State<PassengerTransportPage> {
  bool _isLoading = true;
  bool _isSubmitting = false;
  Map<String, dynamic>? _activeRide;
  final ImagePicker _picker = ImagePicker();

  // ════════════════════════════════════════════════════════════════════════════
  // 4 FREIGHT VEHICLES (With Enlarged 3D Product Illustrations & 4 Languages)
  // ════════════════════════════════════════════════════════════════════════════
  final List<Map<String, dynamic>> _truckVehicles = [
    {
      'id': 'tricycle',
      'title': {
        'ar': 'دراجة ثلاثية العجلات (Triporteur)',
        'fr': 'Tricycle (Triporteur)',
        'en': 'Tricycle (Triporteur)',
        'es': 'Triciclo (Triporteur)',
      },
      'desc': {
        'ar': 'حتى 300 كجم - نقل البضائع والطرود الصغيرة والمتوسطة الأوفر والأنسب',
        'fr': 'Jusqu\'à 300 kg - Transport de marchandises et petits colis',
        'en': 'Up to 300 kg - Transport of goods and small/medium packages',
        'es': 'Hasta 300 kg - Transporte de mercancías y paquetes pequeños',
      },
      'dimensions': '📦 1.2 × 0.9 × 0.9 م',
      'minFareDH': 60,
      'assetPath': 'assets/images/vehicles/tricycle_cargo_3d.png',
      'absPath': '/Users/benomar/VTC OLD/atlas projet vtc  /apps/passenger-app/assets/images/vehicles/tricycle_cargo_3d.png',
    },
    {
      'id': 'petit_camion',
      'title': {
        'ar': 'شاحنة صغيرة (Pickup)',
        'fr': 'Petit camion (Pickup)',
        'en': 'Small Truck (Pickup)',
        'es': 'Camión Pequeño (Pickup)',
      },
      'desc': {
        'ar': 'حتى 700 كجم - نقل الأجهزة والمنقولات المنزلية والأمتعة',
        'fr': 'Jusqu\'à 700 kg - Transport d\'électroménager, meubles et bagages',
        'en': 'Up to 700 kg - Transport of appliances, home items and luggage',
        'es': 'Hasta 700 kg - Transporte de electrodomésticos, enseres y equipaje',
      },
      'dimensions': '📦 1.7 × 1.0 × 1.5 م',
      'minFareDH': 100,
      'assetPath': 'assets/images/vehicles/petit_camion_cargo_3d.png',
      'absPath': '/Users/benomar/VTC OLD/atlas projet vtc  /apps/passenger-app/assets/images/vehicles/petit_camion_cargo_3d.png',
    },
    {
      'id': 'camion',
      'title': {
        'ar': 'سيارة نفعية (فورغون)',
        'fr': 'Fourgon / Utilitaire',
        'en': 'Cargo Van (Fourgon)',
        'es': 'Furgón / Útil',
      },
      'desc': {
        'ar': 'حتى 1.5 طن - نقل الأثاث ومواد البناء',
        'fr': 'Jusqu\'à 1.5 t - Transport de meubles et matériaux de construction',
        'en': 'Up to 1.5 tons - Transport of furniture and building materials',
        'es': 'Hasta 1.5 t - Transporte de muebles y materiales de construcción',
      },
      'dimensions': '📦 3.0 × 2.0 × 2.0 م',
      'minFareDH': 150,
      'assetPath': 'assets/images/vehicles/fourgon_cargo_3d.png',
      'absPath': '/Users/benomar/VTC OLD/atlas projet vtc  /apps/passenger-app/assets/images/vehicles/fourgon_cargo_3d.png',
    },
    {
      'id': 'large_truck',
      'title': {
        'ar': 'شاحنة كبيرة (Camion L)',
        'fr': 'Camion Grand (L)',
        'en': 'Large Heavy Truck (L)',
        'es': 'Camión Grande (L)',
      },
      'desc': {
        'ar': 'حتى 5 أطنان - نقل الأثاث الكبير والبضائع الضخمة',
        'fr': 'Jusqu\'à 5 t - Transport de grands meubles et marchandises lourdes',
        'en': 'Up to 5 tons - Transport of large furniture and bulk cargo',
        'es': 'Hasta 5 t - Transporte de muebles grandes y carga pesada',
      },
      'dimensions': '📦 5.8 × 2.45 × 2.2 م',
      'minFareDH': 250,
      'assetPath': 'assets/images/vehicles/large_truck_cargo_3d.png',
      'absPath': '/Users/benomar/VTC OLD/atlas projet vtc  /apps/passenger-app/assets/images/vehicles/large_truck_cargo_3d.png',
    },
  ];

  String _selectedVehicleId = 'tricycle';

  // 2-Step Location State (Step 1: City, Step 2: Street)
  String _pickupCity = 'Marrakech';
  String _pickupStreet = 'Rue des Ecoles';
  double _pickupLat = 31.6340;
  double _pickupLng = -8.0100;

  String _dropoffCity = 'Casablanca';
  String _dropoffStreet = 'Boulevard d\'Anfa';
  double _dropoffLat = 33.5731;
  double _dropoffLng = -7.5898;

  String _pickupTimeOption = 'ASAP';
  final TextEditingController _cargoDescController = TextEditingController();

  // Options
  String _paymentOption = 'cash';
  int _helpersOption = 1;
  bool _hasElevator = true;
  bool _hasPassenger = false;

  String? _cargoPhotoUri;
  final TextEditingController _offeredTariffController = TextEditingController(text: '60');

  final List<Map<String, String>> _moroccanCities = [
    {'ar': 'مراكش', 'fr': 'Marrakech', 'en': 'Marrakech', 'es': 'Marrakech', 'lat': '31.6340', 'lng': '-8.0100'},
    {'ar': 'الدار البيضاء', 'fr': 'Casablanca', 'en': 'Casablanca', 'es': 'Casablanca', 'lat': '33.5731', 'lng': '-7.5898'},
    {'ar': 'الرباط', 'fr': 'Rabat', 'en': 'Rabat', 'es': 'Rabat', 'lat': '34.0209', 'lng': '-6.8416'},
    {'ar': 'طنجة', 'fr': 'Tanger', 'en': 'Tangier', 'es': 'Tánger', 'lat': '35.7595', 'lng': '-5.8340'},
    {'ar': 'أكادير', 'fr': 'Agadir', 'en': 'Agadir', 'es': 'Agadir', 'lat': '30.4278', 'lng': '-9.5981'},
    {'ar': 'فاس', 'fr': 'Fès', 'en': 'Fez', 'es': 'Fez', 'lat': '34.0331', 'lng': '-5.0003'},
    {'ar': 'مكناس', 'fr': 'Méquinez', 'en': 'Meknes', 'es': 'Mequinez', 'lat': '33.8935', 'lng': '-5.5473'},
    {'ar': 'وجدة', 'fr': 'Oujda', 'en': 'Oujda', 'es': 'Oujda', 'lat': '34.6814', 'lng': '-1.9086'},
    {'ar': 'تطوان', 'fr': 'Tétouan', 'en': 'Tetouan', 'es': 'Tetuán', 'lat': '35.5889', 'lng': '-5.3626'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchAllData();
  }

  @override
  void dispose() {
    _cargoDescController.dispose();
    _offeredTariffController.dispose();
    super.dispose();
  }

  String get _langKey {
    final raw = widget.currentLang.toLowerCase();
    if (raw.startsWith('fr')) return 'fr';
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('es')) return 'es';
    return 'ar';
  }

  Map<String, String> get _t => kFreightTranslations[_langKey] ?? kFreightTranslations['ar']!;

  String _getVehicleTitle(Map<String, dynamic> v) {
    final Map<String, String> titles = Map<String, String>.from(v['title']);
    return titles[_langKey] ?? titles['ar'] ?? '';
  }

  String _getVehicleDesc(Map<String, dynamic> v) {
    final Map<String, String> descs = Map<String, String>.from(v['desc']);
    return descs[_langKey] ?? descs['ar'] ?? '';
  }

  // ENLARGED 3D IMAGE RENDERER
  Widget _buildVehicleImage(Map<String, dynamic> v, {double width = 92, double height = 64}) {
    final String absPath = v['absPath'] ?? '';
    if (absPath.isNotEmpty && File(absPath).existsSync()) {
      return Image.file(File(absPath), width: width, height: height, fit: BoxFit.contain);
    }
    return Image.asset(v['assetPath'], width: width, height: height, fit: BoxFit.contain, errorBuilder: (_, __, ___) {
      return Container(
        width: width, height: height,
        decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.local_shipping_rounded, color: Color(0xFF4F46E5), size: 28),
      );
    });
  }

  void _onVehicleSelected(String vId) {
    setState(() {
      _selectedVehicleId = vId;
      final vehicle = _truckVehicles.firstWhere((v) => v['id'] == vId, orElse: () => _truckVehicles[0]);
      final int minFare = vehicle['minFareDH'] as int? ?? 60;
      _offeredTariffController.text = minFare.toString();
    });
  }

  // CAMERA PERMISSION REQUESTER
  Future<bool> _requestCameraPermission() async {
    var status = await Permission.camera.status;
    if (!status.isGranted) {
      status = await Permission.camera.request();
    }
    return status.isGranted;
  }

  // PHOTO PICKER HANDLERS
  void _openPhotoPickerBottomSheet() {
    final isAr = _langKey == 'ar';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Directionality(
          textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 16),
                Text(
                  _t['photoModalTitle']!,
                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF111827)),
                ),
                const SizedBox(height: 18),

                // Option 1: Take Photo with Camera
                InkWell(
                  onTap: () async {
                    Navigator.pop(ctx);
                    final hasPerm = await _requestCameraPermission();
                    if (!hasPerm) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              isAr
                                  ? 'تم رفض صلاحية الكاميرا. يرجى تفعيل الصلاحية من إعدادات الهاتف.'
                                  : 'Camera permission denied. Please enable camera access in settings.',
                              style: GoogleFonts.outfit(),
                            ),
                            backgroundColor: const Color(0xFFEF4444),
                          ),
                        );
                      }
                      return;
                    }

                    try {
                      final XFile? photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);
                      if (photo != null && mounted) {
                        setState(() {
                          _cargoPhotoUri = photo.path;
                        });
                      }
                    } catch (_) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              isAr ? 'تعذر فتح الكاميرا، يرجى إعادة المحاولة' : 'Error opening camera, please retry',
                              style: GoogleFonts.outfit(),
                            ),
                            backgroundColor: const Color(0xFFEF4444),
                          ),
                        );
                      }
                    }
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEF2FF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF4F46E5), width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: const Color(0xFF4F46E5), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.photo_camera_rounded, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Text(_t['takePhoto']!, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Option 2: Choose from Phone Gallery
                InkWell(
                  onTap: () async {
                    Navigator.pop(ctx);
                    try {
                      final XFile? photo = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
                      if (photo != null && mounted) {
                        setState(() {
                          _cargoPhotoUri = photo.path;
                        });
                      }
                    } catch (_) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(isAr ? 'تعذر فتح معرض الصور' : 'Gallery access failed'), backgroundColor: Colors.red),
                        );
                      }
                    }
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: const Color(0xFF312E81), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.photo_library_rounded, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Text(_t['chooseGallery']!, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF1F2937))),
                      ],
                    ),
                  ),
                ),

                // Option 3: Delete Current Photo if exists
                if (_cargoPhotoUri != null) ...[
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      setState(() {
                        _cargoPhotoUri = null;
                      });
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFEF4444)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                          const SizedBox(width: 12),
                          Text(_t['deletePhoto']!, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFFEF4444))),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _fetchAllData() async {
    setState(() => _isLoading = true);
    try {
      final activeData = await widget.rideService.getActiveRide();

      if (mounted) {
        setState(() {
          _activeRide = activeData;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleCreateDemand() async {
    final messenger = ScaffoldMessenger.of(context);
    final selectedObj = _truckVehicles.firstWhere((v) => v['id'] == _selectedVehicleId, orElse: () => _truckVehicles[0]);
    final int minFare = selectedObj['minFareDH'] as int? ?? 60;
    final vTitle = _getVehicleTitle(selectedObj);

    int tariff = int.tryParse(_offeredTariffController.text.trim()) ?? 0;
    if (tariff <= 0) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(_t['tariffLabel']!, style: GoogleFonts.outfit()),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
      return;
    }

    if (tariff < minFare) {
      tariff = minFare;
      _offeredTariffController.text = minFare.toString();
      messenger.showSnackBar(
        SnackBar(
          content: Text('${_t['minFareWarning']!} $vTitle ${_t['is']!} $minFare MAD', style: GoogleFonts.outfit()),
          backgroundColor: const Color(0xFF4F46E5),
        ),
      );
    }

    setState(() => _isSubmitting = true);
    try {
      await widget.rideService.requestRide(
        pickupLat: _pickupLat,
        pickupLng: _pickupLng,
        pickupAddress: '$_pickupCity, $_pickupStreet',
        dropoffLat: _dropoffLat,
        dropoffLng: _dropoffLng,
        dropoffAddress: '$_dropoffCity, $_dropoffStreet',
        serviceType: 'FREIGHT',
        offeredPrice: tariff.toDouble(),
        tripType: 'CARGO',
        rideMode: 'FREIGHT',
        seatsBooked: _hasPassenger ? 1 : 0,
        departureDateTime: DateTime.now().toIso8601String(),
        passengerNotes: '[$vTitle] ${_cargoDescController.text.trim()} (Déménageurs: $_helpersOption, Ascenseur: ${_hasElevator ? 'Oui' : 'Non'})',
      );

      _fetchAllData();

      messenger.showSnackBar(
        SnackBar(
          content: Text(_t['successMsg']!, style: GoogleFonts.outfit()),
          backgroundColor: const Color(0xFF4F46E5),
        ),
      );
    } catch (_) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(_t['errorMsg']!, style: GoogleFonts.outfit()),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  // 2-STEP LOCATION MODAL SHEET (Step 1: City, Step 2: Street)
  void _open2StepLocationSheet(bool isPickup) {
    final isAr = _langKey == 'ar';
    String tempCity = isPickup ? _pickupCity : _dropoffCity;
    double tempLat = isPickup ? _pickupLat : _dropoffLat;
    double tempLng = isPickup ? _pickupLng : _dropoffLng;
    final streetCtrl = TextEditingController(text: isPickup ? _pickupStreet : _dropoffStreet);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Directionality(
              textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
              child: Padding(
                padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
                      const SizedBox(height: 16),
                      Text(
                        isPickup ? _t['pickupLabel']! : _t['dropoffLabel']!,
                        style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: const Color(0xFF111827)),
                      ),
                      const SizedBox(height: 16),

                      // STEP 1: Sélectionner votre ville
                      Text(_t['selectCity']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () {
                          _openCitySearchDialog(ctx, (cityFr, latStr, lngStr) {
                            setSheetState(() {
                              tempCity = cityFr;
                              tempLat = double.tryParse(latStr) ?? tempLat;
                              tempLng = double.tryParse(lngStr) ?? tempLng;
                            });
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE5E7EB))),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(tempCity.isNotEmpty ? tempCity : _t['selectCity']!, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1F2937))),
                              const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // STEP 2: Numéro de domicile et rue (Appears after City selection)
                      if (tempCity.isNotEmpty) ...[
                        Text(_t['streetLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                        const SizedBox(height: 6),
                        TextField(
                          controller: streetCtrl,
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
                          decoration: InputDecoration(
                            hintText: _t['streetHint']!,
                            filled: true,
                            fillColor: const Color(0xFFF9FAFB),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                            contentPadding: const EdgeInsets.all(14),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              if (isPickup) {
                                _pickupCity = tempCity;
                                _pickupStreet = streetCtrl.text.trim().isNotEmpty ? streetCtrl.text.trim() : 'Rue principale';
                                _pickupLat = tempLat;
                                _pickupLng = tempLng;
                              } else {
                                _dropoffCity = tempCity;
                                _dropoffStreet = streetCtrl.text.trim().isNotEmpty ? streetCtrl.text.trim() : 'Rue principale';
                                _dropoffLat = tempLat;
                                _dropoffLng = tempLng;
                              }
                            });
                            Navigator.pop(ctx);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: Text(_t['done']!, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  // City Search Dialog
  void _openCitySearchDialog(BuildContext parentCtx, Function(String cityFr, String lat, String lng) onSelect) {
    final searchCtrl = TextEditingController();

    showDialog(
      context: parentCtx,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            final query = searchCtrl.text.toLowerCase();
            final filtered = _moroccanCities.where((c) =>
              c['ar']!.toLowerCase().contains(query) ||
              c['fr']!.toLowerCase().contains(query) ||
              c['en']!.toLowerCase().contains(query) ||
              c['es']!.toLowerCase().contains(query)
            ).toList();

            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(_t['selectCity']!, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
              content: SizedBox(
                width: double.maxFinite,
                height: 300,
                child: Column(
                  children: [
                    TextField(
                      controller: searchCtrl,
                      style: GoogleFonts.outfit(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: _t['searchCityHint']!,
                        prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF4F46E5)),
                        filled: true,
                        fillColor: const Color(0xFFF9FAFB),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onChanged: (_) => setDialogState(() {}),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF3F4F6)),
                        itemBuilder: (ctx, index) {
                          final c = filtered[index];
                          final cName = c[_langKey] ?? c['fr']!;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text('$cName (${c['ar']})', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600)),
                            onTap: () {
                              onSelect(c['fr']!, c['lat'] ?? '31.6340', c['lng'] ?? '-8.0100');
                              Navigator.pop(dialogCtx);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // Truck Specs Selection Sheet
  void _openTruckSpecsModal() {
    final isAr = _langKey == 'ar';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Directionality(
        textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              Text(
                _t['selectVehicleTitle']!,
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF111827)),
              ),
              const SizedBox(height: 16),

              ..._truckVehicles.map((v) {
                final isSel = _selectedVehicleId == v['id'];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    onTap: () {
                      _onVehicleSelected(v['id'] as String);
                      Navigator.pop(ctx);
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFFEEF2FF) : const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFE5E7EB), width: isSel ? 2 : 1),
                      ),
                      child: Row(
                        children: [
                          _buildVehicleImage(v, width: 88, height: 60),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_getVehicleTitle(v), style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1F2937))),
                                const SizedBox(height: 2),
                                Text(_getVehicleDesc(v), style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[600])),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(color: const Color(0xFF4F46E5), borderRadius: BorderRadius.circular(6)),
                                  child: Text('${v['dimensions']} (Min: ${v['minFareDH']} DH)', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = _langKey == 'ar';
    final selectedVehicleObj = _truckVehicles.firstWhere((v) => v['id'] == _selectedVehicleId, orElse: () => _truckVehicles[0]);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: const Color(0xFFF9FAFB),
        appBar: AppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            _t['pageTitle']!,
            style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          centerTitle: true,
        ),
        body: RefreshIndicator(
          onRefresh: _fetchAllData,
          color: const Color(0xFF4F46E5),
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 40),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_isLoading) const LinearProgressIndicator(color: Color(0xFF4F46E5)),

                // ═════════════════════════════════════════════════════════════
                // SECTION B: 4 FREIGHT VEHICLES CAROUSEL WITH ENLARGED 3D IMAGES
                // ═════════════════════════════════════════════════════════════
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: _truckVehicles.map((item) {
                        final isSel = _selectedVehicleId == item['id'];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: InkWell(
                            onTap: () {
                              _onVehicleSelected(item['id'] as String);
                              _openTruckSpecsModal();
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFF3F4F6),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFE5E7EB)),
                              ),
                              child: Column(
                                children: [
                                  _buildVehicleImage(item, width: 92, height: 64),
                                  const SizedBox(height: 4),
                                  Text(_getVehicleTitle(item), style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: isSel ? Colors.white : const Color(0xFF1F2937))),
                                  const SizedBox(height: 2),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: isSel ? Colors.white.withOpacity(0.2) : const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(6)),
                                    child: Text(item['dimensions'] as String, style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : const Color(0xFF4F46E5))),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Active Ride Banner if present
                      if (_activeRide != null) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFF4F46E5))),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(_t['activeRideBanner']!, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5))),
                              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF4F46E5), borderRadius: BorderRadius.circular(8)), child: Text(_t['activeRideSearching']!, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // ═════════════════════════════════════════════════════════
                      // SECTION C & D: 2-STEP LOCATION FIELDS (CITY + STREET)
                      // ═════════════════════════════════════════════════════════
                      InkWell(
                        onTap: () => _open2StepLocationSheet(true),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE5E7EB))),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_t['pickupLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(child: Text('$_pickupCity, $_pickupStreet', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF111827)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      InkWell(
                        onTap: () => _open2StepLocationSheet(false),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE5E7EB))),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_t['dropoffLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(child: Text('$_dropoffCity, $_dropoffStreet', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF111827)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // SECTION E: PICKUP TIME
                      Text(_t['timeLabel']!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF111827))),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          {'id': 'ASAP', 'label': _t['timeAsap']!},
                          {'id': 'IN_1_HOUR', 'label': _t['time1h']!},
                          {'id': 'SCHEDULED', 'label': _t['timeSched']!},
                        ].map((item) {
                          final isSel = _pickupTimeOption == item['id'];
                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 3),
                              child: InkWell(
                                onTap: () => setState(() => _pickupTimeOption = item['id']!),
                                borderRadius: BorderRadius.circular(20),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSel ? Colors.white : const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFE5E7EB), width: isSel ? 2 : 1),
                                  ),
                                  child: Center(
                                    child: Text(item['label']!, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: isSel ? const Color(0xFF4F46E5) : Colors.grey[600])),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // SECTION F: CARGO DESCRIPTION
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE5E7EB))),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_t['cargoDescLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _cargoDescController,
                              style: GoogleFonts.outfit(fontSize: 14),
                              decoration: InputDecoration(
                                hintText: _t['cargoDescHint']!,
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // SECTION G: TRUCK CAPACITY SUMMARY
                      InkWell(
                        onTap: _openTruckSpecsModal,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE5E7EB))),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_t['vehicleSizeLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        _buildVehicleImage(selectedVehicleObj, width: 78, height: 54),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(_getVehicleTitle(selectedVehicleObj), style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF111827))),
                                              Text(_getVehicleDesc(selectedVehicleObj), style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[600])),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0xFF4F46E5), borderRadius: BorderRadius.circular(8)),
                                    child: Text(selectedVehicleObj['dimensions'] as String, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // SECTION H: OPTIONS
                      Text(_t['optionsLabel']!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF111827))),
                      const SizedBox(height: 8),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            FilterChip(
                              avatar: const Text('💵', style: TextStyle(fontSize: 12)),
                              label: Text(_t['optCash']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                              selected: _paymentOption == 'cash',
                              selectedColor: const Color(0xFFEEF2FF),
                              onSelected: (val) => setState(() => _paymentOption = val ? 'cash' : 'wallet'),
                            ),
                            const SizedBox(width: 8),
                            FilterChip(
                              avatar: const Text('👷', style: TextStyle(fontSize: 12)),
                              label: Text(_t['optHelper1']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                              selected: _helpersOption == 1,
                              selectedColor: const Color(0xFFEEF2FF),
                              onSelected: (val) => setState(() => _helpersOption = val ? 1 : 0),
                            ),
                            const SizedBox(width: 8),
                            FilterChip(
                              avatar: const Text('👷👷', style: TextStyle(fontSize: 12)),
                              label: Text(_t['optHelper2']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                              selected: _helpersOption == 2,
                              selectedColor: const Color(0xFFEEF2FF),
                              onSelected: (val) => setState(() => _helpersOption = val ? 2 : 0),
                            ),
                            const SizedBox(width: 8),
                            FilterChip(
                              avatar: const Text('🛗', style: TextStyle(fontSize: 12)),
                              label: Text(_t['optElevator']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                              selected: _hasElevator,
                              selectedColor: const Color(0xFFEEF2FF),
                              onSelected: (val) => setState(() => _hasElevator = val),
                            ),
                            const SizedBox(width: 8),
                            FilterChip(
                              avatar: const Text('👥', style: TextStyle(fontSize: 12)),
                              label: Text(_t['optPassenger']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                              selected: _hasPassenger,
                              selectedColor: const Color(0xFFEEF2FF),
                              onSelected: (val) => setState(() => _hasPassenger = val),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ═════════════════════════════════════════════════════════
                      // SECTION I: PHOTO PICKER (INTERACTIVE WITH CAMERA vs GALLERY SHEET)
                      // ═════════════════════════════════════════════════════════
                      Text(_t['photoLabel']!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF111827))),
                      const SizedBox(height: 8),
                      _cargoPhotoUri != null
                          ? InkWell(
                              onTap: _openPhotoPickerBottomSheet,
                              borderRadius: BorderRadius.circular(16),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: _cargoPhotoUri!.startsWith('http')
                                        ? Image.network(_cargoPhotoUri!, width: 110, height: 110, fit: BoxFit.cover)
                                        : Image.file(File(_cargoPhotoUri!), width: 110, height: 110, fit: BoxFit.cover),
                                  ),
                                  Positioned(
                                    top: 6,
                                    right: 6,
                                    child: InkWell(
                                      onTap: () => setState(() => _cargoPhotoUri = null),
                                      child: Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                                        child: const Icon(Icons.close, color: Colors.white, size: 16),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : InkWell(
                              onTap: _openPhotoPickerBottomSheet,
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                width: 94,
                                height: 94,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: const Color(0xFF4F46E5), width: 1.5, style: BorderStyle.solid),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.add_a_photo_rounded, color: Color(0xFF4F46E5), size: 26),
                                    const SizedBox(height: 4),
                                    Text('+ ${_t['photoLabel']!}', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5))),
                                  ],
                                ),
                              ),
                            ),
                      const SizedBox(height: 16),

                      // ═════════════════════════════════════════════════════════
                      // SECTION J: PROPOSED TARIFF FIELD (Yalla Logo Color Styling)
                      // ═════════════════════════════════════════════════════════
                      InkWell(
                        onTap: () {},
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF4F46E5), width: 1.5),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_t['tariffLabel']!, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _offeredTariffController,
                                      keyboardType: TextInputType.number,
                                      maxLength: 4,
                                      style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5)),
                                      decoration: const InputDecoration(counterText: '', border: InputBorder.none, isDense: true),
                                    ),
                                  ),
                                  Text('MAD / DH', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5))),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // SECTION K: ACTION BUTTON
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _handleCreateDemand,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: _isSubmitting
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  _t['createOrderBtn']!,
                                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
