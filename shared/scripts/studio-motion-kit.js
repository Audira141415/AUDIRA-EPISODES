/**
 * AUDIRA STUDIO MOTION KIT (GSAP 3 Helper Engine)
 * High-performance motion primitives tailored for 9:16 vertical motion graphics
 */

(function (global) {
  const StudioMotion = {
    // Custom easing references
    ease: {
      powerOut: "power4.out",
      expoOut: "expo.out",
      popOvershoot: "back.out(1.4)",
      springy: "elastic.out(1, 0.4)",
      smoothStep: "sine.inOut"
    },

    /**
     * Subtle camera drift (slow zoom in) to keep continuous visual tension
     */
    cameraDrift(target, duration = 10, { scaleTo = 1.04, ease = "sine.inOut" } = {}) {
      if (!window.gsap) return;
      return gsap.to(target, {
        scale: scaleTo,
        duration: duration,
        ease: ease,
        transformOrigin: "center center"
      });
    },

    /**
     * Camera micro-shake for bass impacts, drops, or dramatic facts
     */
    cameraShake(target, { intensity = 6, duration = 0.22, times = 5 } = {}) {
      if (!window.gsap) return;
      const tl = gsap.timeline();
      for (let i = 0; i < times; i++) {
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        tl.to(target, { x, y, duration: duration / times, ease: "power1.inOut" });
      }
      tl.to(target, { x: 0, y: 0, duration: 0.05, ease: "power1.out" });
      return tl;
    },

    /**
     * Studio Card entrance with 3D perspective pitch and soft landing
     */
    cardEnter(target, { fromY = 120, duration = 0.8, delay = 0, ease = "power4.out" } = {}) {
      if (!window.gsap) return;
      return gsap.fromTo(
        target,
        {
          opacity: 0,
          y: fromY,
          rotationX: 10,
          scale: 0.94
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: duration,
          delay: delay,
          ease: ease,
          transformOrigin: "center bottom"
        }
      );
    },

    /**
     * Pop in an element (badge, button, icon) with elastic overshoot
     */
    popIn(target, { duration = 0.5, delay = 0, overshoot = 1.4 } = {}) {
      if (!window.gsap) return;
      return gsap.fromTo(
        target,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: duration,
          delay: delay,
          ease: `back.out(${overshoot})`,
          transformOrigin: "center center"
        }
      );
    },

    /**
     * Staggered text elements entrance
     */
    staggerUp(targets, { fromY = 40, stagger = 0.08, duration = 0.6, delay = 0 } = {}) {
      if (!window.gsap) return;
      return gsap.fromTo(
        targets,
        { opacity: 0, y: fromY },
        {
          opacity: 1,
          y: 0,
          stagger: stagger,
          duration: duration,
          delay: delay,
          ease: "power3.out"
        }
      );
    },

    /**
     * Smooth animated numerical counter
     */
    animateCounter(element, { endVal, duration = 1.5, delay = 0, prefix = "", suffix = "", decimals = 0 } = {}) {
      if (!window.gsap || !element) return;
      const obj = { val: 0 };
      return gsap.to(obj, {
        val: endVal,
        duration: duration,
        delay: delay,
        ease: "power2.out",
        onUpdate: () => {
          element.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
        }
      });
    }
  };

  global.StudioMotion = StudioMotion;
})(typeof window !== "undefined" ? window : globalThis);

