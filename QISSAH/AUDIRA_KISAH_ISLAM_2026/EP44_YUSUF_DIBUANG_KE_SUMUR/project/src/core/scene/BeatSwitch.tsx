// Show only the active beat's children — prevents "all objects visible at once".
//
// Usage:
//   <BeatSwitch active={beatIndex}>
//     <group>{/* beat 0 objects */}</group>
//     <group>{/* beat 1 objects */}</group>
//     <group>{/* beat 2 objects */}</group>
//   </BeatSwitch>
//
// Works in both 3D (<group>) and 2D (AbsoluteFill) contexts.
// Children are mounted/unmounted, not hidden, so GPU memory is freed between beats.

import React from "react";

export const BeatSwitch: React.FC<{
  /** Zero-based index of the currently active beat. */
  active: number;
  children: React.ReactNode;
}> = ({ active, children }) => {
  const arr = React.Children.toArray(children);
  const clamped = Math.max(0, Math.min(active, arr.length - 1));
  return <>{arr[clamped]}</>;
};

/** Convenience: show child only when `visible` is true. Mounts/unmounts cleanly. */
export const ShowWhen: React.FC<{
  visible: boolean;
  children: React.ReactNode;
}> = ({ visible, children }) => {
  return visible ? <>{children}</> : null;
};
