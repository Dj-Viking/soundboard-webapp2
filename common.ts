export const WS_PORT = 6970;
export function getRandomId() {
    return (Math.random() * 10000).toString();
}
export const BUTTON_DIM = 50;
export const ADD_BUTTON_DIM = 30;
export const SOUNDBOARD_DIM = 500;
const COLORS =  ["red", "magenta", "green", "blue"] as const;
export function getRandomColor(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}