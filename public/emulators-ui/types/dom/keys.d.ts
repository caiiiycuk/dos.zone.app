export declare const KBD_NONE = 0;
export declare const KBD_0 = 48;
export declare const KBD_1 = 49;
export declare const KBD_2 = 50;
export declare const KBD_3 = 51;
export declare const KBD_4 = 52;
export declare const KBD_5 = 53;
export declare const KBD_6 = 54;
export declare const KBD_7 = 55;
export declare const KBD_8 = 56;
export declare const KBD_9 = 57;
export declare const KBD_a = 65;
export declare const KBD_b = 66;
export declare const KBD_c = 67;
export declare const KBD_d = 68;
export declare const KBD_e = 69;
export declare const KBD_f = 70;
export declare const KBD_g = 71;
export declare const KBD_h = 72;
export declare const KBD_i = 73;
export declare const KBD_j = 74;
export declare const KBD_k = 75;
export declare const KBD_l = 76;
export declare const KBD_m = 77;
export declare const KBD_n = 78;
export declare const KBD_o = 79;
export declare const KBD_p = 80;
export declare const KBD_q = 81;
export declare const KBD_r = 82;
export declare const KBD_s = 83;
export declare const KBD_t = 84;
export declare const KBD_u = 85;
export declare const KBD_v = 86;
export declare const KBD_w = 87;
export declare const KBD_x = 88;
export declare const KBD_y = 89;
export declare const KBD_z = 90;
export declare const KBD_f1 = 290;
export declare const KBD_f2 = 291;
export declare const KBD_f3 = 292;
export declare const KBD_f4 = 293;
export declare const KBD_f5 = 294;
export declare const KBD_f6 = 295;
export declare const KBD_f7 = 296;
export declare const KBD_f8 = 297;
export declare const KBD_f9 = 298;
export declare const KBD_f10 = 299;
export declare const KBD_f11 = 300;
export declare const KBD_f12 = 301;
export declare const KBD_kp0 = 320;
export declare const KBD_kp1 = 321;
export declare const KBD_kp2 = 322;
export declare const KBD_kp3 = 323;
export declare const KBD_kp4 = 324;
export declare const KBD_kp5 = 325;
export declare const KBD_kp6 = 326;
export declare const KBD_kp7 = 327;
export declare const KBD_kp8 = 328;
export declare const KBD_kp9 = 329;
export declare const KBD_kpperiod = 330;
export declare const KBD_kpdivide = 331;
export declare const KBD_kpmultiply = 332;
export declare const KBD_kpminus = 333;
export declare const KBD_kpplus = 334;
export declare const KBD_kpenter = 335;
export declare const KBD_esc = 256;
export declare const KBD_tab = 258;
export declare const KBD_backspace = 259;
export declare const KBD_enter = 257;
export declare const KBD_space = 32;
export declare const KBD_leftalt = 342;
export declare const KBD_rightalt = 346;
export declare const KBD_leftctrl = 341;
export declare const KBD_rightctrl = 345;
export declare const KBD_leftshift = 340;
export declare const KBD_rightshift = 344;
export declare const KBD_capslock = 280;
export declare const KBD_scrolllock = 281;
export declare const KBD_numlock = 282;
export declare const KBD_grave = 96;
export declare const KBD_minus = 45;
export declare const KBD_equals = 61;
export declare const KBD_backslash = 92;
export declare const KBD_leftbracket = 91;
export declare const KBD_rightbracket = 93;
export declare const KBD_semicolon = 59;
export declare const KBD_quote = 39;
export declare const KBD_period = 46;
export declare const KBD_comma = 44;
export declare const KBD_slash = 47;
export declare const KBD_printscreen = 283;
export declare const KBD_pause = 284;
export declare const KBD_insert = 260;
export declare const KBD_home = 268;
export declare const KBD_pageup = 266;
export declare const KBD_delete = 261;
export declare const KBD_end = 269;
export declare const KBD_pagedown = 267;
export declare const KBD_left = 263;
export declare const KBD_up = 265;
export declare const KBD_down = 264;
export declare const KBD_right = 262;
export declare const KBD_extra_lt_gt = 348;
export declare const domToKeyCodes: {
    [index: number]: number;
};
export declare const namedKeyCodes: {
    [name: string]: number;
};
export declare const keyCodesToDom: {
    [index: number]: number;
};
export declare function domToKeyCode(domCode: number): number;
