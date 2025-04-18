import { useEffect, useState, useRef, RefObject } from 'react';

// Hook for fade-in animation when element is in viewport
export function useInViewAnimation(threshold = 0.1): [RefObject<HTMLDivElement>, boolean] {
	const ref = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);

		const currentRef = ref.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [threshold]);

	return [ref, isInView];
}

// Staggered animation for lists of items
export function useStaggeredAnimation(itemCount: number, delay = 50): Record<number, { animationDelay: string }> {
	const styles: Record<number, { animationDelay: string }> = {};

	for (let i = 0; i < itemCount; i++) {
		styles[i] = {
			animationDelay: `${i * delay}ms`,
		};
	}

	return styles;
}

// Page transition animation
export function usePageTransition(): { isAnimating: boolean; animationClass: string } {
	const [isAnimating, setIsAnimating] = useState(true);
	const [animationClass, setAnimationClass] = useState('animate-fade-in');

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsAnimating(false);
		}, 600);

		return () => clearTimeout(timer);
	}, []);

	return { isAnimating, animationClass };
}
