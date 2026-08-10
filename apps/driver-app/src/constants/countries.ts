export interface CountryItem {
  iso2: string;
  dialCode: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  nameEs: string;
  flag: string;
}

// 🇲🇦 Morocco is fixed at index 0 as the primary launch market.
// All remaining countries are sorted alphabetically by English name (nameEn).
export const ALL_COUNTRIES: CountryItem[] = [
  { iso2: 'MA', dialCode: '+212', nameEn: 'Morocco', nameAr: 'المغرب', nameFr: 'Maroc', nameEs: 'Marruecos', flag: '🇲🇦' },
  { iso2: 'AF', dialCode: '+93', nameEn: 'Afghanistan', nameAr: 'أفغانستان', nameFr: 'Afghanistan', nameEs: 'Afganistán', flag: '🇦🇫' },
  { iso2: 'AL', dialCode: '+355', nameEn: 'Albania', nameAr: 'ألبانيا', nameFr: 'Albanie', nameEs: 'Albania', flag: '🇦🇱' },
  { iso2: 'DZ', dialCode: '+213', nameEn: 'Algeria', nameAr: 'الجزائر', nameFr: 'Algérie', nameEs: 'Argelia', flag: '🇩🇿' },
  { iso2: 'AS', dialCode: '+1684', nameEn: 'American Samoa', nameAr: 'ساموا الأمريكية', nameFr: 'Samoa américaines', nameEs: 'Samoa Americana', flag: '🇦🇸' },
  { iso2: 'AD', dialCode: '+376', nameEn: 'Andorra', nameAr: 'أندورا', nameFr: 'Andorre', nameEs: 'Andorra', flag: '🇦🇩' },
  { iso2: 'AO', dialCode: '+244', nameEn: 'Angola', nameAr: 'أنغولا', nameFr: 'Angola', nameEs: 'Angola', flag: '🇦🇴' },
  { iso2: 'AI', dialCode: '+1264', nameEn: 'Anguilla', nameAr: 'أنغويلا', nameFr: 'Anguilla', nameEs: 'Anguila', flag: '🇦🇮' },
  { iso2: 'AG', dialCode: '+1268', nameEn: 'Antigua and Barbuda', nameAr: 'أنتيغوا وبربودا', nameFr: 'Antigua-et-Barbuda', nameEs: 'Antigua y Barbuda', flag: '🇦🇬' },
  { iso2: 'AR', dialCode: '+54', nameEn: 'Argentina', nameAr: 'الأرجنتين', nameFr: 'Argentine', nameEs: 'Argentina', flag: '🇦🇷' },
  { iso2: 'AM', dialCode: '+374', nameEn: 'Armenia', nameAr: 'أرمينيا', nameFr: 'Arménie', nameEs: 'Armenia', flag: '🇦🇲' },
  { iso2: 'AW', dialCode: '+297', nameEn: 'Aruba', nameAr: 'أروبا', nameFr: 'Aruba', nameEs: 'Aruba', flag: '🇦🇼' },
  { iso2: 'AU', dialCode: '+61', nameEn: 'Australia', nameAr: 'أستراليا', nameFr: 'Australie', nameEs: 'Australia', flag: '🇦🇺' },
  { iso2: 'AT', dialCode: '+43', nameEn: 'Austria', nameAr: 'النمسا', nameFr: 'Autriche', nameEs: 'Austria', flag: '🇦🇹' },
  { iso2: 'AZ', dialCode: '+994', nameEn: 'Azerbaijan', nameAr: 'أذربيجان', nameFr: 'Azerbaïdjan', nameEs: 'Azerbaiyán', flag: '🇦🇿' },
  { iso2: 'BS', dialCode: '+1242', nameEn: 'Bahamas', nameAr: 'البحرين', nameFr: 'Bahamas', nameEs: 'Bahamas', flag: '🇧🇸' },
  { iso2: 'BH', dialCode: '+973', nameEn: 'Bahrain', nameAr: 'البحرين', nameFr: 'Bahreïn', nameEs: 'Bahréin', flag: '🇧🇭' },
  { iso2: 'BD', dialCode: '+880', nameEn: 'Bangladesh', nameAr: 'بنغلاديش', nameFr: 'Bangladesh', nameEs: 'Bangladés', flag: '🇧🇩' },
  { iso2: 'BB', dialCode: '+1246', nameEn: 'Barbados', nameAr: 'باربادوس', nameFr: 'Barbade', nameEs: 'Barbados', flag: '🇧🇧' },
  { iso2: 'BY', dialCode: '+375', nameEn: 'Belarus', nameAr: 'بيلاروسيا', nameFr: 'Bélarus', nameEs: 'Bielorrusia', flag: '🇧🇾' },
  { iso2: 'BE', dialCode: '+32', nameEn: 'Belgium', nameAr: 'بلجيكا', nameFr: 'Belgique', nameEs: 'Bélgica', flag: '🇧🇪' },
  { iso2: 'BZ', dialCode: '+501', nameEn: 'Belize', nameAr: 'بليز', nameFr: 'Belize', nameEs: 'Belice', flag: '🇧🇿' },
  { iso2: 'BJ', dialCode: '+229', nameEn: 'Benin', nameAr: 'بنين', nameFr: 'Bénin', nameEs: 'Benín', flag: '🇧🇯' },
  { iso2: 'BM', dialCode: '+1441', nameEn: 'Bermuda', nameAr: 'برمودا', nameFr: 'Bermudes', nameEs: 'Bermudas', flag: '🇧🇲' },
  { iso2: 'BT', dialCode: '+975', nameEn: 'Bhutan', nameAr: 'بوتان', nameFr: 'Bhoutan', nameEs: 'Bután', flag: '🇧🇹' },
  { iso2: 'BO', dialCode: '+591', nameEn: 'Bolivia', nameAr: 'بوليفيا', nameFr: 'Bolivie', nameEs: 'Bolivia', flag: '🇧🇴' },
  { iso2: 'BA', dialCode: '+387', nameEn: 'Bosnia and Herzegovina', nameAr: 'البوسنة والهرسك', nameFr: 'Bosnie-Herzégovine', nameEs: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  { iso2: 'BW', dialCode: '+267', nameEn: 'Botswana', nameAr: 'بوتسوانا', nameFr: 'Botswana', nameEs: 'Botsuana', flag: '🇧🇼' },
  { iso2: 'BR', dialCode: '+55', nameEn: 'Brazil', nameAr: 'البرازيل', nameFr: 'Brésil', nameEs: 'Brasil', flag: '🇧🇷' },
  { iso2: 'BN', dialCode: '+673', nameEn: 'Brunei', nameAr: 'بروناي', nameFr: 'Brunei', nameEs: 'Brunéi', flag: '🇧🇳' },
  { iso2: 'BG', dialCode: '+359', nameEn: 'Bulgaria', nameAr: 'بلغاريا', nameFr: 'Bulgarie', nameEs: 'Bulgaria', flag: '🇧🇬' },
  { iso2: 'BF', dialCode: '+226', nameEn: 'Burkina Faso', nameAr: 'بوركينا فاسو', nameFr: 'Burkina Faso', nameEs: 'Burkina Faso', flag: '🇧🇫' },
  { iso2: 'BI', dialCode: '+257', nameEn: 'Burundi', nameAr: 'بوروندي', nameFr: 'Burundi', nameEs: 'Burundi', flag: '🇧🇮' },
  { iso2: 'KH', dialCode: '+855', nameEn: 'Cambodia', nameAr: 'كمبوديا', nameFr: 'Cambodge', nameEs: 'Camboya', flag: '🇰🇭' },
  { iso2: 'CM', dialCode: '+237', nameEn: 'Cameroon', nameAr: 'الكاميرون', nameFr: 'Cameroun', nameEs: 'Camerún', flag: '🇨🇲' },
  { iso2: 'CA', dialCode: '+1', nameEn: 'Canada', nameAr: 'كندا', nameFr: 'Canada', nameEs: 'Canadá', flag: '🇨🇦' },
  { iso2: 'CV', dialCode: '+238', nameEn: 'Cape Verde', nameAr: 'الرأس الأخضر', nameFr: 'Cap-Vert', nameEs: 'Cabo Verde', flag: '🇨🇻' },
  { iso2: 'KY', dialCode: '+1345', nameEn: 'Cayman Islands', nameAr: 'جزر كايمان', nameFr: 'Îles Caïmans', nameEs: 'Islas Caimán', flag: '🇰🇾' },
  { iso2: 'CF', dialCode: '+236', nameEn: 'Central African Republic', nameAr: 'جمهورية أفريقيا الوسطى', nameFr: 'République centrafricaine', nameEs: 'República Centroafricana', flag: '🇨🇫' },
  { iso2: 'TD', dialCode: '+235', nameEn: 'Chad', nameAr: 'تشاد', nameFr: 'Tchad', nameEs: 'Chad', flag: '🇹🇩' },
  { iso2: 'CL', dialCode: '+56', nameEn: 'Chile', nameAr: 'شيلي', nameFr: 'Chili', nameEs: 'Chile', flag: '🇨🇱' },
  { iso2: 'CN', dialCode: '+86', nameEn: 'China', nameAr: 'الصين', nameFr: 'Chine', nameEs: 'China', flag: '🇨🇳' },
  { iso2: 'CO', dialCode: '+57', nameEn: 'Colombia', nameAr: 'كولومبيا', nameFr: 'Colombie', nameEs: 'Colombia', flag: '🇨🇴' },
  { iso2: 'KM', dialCode: '+269', nameEn: 'Comoros', nameAr: 'جزر القمر', nameFr: 'Comores', nameEs: 'Comoras', flag: '🇰🇲' },
  { iso2: 'CG', dialCode: '+242', nameEn: 'Congo', nameAr: 'الكونغو', nameFr: 'Congo-Brazzaville', nameEs: 'Congo', flag: '🇨🇬' },
  { iso2: 'CD', dialCode: '+243', nameEn: 'Congo (DRC)', nameAr: 'جمهورية الكونغو الديمقراطية', nameFr: 'Congo-Kinshasa', nameEs: 'República Democrática del Congo', flag: '🇨🇩' },
  { iso2: 'CR', dialCode: '+506', nameEn: 'Costa Rica', nameAr: 'كوستاريكا', nameFr: 'Costa Rica', nameEs: 'Costa Rica', flag: '🇨🇷' },
  { iso2: 'CI', dialCode: '+225', nameEn: "Côte d'Ivoire", nameAr: 'ساحل العاج', nameFr: "Côte d'Ivoire", nameEs: 'Costa de Marfil', flag: '🇨🇮' },
  { iso2: 'HR', dialCode: '+385', nameEn: 'Croatia', nameAr: 'كرواتيا', nameFr: 'Croatie', nameEs: 'Croacia', flag: '🇭🇷' },
  { iso2: 'CU', dialCode: '+53', nameEn: 'Cuba', nameAr: 'كوبا', nameFr: 'Cuba', nameEs: 'Cuba', flag: '🇨🇺' },
  { iso2: 'CY', dialCode: '+357', nameEn: 'Cyprus', nameAr: 'قبرص', nameFr: 'Chypre', nameEs: 'Chipre', flag: '🇨🇾' },
  { iso2: 'CZ', dialCode: '+420', nameEn: 'Czech Republic', nameAr: 'جمهورية التشيك', nameFr: 'Tchéquie', nameEs: 'República Checa', flag: '🇨🇿' },
  { iso2: 'DK', dialCode: '+45', nameEn: 'Denmark', nameAr: 'الدنمارك', nameFr: 'Danemark', nameEs: 'Dinamarca', flag: '🇩🇰' },
  { iso2: 'DJ', dialCode: '+253', nameEn: 'Djibouti', nameAr: 'جيبوتي', nameFr: 'Djibouti', nameEs: 'Yibuti', flag: '🇩🇯' },
  { iso2: 'DM', dialCode: '+1767', nameEn: 'Dominica', nameAr: 'دومينيكا', nameFr: 'Dominique', nameEs: 'Dominica', flag: '🇩🇲' },
  { iso2: 'DO', dialCode: '+1809', nameEn: 'Dominican Republic', nameAr: 'جمهورية الدومينيكان', nameFr: 'République dominicaine', nameEs: 'República Dominicana', flag: '🇩🇴' },
  { iso2: 'EC', dialCode: '+593', nameEn: 'Ecuador', nameAr: 'الإكوادور', nameFr: 'Équateur', nameEs: 'Ecuador', flag: '🇪🇨' },
  { iso2: 'EG', dialCode: '+20', nameEn: 'Egypt', nameAr: 'مصر', nameFr: 'Égypte', nameEs: 'Egipto', flag: '🇪🇬' },
  { iso2: 'SV', dialCode: '+503', nameEn: 'El Salvador', nameAr: 'السلفادور', nameFr: 'El Salvador', nameEs: 'El Salvador', flag: '🇸🇻' },
  { iso2: 'GQ', dialCode: '+240', nameEn: 'Equatorial Guinea', nameAr: 'غينيا الاستوائية', nameFr: 'Guinée équatoriale', nameEs: 'Guinea Ecuatorial', flag: '🇬🇶' },
  { iso2: 'ER', dialCode: '+291', nameEn: 'Eritrea', nameAr: 'إريتريا', nameFr: 'Érythrée', nameEs: 'Eritrea', flag: '🇪🇷' },
  { iso2: 'EE', dialCode: '+372', nameEn: 'Estonia', nameAr: 'إستونيا', nameFr: 'Estonie', nameEs: 'Estonia', flag: '🇪🇪' },
  { iso2: 'SZ', dialCode: '+268', nameEn: 'Eswatini', nameAr: 'إسواتيني', nameFr: 'Eswatini', nameEs: 'Euatini', flag: '🇸🇿' },
  { iso2: 'ET', dialCode: '+251', nameEn: 'Ethiopia', nameAr: 'إثيوبيا', nameFr: 'Éthiopie', nameEs: 'Etiopía', flag: '🇪🇹' },
  { iso2: 'FJ', dialCode: '+679', nameEn: 'Fiji', nameAr: 'فيجي', nameFr: 'Fidji', nameEs: 'Fiyi', flag: '🇫🇯' },
  { iso2: 'FI', dialCode: '+358', nameEn: 'Finland', nameAr: 'فنلندا', nameFr: 'Finlande', nameEs: 'Finlandia', flag: '🇫🇮' },
  { iso2: 'FR', dialCode: '+33', nameEn: 'France', nameAr: 'فرنسا', nameFr: 'France', nameEs: 'Francia', flag: '🇫🇷' },
  { iso2: 'GA', dialCode: '+241', nameEn: 'Gabon', nameAr: 'الغابون', nameFr: 'Gabon', nameEs: 'Gabón', flag: '🇬🇦' },
  { iso2: 'GM', dialCode: '+220', nameEn: 'Gambia', nameAr: 'غامبيا', nameFr: 'Gambie', nameEs: 'Gambia', flag: '🇬🇲' },
  { iso2: 'GE', dialCode: '+995', nameEn: 'Georgia', nameAr: 'جورجيا', nameFr: 'Géorgie', nameEs: 'Georgia', flag: '🇬🇪' },
  { iso2: 'DE', dialCode: '+49', nameEn: 'Germany', nameAr: 'ألمانيا', nameFr: 'Allemagne', nameEs: 'Alemania', flag: '🇩🇪' },
  { iso2: 'GH', dialCode: '+233', nameEn: 'Ghana', nameAr: 'غانا', nameFr: 'Ghana', nameEs: 'Ghana', flag: '🇬🇭' },
  { iso2: 'GI', dialCode: '+350', nameEn: 'Gibraltar', nameAr: 'جبل طارق', nameFr: 'Gibraltar', nameEs: 'Gibraltar', flag: '🇬🇮' },
  { iso2: 'GR', dialCode: '+30', nameEn: 'Greece', nameAr: 'اليونان', nameFr: 'Grèce', nameEs: 'Grecia', flag: '🇬🇷' },
  { iso2: 'GD', dialCode: '+1473', nameEn: 'Grenada', nameAr: 'غرينادا', nameFr: 'Grenade', nameEs: 'Granada', flag: '🇬🇩' },
  { iso2: 'GT', dialCode: '+502', nameEn: 'Guatemala', nameAr: 'غواتيمالا', nameFr: 'Guatemala', nameEs: 'Guatemala', flag: '🇬🇹' },
  { iso2: 'GN', dialCode: '+224', nameEn: 'Guinea', nameAr: 'غينيا', nameFr: 'Guinée', nameEs: 'Guinea', flag: '🇬🇳' },
  { iso2: 'GW', dialCode: '+245', nameEn: 'Guinea-Bissau', nameAr: 'غينيا بيساو', nameFr: 'Guinée-Bissau', nameEs: 'Guinea-Bisáu', flag: '🇬🇼' },
  { iso2: 'GY', dialCode: '+592', nameEn: 'Guyana', nameAr: 'غيانا', nameFr: 'Guyana', nameEs: 'Guyana', flag: '🇬🇾' },
  { iso2: 'HT', dialCode: '+509', nameEn: 'Haiti', nameAr: 'هايتي', nameFr: 'Haïti', nameEs: 'Haití', flag: '🇭🇹' },
  { iso2: 'HN', dialCode: '+504', nameEn: 'Honduras', nameAr: 'هندوراس', nameFr: 'Honduras', nameEs: 'Honduras', flag: '🇭🇳' },
  { iso2: 'HK', dialCode: '+852', nameEn: 'Hong Kong', nameAr: 'هونغ كونغ', nameFr: 'Hong Kong', nameEs: 'Hong Kong', flag: '🇭🇰' },
  { iso2: 'HU', dialCode: '+36', nameEn: 'Hungary', nameAr: 'المجر', nameFr: 'Hongrie', nameEs: 'Hungría', flag: '🇭🇺' },
  { iso2: 'IS', dialCode: '+354', nameEn: 'Iceland', nameAr: 'آيسلندا', nameFr: 'Islande', nameEs: 'Islandia', flag: '🇮🇸' },
  { iso2: 'IN', dialCode: '+91', nameEn: 'India', nameAr: 'الهند', nameFr: 'Inde', nameEs: 'India', flag: '🇮🇳' },
  { iso2: 'ID', dialCode: '+62', nameEn: 'Indonesia', nameAr: 'إندونيسيا', nameFr: 'Indonésie', nameEs: 'Indonesia', flag: '🇮🇩' },
  { iso2: 'IR', dialCode: '+98', nameEn: 'Iran', nameAr: 'إيران', nameFr: 'Iran', nameEs: 'Irán', flag: '🇮🇷' },
  { iso2: 'IQ', dialCode: '+964', nameEn: 'Iraq', nameAr: 'العراق', nameFr: 'Irak', nameEs: 'Irak', flag: '🇮🇶' },
  { iso2: 'IE', dialCode: '+353', nameEn: 'Ireland', nameAr: 'أيرلندا', nameFr: 'Irlande', nameEs: 'Irlanda', flag: '🇮🇪' },
  { iso2: 'IL', dialCode: '+972', nameEn: 'Israel', nameAr: 'إسرائيل', nameFr: 'Israël', nameEs: 'Israel', flag: '🇮🇱' },
  { iso2: 'IT', dialCode: '+39', nameEn: 'Italy', nameAr: 'إيطاليا', nameFr: 'Italie', nameEs: 'Italia', flag: '🇮🇹' },
  { iso2: 'JM', dialCode: '+1876', nameEn: 'Jamaica', nameAr: 'جاميكا', nameFr: 'Jamaïque', nameEs: 'Jamaica', flag: '🇯🇲' },
  { iso2: 'JP', dialCode: '+81', nameEn: 'Japan', nameAr: 'اليابان', nameFr: 'Japon', nameEs: 'Japón', flag: '🇯🇵' },
  { iso2: 'JO', dialCode: '+962', nameEn: 'Jordan', nameAr: 'الأردن', nameFr: 'Jordanie', nameEs: 'Jordania', flag: '🇯🇴' },
  { iso2: 'KZ', dialCode: '+7', nameEn: 'Kazakhstan', nameAr: 'كازاخستان', nameFr: 'Kazakhstan', nameEs: 'Kazajistán', flag: '🇰🇿' },
  { iso2: 'KE', dialCode: '+254', nameEn: 'Kenya', nameAr: 'كينيا', nameFr: 'Kenya', nameEs: 'Kenia', flag: '🇰🇪' },
  { iso2: 'KW', dialCode: '+965', nameEn: 'Kuwait', nameAr: 'الكويت', nameFr: 'Koweït', nameEs: 'Kuwait', flag: '🇰🇼' },
  { iso2: 'KG', dialCode: '+996', nameEn: 'Kyrgyzstan', nameAr: 'قيرغيزستان', nameFr: 'Kirghizistan', nameEs: 'Kirguistán', flag: '🇰🇬' },
  { iso2: 'LA', dialCode: '+856', nameEn: 'Laos', nameAr: 'لاوس', nameFr: 'Laos', nameEs: 'Laos', flag: '🇱🇦' },
  { iso2: 'LV', dialCode: '+371', nameEn: 'Latvia', nameAr: 'لاتفيا', nameFr: 'Lettonie', nameEs: 'Letonia', flag: '🇱🇻' },
  { iso2: 'LB', dialCode: '+961', nameEn: 'Lebanon', nameAr: 'لبنان', nameFr: 'Liban', nameEs: 'Líbano', flag: '🇱🇧' },
  { iso2: 'LS', dialCode: '+266', nameEn: 'Lesotho', nameAr: 'ليسوتو', nameFr: 'Lesotho', nameEs: 'Lesoto', flag: '🇱🇸' },
  { iso2: 'LR', dialCode: '+231', nameEn: 'Liberia', nameAr: 'ليبيريا', nameFr: 'Libéria', nameEs: 'Liberia', flag: '🇱🇷' },
  { iso2: 'LY', dialCode: '+218', nameEn: 'Libya', nameAr: 'ليبيا', nameFr: 'Libye', nameEs: 'Libia', flag: '🇱🇾' },
  { iso2: 'LI', dialCode: '+423', nameEn: 'Liechtenstein', nameAr: 'ليختنشتاين', nameFr: 'Liechtenstein', nameEs: 'Liechtenstein', flag: '🇱🇮' },
  { iso2: 'LT', dialCode: '+370', nameEn: 'Lithuania', nameAr: 'ليتوانيا', nameFr: 'Lituanie', nameEs: 'Lituania', flag: '🇱🇹' },
  { iso2: 'LU', dialCode: '+352', nameEn: 'Luxembourg', nameAr: 'لوكسمبورغ', nameFr: 'Luxembourg', nameEs: 'Luxemburgo', flag: '🇱🇺' },
  { iso2: 'MG', dialCode: '+261', nameEn: 'Madagascar', nameAr: 'مدغشقر', nameFr: 'Madagascar', nameEs: 'Madagascar', flag: '🇲🇬' },
  { iso2: 'MW', dialCode: '+265', nameEn: 'Malawi', nameAr: 'مالاوي', nameFr: 'Malawi', nameEs: 'Malaui', flag: '🇲🇼' },
  { iso2: 'MY', dialCode: '+60', nameEn: 'Malaysia', nameAr: 'ماليزيا', nameFr: 'Malaisie', nameEs: 'Malasia', flag: '🇲🇾' },
  { iso2: 'MV', dialCode: '+960', nameEn: 'Maldives', nameAr: 'جزر المالديف', nameFr: 'Maldives', nameEs: 'Maldivas', flag: '🇲🇻' },
  { iso2: 'ML', dialCode: '+223', nameEn: 'Mali', nameAr: 'مالي', nameFr: 'Mali', nameEs: 'Malí', flag: '🇲🇱' },
  { iso2: 'MT', dialCode: '+356', nameEn: 'Malta', nameAr: 'مالطا', nameFr: 'Malte', nameEs: 'Malta', flag: '🇲🇹' },
  { iso2: 'MR', dialCode: '+222', nameEn: 'Mauritania', nameAr: 'موريتانيا', nameFr: 'Mauritanie', nameEs: 'Mauritania', flag: '🇲🇷' },
  { iso2: 'MU', dialCode: '+230', nameEn: 'Mauritius', nameAr: 'موريشيوس', nameFr: 'Maurice', nameEs: 'Mauricio', flag: '🇲🇺' },
  { iso2: 'MX', dialCode: '+52', nameEn: 'Mexico', nameAr: 'المكسيك', nameFr: 'Mexique', nameEs: 'México', flag: '🇲🇽' },
  { iso2: 'MD', dialCode: '+373', nameEn: 'Moldova', nameAr: 'مولدوفا', nameFr: 'Moldavie', nameEs: 'Moldavia', flag: '🇲🇩' },
  { iso2: 'MC', dialCode: '+377', nameEn: 'Monaco', nameAr: 'موناكو', nameFr: 'Monaco', nameEs: 'Mónaco', flag: '🇲🇨' },
  { iso2: 'MN', dialCode: '+976', nameEn: 'Mongolia', nameAr: 'منغوليا', nameFr: 'Mongolie', nameEs: 'Mongolia', flag: '🇲🇳' },
  { iso2: 'ME', dialCode: '+382', nameEn: 'Montenegro', nameAr: 'الجبل الأسود', nameFr: 'Monténégro', nameEs: 'Montenegro', flag: '🇲🇪' },
  { iso2: 'MZ', dialCode: '+258', nameEn: 'Mozambique', nameAr: 'موزمبيق', nameFr: 'Mozambique', nameEs: 'Mozambique', flag: '🇲🇿' },
  { iso2: 'MM', dialCode: '+95', nameEn: 'Myanmar', nameAr: 'ميانمار', nameFr: 'Myanmar', nameEs: 'Myanmar', flag: '🇲🇲' },
  { iso2: 'NA', dialCode: '+264', nameEn: 'Namibia', nameAr: 'ناميبيا', nameFr: 'Namibie', nameEs: 'Namibia', flag: '🇳🇦' },
  { iso2: 'NP', dialCode: '+977', nameEn: 'Nepal', nameAr: 'نيبال', nameFr: 'Népal', nameEs: 'Nepal', flag: '🇳🇵' },
  { iso2: 'NL', dialCode: '+31', nameEn: 'Netherlands', nameAr: 'هولندا', nameFr: 'Pays-Bas', nameEs: 'Países Bajos', flag: '🇳🇱' },
  { iso2: 'NZ', dialCode: '+64', nameEn: 'New Zealand', nameAr: 'نيوزيلندا', nameFr: 'Nouvelle-Zélande', nameEs: 'Nueva Zelanda', flag: '🇳🇿' },
  { iso2: 'NI', dialCode: '+505', nameEn: 'Nicaragua', nameAr: 'نيكاراغوا', nameFr: 'Nicaragua', nameEs: 'Nicaragua', flag: '🇳🇮' },
  { iso2: 'NE', dialCode: '+227', nameEn: 'Niger', nameAr: 'النيجر', nameFr: 'Niger', nameEs: 'Níger', flag: '🇳🇪' },
  { iso2: 'NG', dialCode: '+234', nameEn: 'Nigeria', nameAr: 'نيجيريا', nameFr: 'Nigéria', nameEs: 'Nigeria', flag: '🇳🇬' },
  { iso2: 'KP', dialCode: '+850', nameEn: 'North Korea', nameAr: 'كوريا الشمالية', nameFr: 'Corée du Nord', nameEs: 'Corea del Norte', flag: '🇰🇵' },
  { iso2: 'MK', dialCode: '+389', nameEn: 'North Macedonia', nameAr: 'مقدونيا الشمالية', nameFr: 'Macédoine du Nord', nameEs: 'Macedonia del Norte', flag: '🇲🇰' },
  { iso2: 'NO', dialCode: '+47', nameEn: 'Norway', nameAr: 'النرويج', nameFr: 'Norvège', nameEs: 'Noruega', flag: '🇳🇴' },
  { iso2: 'OM', dialCode: '+968', nameEn: 'Oman', nameAr: 'عُمان', nameFr: 'Oman', nameEs: 'Omán', flag: '🇴🇲' },
  { iso2: 'PK', dialCode: '+92', nameEn: 'Pakistan', nameAr: 'باكستان', nameFr: 'Pakistan', nameEs: 'Pakistán', flag: '🇵🇰' },
  { iso2: 'PS', dialCode: '+970', nameEn: 'Palestine', nameAr: 'فلسطين', nameFr: 'Palestine', nameEs: 'Palestina', flag: '🇵🇸' },
  { iso2: 'PA', dialCode: '+507', nameEn: 'Panama', nameAr: 'بنما', nameFr: 'Panama', nameEs: 'Panamá', flag: '🇵🇦' },
  { iso2: 'PG', dialCode: '+675', nameEn: 'Papua New Guinea', nameAr: 'بابوا غينيا الجديدة', nameFr: 'Papouasie-Nouvelle-Guinée', nameEs: 'Papúa Nueva Guinea', flag: '🇵🇬' },
  { iso2: 'PY', dialCode: '+595', nameEn: 'Paraguay', nameAr: 'باراغواي', nameFr: 'Paraguay', nameEs: 'Paraguay', flag: '🇵🇾' },
  { iso2: 'PE', dialCode: '+51', nameEn: 'Peru', nameAr: 'بيرو', nameFr: 'Pérou', nameEs: 'Perú', flag: '🇵🇪' },
  { iso2: 'PH', dialCode: '+63', nameEn: 'Philippines', nameAr: 'الفلبين', nameFr: 'Philippines', nameEs: 'Filipinas', flag: '🇵🇭' },
  { iso2: 'PL', dialCode: '+48', nameEn: 'Poland', nameAr: 'بولندا', nameFr: 'Pologne', nameEs: 'Polonia', flag: '🇵🇱' },
  { iso2: 'PT', dialCode: '+351', nameEn: 'Portugal', nameAr: 'البرتغال', nameFr: 'Portugal', nameEs: 'Portugal', flag: '🇵🇹' },
  { iso2: 'QA', dialCode: '+974', nameEn: 'Qatar', nameAr: 'قطر', nameFr: 'Qatar', nameEs: 'Catar', flag: '🇶🇦' },
  { iso2: 'RO', dialCode: '+40', nameEn: 'Romania', nameAr: 'رومانيا', nameFr: 'Roumanie', nameEs: 'Rumania', flag: '🇷🇴' },
  { iso2: 'RU', dialCode: '+7', nameEn: 'Russia', nameAr: 'روسيا', nameFr: 'Russie', nameEs: 'Rusia', flag: '🇷🇺' },
  { iso2: 'RW', dialCode: '+250', nameEn: 'Rwanda', nameAr: 'رواندا', nameFr: 'Rwanda', nameEs: 'Ruanda', flag: '🇷🇼' },
  { iso2: 'SA', dialCode: '+966', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', nameFr: 'Arabie saoudite', nameEs: 'Arabia Saudita', flag: '🇸🇦' },
  { iso2: 'SN', dialCode: '+221', nameEn: 'Senegal', nameAr: 'السنغال', nameFr: 'Sénégal', nameEs: 'Senegal', flag: '🇸🇳' },
  { iso2: 'RS', dialCode: '+381', nameEn: 'Serbia', nameAr: 'صربيا', nameFr: 'Serbie', nameEs: 'Serbia', flag: '🇷🇸' },
  { iso2: 'SG', dialCode: '+65', nameEn: 'Singapore', nameAr: 'سنغافورة', nameFr: 'Singapour', nameEs: 'Singapur', flag: '🇸🇬' },
  { iso2: 'SK', dialCode: '+421', nameEn: 'Slovakia', nameAr: 'سلوفاكيا', nameFr: 'Slovaquie', nameEs: 'Eslovaquia', flag: '🇸🇰' },
  { iso2: 'SI', dialCode: '+386', nameEn: 'Slovenia', nameAr: 'سلوفينيا', nameFr: 'Slovénie', nameEs: 'Eslovenia', flag: '🇸🇮' },
  { iso2: 'ZA', dialCode: '+27', nameEn: 'South Africa', nameAr: 'جنوب أفريقيا', nameFr: 'Afrique du Sud', nameEs: 'Sudáfrica', flag: '🇿🇦' },
  { iso2: 'KR', dialCode: '+82', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', nameFr: 'Corée du Sud', nameEs: 'Corea del Sur', flag: '🇰🇷' },
  { iso2: 'ES', dialCode: '+34', nameEn: 'Spain', nameAr: 'إسبانيا', nameFr: 'Espagne', nameEs: 'España', flag: '🇪🇸' },
  { iso2: 'LK', dialCode: '+94', nameEn: 'Sri Lanka', nameAr: 'سريلانكا', nameFr: 'Sri Lanka', nameEs: 'Sri Lanka', flag: '🇱🇰' },
  { iso2: 'SD', dialCode: '+249', nameEn: 'Sudan', nameAr: 'السودان', nameFr: 'Soudan', nameEs: 'Sudán', flag: '🇸🇩' },
  { iso2: 'SE', dialCode: '+46', nameEn: 'Sweden', nameAr: 'السويد', nameFr: 'Suède', nameEs: 'Suecia', flag: '🇸🇪' },
  { iso2: 'CH', dialCode: '+41', nameEn: 'Switzerland', nameAr: 'سويسرا', nameFr: 'Suisse', nameEs: 'Suiza', flag: '🇨🇭' },
  { iso2: 'SY', dialCode: '+963', nameEn: 'Syria', nameAr: 'سوريا', nameFr: 'Syrie', nameEs: 'Siria', flag: '🇸🇾' },
  { iso2: 'TW', dialCode: '+886', nameEn: 'Taiwan', nameAr: 'تايوان', nameFr: 'Taïwan', nameEs: 'Taiwán', flag: '🇹🇼' },
  { iso2: 'TJ', dialCode: '+992', nameEn: 'Tajikistan', nameAr: 'طاجيكستان', nameFr: 'Tadjikistan', nameEs: 'Tayikistán', flag: '🇹🇯' },
  { iso2: 'TZ', dialCode: '+255', nameEn: 'Tanzania', nameAr: 'تنزانيا', nameFr: 'Tanzanie', nameEs: 'Tanzania', flag: '🇹🇿' },
  { iso2: 'TH', dialCode: '+66', nameEn: 'Thailand', nameAr: 'تايلاند', nameFr: 'Thaïlande', nameEs: 'Tailandia', flag: '🇹🇭' },
  { iso2: 'TG', dialCode: '+228', nameEn: 'Togo', nameAr: 'توغو', nameFr: 'Togo', nameEs: 'Togo', flag: '🇹🇬' },
  { iso2: 'TN', dialCode: '+216', nameEn: 'Tunisia', nameAr: 'تونس', nameFr: 'Tunisie', nameEs: 'Túnez', flag: '🇹🇳' },
  { iso2: 'TR', dialCode: '+90', nameEn: 'Turkey', nameAr: 'تركيا', nameFr: 'Turquie', nameEs: 'Turquía', flag: '🇹🇷' },
  { iso2: 'UG', dialCode: '+256', nameEn: 'Uganda', nameAr: 'أوغندا', nameFr: 'Ouganda', nameEs: 'Uganda', flag: '🇺🇬' },
  { iso2: 'UA', dialCode: '+380', nameEn: 'Ukraine', nameAr: 'أوكرانيا', nameFr: 'Ukraine', nameEs: 'Ucrania', flag: '🇺🇦' },
  { iso2: 'AE', dialCode: '+971', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', nameFr: 'Émirats arabes unis', nameEs: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
  { iso2: 'GB', dialCode: '+44', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', nameFr: 'Royaume-Uni', nameEs: 'Reino Unido', flag: '🇬🇧' },
  { iso2: 'US', dialCode: '+1', nameEn: 'United States', nameAr: 'الولايات المتحدة الأمريكية', nameFr: 'États-Unis', nameEs: 'Estados Unidos', flag: '🇺🇸' },
  { iso2: 'UY', dialCode: '+598', nameEn: 'Uruguay', nameAr: 'أوروغواي', nameFr: 'Uruguay', nameEs: 'Uruguay', flag: '🇺🇾' },
  { iso2: 'UZ', dialCode: '+998', nameEn: 'Uzbekistan', nameAr: 'أوزبكستان', nameFr: 'Ouzbékistan', nameEs: 'Uzbekistán', flag: '🇺🇿' },
  { iso2: 'VE', dialCode: '+58', nameEn: 'Venezuela', nameAr: 'فنزويلا', nameFr: 'Venezuela', nameEs: 'Venezuela', flag: '🇻🇪' },
  { iso2: 'VN', dialCode: '+84', nameEn: 'Vietnam', nameAr: 'فيتنام', nameFr: 'Viêt Nam', nameEs: 'Vietnam', flag: '🇻🇳' },
  { iso2: 'YE', dialCode: '+967', nameEn: 'Yemen', nameAr: 'اليمن', nameFr: 'Yémen', nameEs: 'Yemen', flag: '🇾🇪' },
  { iso2: 'ZM', dialCode: '+260', nameEn: 'Zambia', nameAr: 'زامبيا', nameFr: 'Zambie', nameEs: 'Zambia', flag: '🇿🇲' },
  { iso2: 'ZW', dialCode: '+263', nameEn: 'Zimbabwe', nameAr: 'زيمبابوي', nameFr: 'Zimbabwe', nameEs: 'Zimbabue', flag: '🇿🇼' },
];

export const DEFAULT_COUNTRY: CountryItem = ALL_COUNTRIES[0]; // 🇲🇦 Morocco

/**
 * Returns localized country name according to active language
 */
export function getLocalizedCountryName(country: CountryItem, lang: string): string {
  const code = (lang || 'ar').toLowerCase().substring(0, 2);
  if (code === 'fr') return country.nameFr;
  if (code === 'en') return country.nameEn;
  if (code === 'es') return country.nameEs;
  return country.nameAr;
}

/**
 * Filter countries by search query (EN/FR/AR/ES name, dialCode, ISO2)
 * Morocco remains at index 0 if it matches the query.
 */
export function searchCountries(query: string, lang: string): CountryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_COUNTRIES;

  const cleanDialQuery = q.startsWith('+') ? q : `+${q}`;

  return ALL_COUNTRIES.filter(c => {
    const matchEn = c.nameEn.toLowerCase().includes(q);
    const matchFr = c.nameFr.toLowerCase().includes(q);
    const matchAr = c.nameAr.toLowerCase().includes(q);
    const matchEs = c.nameEs.toLowerCase().includes(q);
    const matchIso = c.iso2.toLowerCase().includes(q);
    const matchDial = c.dialCode.includes(q) || c.dialCode.includes(cleanDialQuery);

    return matchEn || matchFr || matchAr || matchEs || matchIso || matchDial;
  });
}
