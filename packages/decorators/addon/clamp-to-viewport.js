export default function clampToViewport(left, top, width, height, margin=30) {

	while (left + width > window.innerWidth - margin) left--;
	while (top + height > window.innerHeight - margin) top--;

	return { left, top };

}
