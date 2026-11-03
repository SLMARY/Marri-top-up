import { MembershipPackage, DiamondPackage, MlbbDiamondPackage, BloodStrikePackage } from '../types';

/**
 * OFFICIAL UCHIHA MARRI TOP UP MEMBERSHIP PRICE LIST (LKR)
 * 1. Weekly Lite Membership — LKR 150
 * 2. Weekly Membership — LKR 570
 * 3. Monthly Membership — LKR 2,700
 * 4. VIP Membership — LKR 3,300
 * 5. S VIP Membership — LKR 5,000
 * 6. VIP PRO MAX Membership — LKR 6,400
 * 7. SVIP PRO MAX Membership — LKR 9,900
 */
export const MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: 'weekly_lite_membership',
    name: 'Weekly Lite Membership',
    price: 150,
    duration: '7 Days Access',
    badge: 'LITE',
  },
  {
    id: 'weekly_membership',
    name: 'Weekly Membership',
    price: 570,
    duration: '7 Days Diamond Access',
    badge: 'POPULAR',
    popular: true,
  },
  {
    id: 'monthly_membership',
    name: 'Monthly Membership',
    price: 2700,
    duration: '30 Days Elite Access',
    badge: 'BEST VALUE',
    popular: true,
  },
  {
    id: 'vip_membership',
    name: 'VIP Membership',
    price: 3300,
    duration: 'VIP Tier Benefits',
    badge: 'VIP',
  },
  {
    id: 's_vip_membership',
    name: 'S VIP Membership',
    price: 5000,
    duration: 'Super VIP Perks',
    badge: 'S-VIP',
  },
  {
    id: 'vip_pro_max_membership',
    name: 'VIP PRO MAX Membership',
    price: 6400,
    duration: 'Pro Max Tier Gaming Pass',
    badge: 'PRO MAX',
  },
  {
    id: 'svip_pro_max_membership',
    name: 'SVIP PRO MAX Membership',
    price: 9900,
    duration: 'Ultimate Elite SVIP Pass',
    badge: 'ELITE SVIP',
  },
];

export const DIAMOND_PACKAGES: DiamondPackage[] = [
  {
    id: 'diamond_100',
    name: '100 + 10 Diamonds',
    diamonds: 100,
    bonus: 10,
    price: 280,
  },
  {
    id: 'diamond_310',
    name: '310 + 31 Diamonds',
    diamonds: 310,
    bonus: 31,
    price: 850,
  },
  {
    id: 'diamond_520',
    name: '520 + 52 Diamonds',
    diamonds: 520,
    bonus: 52,
    price: 1420,
    popular: true,
  },
  {
    id: 'diamond_1060',
    name: '1060 + 106 Diamonds',
    diamonds: 1060,
    bonus: 106,
    price: 2850,
  },
  {
    id: 'diamond_2180',
    name: '2180 + 218 Diamonds',
    diamonds: 2180,
    bonus: 218,
    price: 5700,
  },
  {
    id: 'diamond_5600',
    name: '5600 + 560 Diamonds',
    diamonds: 5600,
    bonus: 560,
    price: 14200,
  },
];

// Alias for Free Fire Diamond Packages
export const FREE_FIRE_DIAMOND_PACKAGES = DIAMOND_PACKAGES;

/**
 * OFFICIAL MOBILE LEGENDS: BANG BANG (MLBB) DIAMOND PACKAGES (LKR)
 * 1. 61 Diamonds   — 56 + 5 Bonus     — LKR 220
 * 2. 153 Diamonds  — 139 + 14 Bonus   — LKR 530
 * 3. 307 Diamonds  — 277 + 30 Bonus   — LKR 1,050
 * 4. 625 Diamonds  — 553 + 72 Bonus   — LKR 2,050
 * 5. 937 Diamonds  — 829 + 108 Bonus  — LKR 3,060
 * 6. 1603 Diamonds — 1381 + 222 Bonus — LKR 5,060
 * 7. 2608 Diamonds — 2210 + 398 Bonus — LKR 8,060
 * 8. 3287 Diamonds — 2762 + 525 Bonus — LKR 10,100
 * 9. 6629 Diamonds — 5524 + 1105 Bonus — LKR 20,200
 */
export const MLBB_DIAMOND_PACKAGES: MlbbDiamondPackage[] = [
  {
    id: 'mlbb_61',
    name: '61 Diamonds',
    totalDiamonds: 61,
    baseDiamonds: 56,
    bonusDiamonds: 5,
    price: 220,
    badge: 'STARTER',
  },
  {
    id: 'mlbb_153',
    name: '153 Diamonds',
    totalDiamonds: 153,
    baseDiamonds: 139,
    bonusDiamonds: 14,
    price: 530,
    badge: 'POPULAR',
    popular: true,
  },
  {
    id: 'mlbb_307',
    name: '307 Diamonds',
    totalDiamonds: 307,
    baseDiamonds: 277,
    bonusDiamonds: 30,
    price: 1050,
    badge: 'HOT',
  },
  {
    id: 'mlbb_625',
    name: '625 Diamonds',
    totalDiamonds: 625,
    baseDiamonds: 553,
    bonusDiamonds: 72,
    price: 2050,
    badge: 'BEST VALUE',
    popular: true,
  },
  {
    id: 'mlbb_937',
    name: '937 Diamonds',
    totalDiamonds: 937,
    baseDiamonds: 829,
    bonusDiamonds: 108,
    price: 3060,
  },
  {
    id: 'mlbb_1603',
    name: '1603 Diamonds',
    totalDiamonds: 1603,
    baseDiamonds: 1381,
    bonusDiamonds: 222,
    price: 5060,
    badge: 'ELITE',
  },
  {
    id: 'mlbb_2608',
    name: '2608 Diamonds',
    totalDiamonds: 2608,
    baseDiamonds: 2210,
    bonusDiamonds: 398,
    price: 8060,
  },
  {
    id: 'mlbb_3287',
    name: '3287 Diamonds',
    totalDiamonds: 3287,
    baseDiamonds: 2762,
    bonusDiamonds: 525,
    price: 10100,
    badge: 'VIP',
  },
  {
    id: 'mlbb_6629',
    name: '6629 Diamonds',
    totalDiamonds: 6629,
    baseDiamonds: 5524,
    bonusDiamonds: 1105,
    price: 20200,
    badge: 'MYTHIC MAX',
    popular: true,
  },
];

/**
 * OFFICIAL BLOOD STRIKE TOP-UP LIST (LKR)
 * 1. Strike Pass Elite   — Rs. 1,230
 * 2. Strike Pass Premium — Rs. 2,740
 * 3. 100 + 5 Gold        — Rs. 275
 * 4. 300 + 20 Gold       — Rs. 850
 * 5. 500 + 40 Gold       — Rs. 1,430
 * 6. 1000 + 100 Gold     — Rs. 2,770
 * 7. 2000 + 260 Gold     — Rs. 5,440
 * 8. 5000 + 800 Gold     — Rs. 13,400
 * 9. Level Up Pass       — Rs. 640
 */
export const BLOODSTRIKE_PACKAGES: BloodStrikePackage[] = [
  {
    id: 'bs_strike_pass_elite',
    name: 'Strike Pass Elite',
    category: 'pass',
    subtitle: 'Official Season Strike Pass',
    bonusText: 'Unlock Elite Tier Rewards',
    price: 1230,
    badge: 'PASS',
    popular: true,
  },
  {
    id: 'bs_strike_pass_premium',
    name: 'Strike Pass Premium',
    category: 'pass',
    subtitle: 'Premium Season Pass Bundle',
    bonusText: 'Instant Tier Skip + Exclusive Rewards',
    price: 2740,
    badge: 'PASS',
    popular: true,
  },
  {
    id: 'bs_100_gold',
    name: '100 + 5 Gold',
    category: 'gold',
    subtitle: '105 Total Blood Strike Gold',
    bonusText: '+5 Bonus Gold Included',
    price: 275,
    badge: 'GOLD',
  },
  {
    id: 'bs_300_gold',
    name: '300 + 20 Gold',
    category: 'gold',
    subtitle: '320 Total Blood Strike Gold',
    bonusText: '+20 Bonus Gold Included',
    price: 850,
    badge: 'GOLD',
  },
  {
    id: 'bs_500_gold',
    name: '500 + 40 Gold',
    category: 'gold',
    subtitle: '540 Total Blood Strike Gold',
    bonusText: '+40 Bonus Gold Included',
    price: 1430,
    badge: 'GOLD',
    popular: true,
  },
  {
    id: 'bs_1000_gold',
    name: '1000 + 100 Gold',
    category: 'gold',
    subtitle: '1,100 Total Blood Strike Gold',
    bonusText: '+100 Bonus Gold Included',
    price: 2770,
    badge: 'GOLD',
  },
  {
    id: 'bs_2000_gold',
    name: '2000 + 260 Gold',
    category: 'gold',
    subtitle: '2,260 Total Blood Strike Gold',
    bonusText: '+260 Bonus Gold Included',
    price: 5440,
    badge: 'GOLD',
  },
  {
    id: 'bs_5000_gold',
    name: '5000 + 800 Gold',
    category: 'gold',
    subtitle: '5,800 Total Blood Strike Gold',
    bonusText: '+800 Bonus Gold Included',
    price: 13400,
    badge: 'GOLD',
  },
  {
    id: 'bs_level_up_pass',
    name: 'Level Up Pass',
    category: 'pass',
    subtitle: 'Progression Reward Pass',
    bonusText: 'Bonus Gold Milestone Rewards',
    price: 640,
    badge: 'PASS',
    popular: true,
  },
];

