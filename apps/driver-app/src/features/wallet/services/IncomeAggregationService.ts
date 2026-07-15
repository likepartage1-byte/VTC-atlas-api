import { CompletedRide } from '../../orders/domain/entities/completedRide';
import { Transaction, DailyIncomeSummary, WeeklyIncomeSummary } from '../domain/entities/wallet.types';

export class IncomeAggregationService {
  /**
   * Format a date into YYYY-MM-DD string key
   */
  static formatDateKey(date: Date): string {
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dy = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  }

  /**
   * Aggregate stats for a single day based on completed rides and transactions
   */
  static aggregateDaily(
    date: Date,
    completedRides: CompletedRide[],
    transactions: Transaction[]
  ): DailyIncomeSummary {
    const targetKey = this.formatDateKey(date);

    // 1. Filter rides corresponding to this day
    const dayRides = completedRides.filter((ride) => {
      const rideDate = new Date(ride.createdAt);
      return this.formatDateKey(rideDate) === targetKey;
    });

    // 2. Filter daily transactions corresponding to this day
    const dayTxns = transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return this.formatDateKey(txDate) === targetKey;
    });

    // 3. Sum up calculations from rides
    let grossIncome = 0;
    let totalCommissions = 0;
    let totalTaxes = 0;
    let totalFees = 0;
    let distanceCovered = 0;

    dayRides.forEach((ride) => {
      grossIncome += ride.fare;
      totalCommissions += ride.commission;
      totalTaxes += ride.tva;
      totalFees += ride.serviceFee;
      distanceCovered += ride.distance;
    });

    // 4. Sum up any completed daily bonuses from transactions
    let totalBonuses = 0;
    dayTxns.forEach((tx) => {
      if (tx.type === 'bonus' && tx.status === 'completed') {
        totalBonuses += tx.amount;
      }
    });

    // Net Income = Gross + Bonuses - Commissions - Taxes - Fees
    const netIncome = Math.round((grossIncome + totalBonuses - totalCommissions - totalTaxes - totalFees) * 100) / 100;
    const ridesCount = dayRides.length;
    const avgProfitPerRide = ridesCount > 0 ? Math.round((netIncome / ridesCount) * 100) / 100 : 0;

    // Simulate work hours independently of ride duration (e.g. online session time)
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ...
    const workHours = dayOfWeek === 0 ? 0 : 3 + (dayOfWeek * 0.75); // Mon -> ~3.75 hrs, Sat -> ~7.5 hrs, Sun -> 0 hrs

    return {
      date: targetKey,
      grossIncome: Math.round(grossIncome * 100) / 100,
      netIncome,
      ridesCount,
      workHours: Math.round(workHours * 10) / 10,
      avgProfitPerRide,
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      distanceCovered: Math.round(distanceCovered * 10) / 10,
    };
  }

  /**
   * Aggregate stats for a whole week (Monday to Sunday)
   */
  static aggregateWeekly(
    activeDate: Date,
    completedRides: CompletedRide[],
    transactions: Transaction[],
    isArabic: boolean
  ): WeeklyIncomeSummary {
    // 1. Locate Monday of the activeDate's week
    const dateCopy = new Date(activeDate);
    const day = dateCopy.getDay();
    // In JS: Sun = 0, Mon = 1... Sat = 6. 
    // Shift so Mon is first day, Sun is last day.
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateCopy.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const dailySummaries: DailyIncomeSummary[] = [];
    let totalGrossIncome = 0;
    let totalNetIncome = 0;
    let totalRidesCount = 0;
    let totalWorkHours = 0;

    // Day localization lists
    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 2. Settle 7 days (Monday through Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);

      const summary = this.aggregateDaily(currentDay, completedRides, transactions);
      dailySummaries.push(summary);

      totalGrossIncome += summary.grossIncome;
      totalNetIncome += summary.netIncome;
      totalRidesCount += summary.ridesCount;
      totalWorkHours += summary.workHours;
    }

    // 3. Search for the best day (highest netIncome)
    let bestDayIdx = 0;
    let maxIncome = -1;
    dailySummaries.forEach((summary, idx) => {
      if (summary.netIncome > maxIncome) {
        maxIncome = summary.netIncome;
        bestDayIdx = idx;
      }
    });

    const bestDate = new Date(monday);
    bestDate.setDate(monday.getDate() + bestDayIdx);
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const bestDayName = dayKeys[bestDate.getDay()];

    // 4. Determine peak hour based on date-seed (e.g. week of month)
    const weekOfMonth = Math.ceil(monday.getDate() / 7);
    const peakHour = weekOfMonth % 2 === 0 ? '17:00 - 19:00' : '08:00 - 10:00';

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      startDate: this.formatDateKey(monday),
      endDate: this.formatDateKey(sunday),
      totalGrossIncome: Math.round(totalGrossIncome * 100) / 100,
      totalNetIncome: Math.round(totalNetIncome * 100) / 100,
      totalRidesCount,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      bestDay: maxIncome > 0 ? bestDayName : '--',
      peakHour: totalRidesCount > 0 ? peakHour : '--',
      dailySummaries,
    };
  }
}
