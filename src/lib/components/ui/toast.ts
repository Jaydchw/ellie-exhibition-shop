export type ToastKind = 'success' | 'error';
export type ToastMessage = { message: string; kind: ToastKind };
export const toastEvent = 'seal:toast';

export function toast(message: string, kind: ToastKind = 'success') {
	if (typeof window !== 'undefined')
		window.dispatchEvent(new CustomEvent<ToastMessage>(toastEvent, { detail: { message, kind } }));
}
