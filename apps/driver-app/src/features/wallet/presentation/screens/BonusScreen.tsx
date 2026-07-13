import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, ScrollView } from 'react-native';
import { Award, Zap, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';

const ICON_SIZE = 20;

export const BonusScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  // Mock Active Bonus Quest Tracker
  const activeQuests = [
    {
      id: 'qst-001',
      title: 'Weekend Warrior',
      description: 'Complete 10 rides over the weekend to unlock extra payout.',
      progress: 6,
      target: 10,
      reward: 120.0,
      currency: 'MAD',
      expiresIn: 'Expired in 1 day',
    },
    {
      id: 'qst-002',
      title: 'Rush Hour Bonus',
      description: 'Accept 5 consecutive rush hour requests with no cancellations.',
      progress: 1,
      target: 5,
      reward: 35.0,
      currency: 'MAD',
      expiresIn: 'Expired in 6 hours',
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('bonus') || 'Bonus & Rewards'} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Active Quests */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('active_quests') || 'Active Quests'}
        </Text>

        {activeQuests.map((quest) => {
          const ratio = quest.progress / quest.target;
          const percentage = Math.min(Math.round(ratio * 100), 100);

          return (
            <WalletCard key={quest.id} variant="elevated" style={styles.questCard}>
              <View style={styles.questHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <Zap size={ICON_SIZE} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.questTitle, { color: colors.textPrimary }]}>
                      {quest.title}
                    </Text>
                    <Text style={[styles.questExpir, { color: colors.textMuted }]}>
                      {quest.expiresIn}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.questReward, { color: colors.online }]}>
                  +{quest.reward} {quest.currency}
                </Text>
              </View>

              <Text style={[styles.questDesc, { color: colors.textSecondary }]}>
                {quest.description}
              </Text>

              {/* Progress Slider Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceAlt }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: colors.primary, width: `${percentage}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    {quest.progress} / {quest.target} {t('rides') || 'rides'}
                  </Text>
                  <Text style={[styles.progressPercentage, { color: colors.textPrimary }]}>
                    {percentage}%
                  </Text>
                </View>
              </View>
            </WalletCard>
          );
        })}

        {/* Loyalty Tier Summary */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('loyalty_rewards') || 'Loyalty Program'}
        </Text>

        <WalletCard variant="outline" style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Award size={48} color={colors.primary} />
            <View>
              <Text style={[styles.loyaltyTitle, { color: colors.textPrimary }]}>
                {t('gold_driver_status') || 'Gold Partner Member'}
              </Text>
              <Text style={[styles.loyaltySub, { color: colors.textSecondary }]}>
                {t('loyalty_perks_details') || 'Enjoy -2% service commissions and priority dispatch queue.'}
              </Text>
            </View>
          </View>
        </WalletCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  questCard: {
    padding: 18,
    gap: 12,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  questExpir: {
    fontSize: 11,
  },
  questReward: {
    fontSize: 15,
    fontWeight: '800',
  },
  questDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  progressContainer: {
    gap: 8,
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '700',
  },
  loyaltyCard: {
    padding: 20,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loyaltyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  loyaltySub: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    paddingRight: 32,
  },
});
