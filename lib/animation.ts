import gsap from 'gsap';

export function animateValue<T extends gsap.TweenTarget>(
  target: T,
  vars: gsap.TweenVars
) {
  return gsap.to(target, vars);
}
