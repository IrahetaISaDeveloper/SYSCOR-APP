import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
  primary: '#C62828',
  primaryDark: '#9B1B1B',
  background: '#FFFFFF',
  surface: '#F7F7F7',
  textDark: '#1A1A1A',
  textGray: '#6B6B6B',
  textLight: '#AAAAAA',
  border: '#EFEFEF',
  white: '#FFFFFF',
  badge: '#FF6B35',
};

const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── HEADER ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 38,
    height: 38,
  },
  headerBrandText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // ── SEARCH BAR ──────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },

  // ── CATEGORIES ──────────────────────────────────────
  categoriesContainer: {
    paddingLeft: 16,
    paddingBottom: 4,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  categoryChipTextActive: {
    color: colors.white,
  },

  // ── SECTION HEADER ──────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── PROMO CARDS ─────────────────────────────────────
  promosContainer: {
    paddingLeft: 16,
    paddingBottom: 4,
  },
  promoCard: {
    width: width * 0.7,
    height: 160,
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    backgroundColor: colors.textDark,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    padding: 14,
    justifyContent: 'flex-end',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  promoBadgeNew: {
    backgroundColor: colors.badge,
  },
  promoBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  // ── DISH LIST ───────────────────────────────────────
  dishesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dishImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  dishInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 3,
  },
  dishDescription: {
    fontSize: 12,
    color: colors.textGray,
    lineHeight: 17,
    marginBottom: 6,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  dishQty: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textGray,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── ERROR / EMPTY ────────────────────────────────────────────────
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.textGray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    paddingVertical: 32,
  },

  // ── BOTTOM NAV ──────────────────────────────────────────────────────
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textGray,
    marginTop: 3,
  },
  navTextActive: {
    color: colors.white,
  },
});

export default menuStyles;
