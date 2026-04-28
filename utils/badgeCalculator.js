import { BADGES } from '../constants/badges';

export const calculateBadges = stats => {
  return BADGES.map(badge => ({
    ...badge,
    earned: badge.condition(stats),
  }));
};

export const getEarnedBadges = stats => {
  return calculateBadges(stats).filter(b => b.earned);
};
