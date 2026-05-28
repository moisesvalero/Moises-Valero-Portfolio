import { getContext, setContext } from 'svelte';

const CV_MODAL_CONTEXT = Symbol('cv-modal-controls');

export type CvModalControls = {
	open: () => void;
};

export function setCvModalControls(controls: CvModalControls) {
	setContext(CV_MODAL_CONTEXT, controls);
}

export function getCvModalControls() {
	return getContext<CvModalControls | undefined>(CV_MODAL_CONTEXT);
}
