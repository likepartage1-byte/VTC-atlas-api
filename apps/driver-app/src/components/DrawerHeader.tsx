/**
 * DrawerHeader — شريط العنوان الموحد للشاشات المفتوحة من القائمة الجانبية
 *
 * يعرض أيقونة القائمة (☰) بدلاً من سهم الرجوع.
 * عند الضغط على الأيقونة تفتح القائمة الجانبية (SideDrawer) مباشرة فوق الشاشة الحالية.
 * يدعم RTL/LTR، الوضع الداكن/الفاتح، وSafe Area.
 */
import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { SideDrawer } from '../features/orders/components/SideDrawer';

export const DRAWER_OPEN_EVENT = 'OPEN_DRAWER';

interface DrawerHeaderProps {
  /** عنوان الصفحة */
  title?: string;
  /** زر إضافي على الجانب الآخر (اختياري) */
  rightElement?: React.ReactNode;
  /** إخفاء العنوان والزر الجانبي وإبقاء أيقونة القائمة فقط */
  showOnlyMenu?: boolean;
}

export const DrawerHeader = memo(({ title, rightElement, showOnlyMenu = false }: DrawerHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [drawerOpen, setDrawerOpen] = useState(false);

  const topPadding = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 0);
  const HEADER_H   = 56 + topPadding;

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const MenuBtn = (
    <TouchableOpacity
      style={[styles.menuBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 20 }]}
      onPress={openDrawer}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Menu size={24} color={colors.textPrimary} />
    </TouchableOpacity>
  );

  if (showOnlyMenu) {
    return (
      <>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <View
          style={[
            styles.header,
            {
              height:          HEADER_H,
              paddingTop:      topPadding,
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              flexDirection:   isRTL ? 'row-reverse' : 'row',
              justifyContent:  'flex-start',
            },
          ]}
        >
          {MenuBtn}
        </View>

        <SideDrawer isOpen={drawerOpen} onClose={closeDrawer} />
      </>
    );
  }

  const Right = rightElement ?? <View style={styles.placeholder} />;

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <View
        style={[
          styles.header,
          {
            height:          HEADER_H,
            paddingTop:      topPadding,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
          isRTL && styles.headerRTL,
        ]}
      >
        {isRTL ? Right : MenuBtn}

        {title ? (
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {isRTL ? MenuBtn : Right}
      </View>

      {/* SideDrawer mounted self-contained for any screen using DrawerHeader */}
      <SideDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingBottom:      10,
    borderBottomWidth:  1,
  },
  headerRTL: { flexDirection: 'row-reverse' },

  menuBtn: {
    width:          40,
    height:         40,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
  },

  title: {
    flex:       1,
    fontSize:   17,
    fontWeight: '700',
    textAlign:  'center',
    marginHorizontal: 8,
  },

  placeholder: { width: 40 },
});
