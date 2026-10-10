import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  content: {
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 12,
  },

  navCard: {
    backgroundColor: employeePalette.ink,
    borderRadius: 22,
    padding: 17,
    gap: 13,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  navIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  navInstruction: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    letterSpacing: -0.34,
    color: employeePalette.bg,
  },
  navStreet: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: employeePalette.bg,
    opacity: 0.72,
  },
  navDistance: {
    fontFamily: fonts.monoMedium,
    fontSize: 18,
    color: employeePalette.bg,
  },
  navDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  navFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navArrival: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    opacity: 0.72,
  },
  navMetrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  navMono: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: employeePalette.bg,
  },
  navMonoDim: {
    opacity: 0.72,
  },
  navMonoStrong: {
    fontFamily: fonts.monoMedium,
  },

  progressCard: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 20,
    padding: 15,
    gap: 13,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: employeePalette.muted,
  },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flex: 1,
    height: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.475,
  },

  destinationCard: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1.5,
    borderColor: employeePalette.accent,
    borderRadius: 20,
    padding: 15,
    gap: 9,
  },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  destinationLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.7,
    color: employeePalette.accent,
  },
  destinationAddress: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    letterSpacing: -0.15,
    color: employeePalette.ink,
  },
  destinationDetail: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17.4,
    color: employeePalette.muted,
  },
  destinationContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: employeePalette.surface2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginTop: 2,
  },
  destinationName: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: employeePalette.ink,
  },
  destinationPhone: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: employeePalette.muted,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 9,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 16,
    padding: 13,
  },
  actionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
  },

  mapCard: {
    height: 210,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: employeePalette.line,
    backgroundColor: employeePalette.surface2,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  mapPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    backgroundColor: "rgba(247,243,233,0.86)",
  },
  mapOverlayText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    color: employeePalette.muted,
  },
  mapRetry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  mapRetryLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: employeePalette.accent,
  },
  permissionNote: {
    marginTop: -4,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    color: employeePalette.warnInk,
  },
});
