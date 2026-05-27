import { getContext, setContext } from 'svelte';

const KEY = Symbol('careerModal');

export type CareerModalControls = {
	open: () => void;
};

export function setCareerModalControls(v: CareerModalControls): void {
	setContext(KEY, v);
}

export function getCareerModalControls(): CareerModalControls | undefined {
	return getContext(KEY);
}
