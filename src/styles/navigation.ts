import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, SIZES  } from './theme';    

export const navigationStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    backgroundColor: COLORS.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.dark,
  },
  tabLabel: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
}); 