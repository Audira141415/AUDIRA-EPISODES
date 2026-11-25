import * as THREE from "three";
import { BROADCASTFORGE_PALETTE } from "./palette";

export const getStudioFloorMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: BROADCASTFORGE_PALETTE.floorGloss,
    roughness: 0.18,
    metalness: 0.35,
  });

export const getStudioDeskMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: BROADCASTFORGE_PALETTE.broadcastNavy,
    roughness: 0.25,
    metalness: 0.5,
  });

export const getCurvedScreenMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: BROADCASTFORGE_PALETTE.screenBlue,
    roughness: 0.2,
    metalness: 0.1,
    emissive: new THREE.Color(BROADCASTFORGE_PALETTE.broadcastNavy),
    emissiveIntensity: 0.45,
  });

export const getNeonStripMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: BROADCASTFORGE_PALETTE.cyanAccent,
  });

export const getBreakingBannerMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: BROADCASTFORGE_PALETTE.breakingRed,
  });
