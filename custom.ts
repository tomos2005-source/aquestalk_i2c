// ==========================================
// カテゴリ1: AquesTalk (音声合成)
// ==========================================
//% weight=100 color=#2699FB icon="\uf028" block="AquesTalk"
namespace aquestalk {

    const I2C_ADDR = 46;

    //% block="しゃべる %text"
    //% text.defl="ohayou"
    export function say(text: string): void {
        sendText(text);
    }

    //% block="数字を1つずつ読む %num"
    //% num.defl=3.14
    export function sayNumber(num: number): void {
        sendText("<NUM VAL=" + num + ">");
    }

    //% block="数字を桁付きで読む %num"
    //% num.defl=1234
    export function sayNumberDigits(num: number): void {
        sendText("<NUMK VAL=" + num + ">");
    }

    //% block="アルファベットを読む %text"
    //% text.defl="AT-3568P"
    export function sayAlpha(text: string): void {
        sendText("<ALPHA VAL=" + text + ">");
    }

    //% block="つなげて喋る(1つずつ) 前 %text1 数字 %num 後 %text2"
    //% text1.defl="korewa"
    //% num.defl=123
    //% text2.defl="desu"
    export function sayNumberCombined(text1: string, num: number, text2: string): void {
        let fullText = text1 + ",<NUM VAL=" + num + ">," + text2;
        sendText(fullText);
    }

    //% block="つなげて喋る(桁付き) 前 %text1 数字 %num 後 %text2"
    //% text1.defl="gonokoudaiga"
    //% num.defl=321
    //% text2.defl="yen"
    export function sayDigitsCombined(text1: string, num: number, text2: string): void {
        let fullText2 = text1 + ",<NUMK VAL=" + num + ">," + text2;
        sendText(fullText2);
    }

    //% block="単位付きでつなげて喋る 前 %text1 数字 %num 単位 %counter 後 %text2"
    //% text1.defl="ringoga"
    //% num.defl=3
    //% counter.defl="ko"
    //% text2.defl="arimasu"
    export function sayDigitsCounterCombined(text1: string, num: number, counter: string, text2: string): void {
        let fullText3 = text1 + "<NUMK VAL=" + num + " COUNTER=" + counter + ">" + text2;
        sendText(fullText3);
    }

    //% block="数字(1つずつ) %num"
    //% num.defl=123
    export function numSymbol(num: number): string {
        return "<NUM VAL=" + num + ">";
    }

    //% block="数字(桁付き) %num"
    //% num.defl=123
    export function numkSymbol(num: number): string {
        return "<NUMK VAL=" + num + ">";
    }

    //% block="声を変えてしゃべる %text 速さ %speed 高さ %pitch 音量 %volume"
    //% text.defl="ohayou"
    //% speed.min=50 speed.max=300 speed.defl=100
    //% pitch.min=50 pitch.max=200 pitch.defl=100
    //% volume.min=0 volume.max=100 volume.defl=100
    export function sayWithSettings(text: string, speed: number, pitch: number, volume: number): void {
        let tags = "<SPD VAL=" + speed + "><PITCH VAL=" + pitch + "><VOL VAL=" + volume + ">";
        sendText(tags + text);
    }

    //% block="おしゃべり中"
    export function isBusy(): boolean {
        let buf = pins.i2cReadBuffer(I2C_ADDR, 1);
        if (buf.length > 0) {
            let status = buf.getNumber(NumberFormat.UInt8LE, 0);
            return status != 62;
        }
        return false;
    }

    //% block="話し終わるまで待つ"
    export function waitUntilDone(): void {
        while (isBusy()) {
            basic.pause(50);
        }
    }

    //% block="声を止める"
    export function stop(): void {
        let stopBuf = pins.createBuffer(1);
        stopBuf.setNumber(NumberFormat.UInt8LE, 0, 62);
        pins.i2cWriteBuffer(I2C_ADDR, stopBuf);
    }

    function sendText(text: string): void {
        let buf2 = pins.createBuffer(text.length + 1);
        for (let i = 0; i < text.length; i++) {
            buf2.setNumber(NumberFormat.Int8LE, i, text.charCodeAt(i));
        }
        buf2.setNumber(NumberFormat.Int8LE, text.length, 13);
        pins.i2cWriteBuffer(I2C_ADDR, buf2);
        basic.pause(20);
    }
}


// ==========================================
// カテゴリ2: BME280 (環境センサー)
// ==========================================
//% weight=90 color=#70c0f0 icon="\uf042" block="BME280"
namespace BME280 {

    export enum BME280_I2C_ADDRESS {
        //% block="0x76"
        ADDR_0x76 = 0x76,
        //% block="0x77"
        ADDR_0x77 = 0x77
    }

    export enum BME280_T {
        //% block="℃"
        T_C = 0,
        //% block="℉"
        T_F = 1
    }

    export enum BME280_P {
        //% block="hPa"
        hPa = 1,
        //% block="Pa"
        Pa = 0
    }

    export enum BME280_DIGIT {
        //% block="整数"
        Integer = 0,
        //% block="小数点第2位まで"
        Decimal = 1
    }

    let BME280_I2C_ADDR = 118;

    function setreg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf.setNumber(NumberFormat.UInt8LE, 0, reg);
        buf.setNumber(NumberFormat.UInt8LE, 1, dat);
        pins.i2cWriteBuffer(BME280_I2C_ADDR, buf);
    }

    function getreg(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt8BE);
    }

    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int8LE);
    }

    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt16LE);
    }

    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int16LE);
    }

    let T_hundredths = 0;
    let P_pa = 0;
    let H_hundredths = 0;
    let isInitialized = false;

    let dig_T1 = 0; let dig_T2 = 0; let dig_T3 = 0;
    let dig_P1 = 0; let dig_P2 = 0; let dig_P3 = 0;
    let dig_P4 = 0; let dig_P5 = 0; let dig_P6 = 0;
    let dig_P7 = 0; let dig_P8 = 0; let dig_P9 = 0;
    let dig_H1 = 0; let dig_H2 = 0; let dig_H3 = 0;
    let dig_H4 = 0; let dig_H5 = 0; let dig_H6 = 0;

    function init(): void {
        if (isInitialized) return;
        dig_T1 = getUInt16LE(0x88);
        dig_T2 = getInt16LE(0x8A);
        dig_T3 = getInt16LE(0x8C);
        dig_P1 = getUInt16LE(0x8E);
        dig_P2 = getInt16LE(0x90);
        dig_P3 = getInt16LE(0x92);
        dig_P4 = getInt16LE(0x94);
        dig_P5 = getInt16LE(0x96);
        dig_P6 = getInt16LE(0x98);
        dig_P7 = getInt16LE(0x9A);
        dig_P8 = getInt16LE(0x9C);
        dig_P9 = getInt16LE(0x9E);
        dig_H1 = getreg(0xA1);
        dig_H2 = getInt16LE(0xE1);
        dig_H3 = getreg(0xE3);
        let a = getreg(0xE5);
        dig_H4 = (getreg(0xE4) << 4) + (a % 16);
        dig_H5 = (getreg(0xE6) << 4) + (Math.idiv(a, 16));
        dig_H6 = getInt8LE(0xE7);
        setreg(0xF2, 0x04);
        setreg(0xF4, 0x2F);
        setreg(0xF5, 0x0C);
        isInitialized = true;
    }

    function get(): void {
        init();
        let adc_T = (getreg(0xFA) << 12) + (getreg(0xFB) << 4) + (getreg(0xFC) >> 4);
        let var1 = (((adc_T >> 3) - (dig_T1 << 1)) * dig_T2) >> 11;
        let var2 = (((((adc_T >> 4) - dig_T1) * ((adc_T >> 4) - dig_T1)) >> 12) * dig_T3) >> 14;
        let t = var1 + var2;
        T_hundredths = (t * 5 + 128) >> 8;
        
        var1 = (t >> 1) - 64000;
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * dig_P6;
        var2 = var2 + ((var1 * dig_P5) << 1);
        var2 = (var2 >> 2) + (dig_P4 << 16);
        var1 = (((dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((dig_P2) * var1) >> 1)) >> 18;
        var1 = ((32768 + var1) * dig_P1) >> 15;
        if (var1 == 0) return;
        
        let adc_P = (getreg(0xF7) << 12) + (getreg(0xF8) << 4) + (getreg(0xF9) >> 4);
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125;
        _p = Math.idiv(_p, var1) * 2;
        var1 = (dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12;
        var2 = (((_p >> 2)) * dig_P8) >> 13;
        P_pa = _p + ((var1 + var2 + dig_P7) >> 4);
        
        let adc_H = (getreg(0xFD) << 8) + getreg(0xFE);
        var1 = t - 76800;
        var2 = (((adc_H << 14) - (dig_H4 << 20) - (dig_H5 * var1)) + 16384) >> 15;
        var1 = var2 * (((((((var1 * dig_H6) >> 10) * (((var1 * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 + 8192) >> 14);
        var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * dig_H1) >> 4);
        if (var2 < 0) var2 = 0;
        if (var2 > 419430400) var2 = 419430400;
        H_hundredths = Math.idiv((var2 >> 12) * 100, 1024);
    }

    /**
     * 気圧を取得します
     */
    //% block="気圧 %u 精度 %d"
    //% u.defl=BME280_P.hPa
    //% d.defl=BME280_DIGIT.Integer
    export function pressure(u: BME280_P = BME280_P.hPa, d: BME280_DIGIT = BME280_DIGIT.Integer): number {
        get();
        let val = (u == BME280_P.Pa) ? P_pa : (P_pa / 100);
        if (d == BME280_DIGIT.Decimal) {
            return Math.round(val * 100) / 100;
        } else {
            return Math.round(val);
        }
    }

    /**
     * 温度を取得します
     */
    //% block="温度 %u 精度 %d"
    //% u.defl=BME280_T.T_C
    //% d.defl=BME280_DIGIT.Integer
    export function temperature(u: BME280_T = BME280_T.T_C, d: BME280_DIGIT = BME280_DIGIT.Integer): number {
        get();
        let tempC = T_hundredths / 100;
        let val = (u == BME280_T.T_C) ? tempC : (32 + tempC * 1.8);
        if (d == BME280_DIGIT.Decimal) {
            return Math.round(val * 100) / 100;
        } else {
            return Math.round(val);
        }
    }

    /**
     * 湿度を取得します
     */
    //% block="湿度 精度 %d"
    //% d.defl=BME280_DIGIT.Integer
    export function humidity(d: BME280_DIGIT = BME280_DIGIT.Integer): number {
        get();
        let val = H_hundredths / 100;
        if (d == BME280_DIGIT.Decimal) {
            return Math.round(val * 100) / 100;
        } else {
            return Math.round(val);
        }
    }

    /**
     * 電源を入れます
     */
    //% block="Power On"
    export function PowerOn(): void {
        setreg(0xF4, 0x2F);
    }

    /**
     * 電源を切ります
     */
    //% block="Power Off"
    export function PowerOff(): void {
        setreg(0xF4, 0);
    }

    /**
     * 露点を計算します
     */
    //% block="露点 精度 %d"
    //% d.defl=BME280_DIGIT.Integer
    export function Dewpoint(d: BME280_DIGIT = BME280_DIGIT.Integer): number {
        get();
        let tempC = T_hundredths / 100;
        let hum = H_hundredths / 100;
        let dp = tempC - ((100 - hum) / 5);
        if (d == BME280_DIGIT.Decimal) {
            return Math.round(dp * 100) / 100;
        } else {
            return Math.round(dp);
        }
    }

    /**
     * I2Cアドレスを設定します
     */
    //% block="アドレスを %addr に設定"
    export function Address(addr: BME280_I2C_ADDRESS): void {
        BME280_I2C_ADDR = addr;
    }
}


// ==========================================
// カテゴリ3: BH1750 (照度センサー)
// ==========================================
//% weight=80 color=#E67E22 icon="\uf185" block="BH1750"
namespace BH1750 {

    export enum BH1750_I2C_ADDRESS {
        //% block="0x23"
        ADDR_0x23 = 0x23,
        //% block="0x5C"
        ADDR_0x5C = 0x5C
    }

    export enum BH1750_DIGIT {
        //% block="整数"
        Integer = 0,
        //% block="小数点第2位まで"
        Decimal = 1
    }

    let BH1750_I2C_ADDR = 35; // 0x23

    /**
     * 照度 (lx: ルクス) を取得します
     */
    //% block="照度(lx) 精度 %d"
    //% d.defl=BH1750_DIGIT.Integer
    export function lux(d: BH1750_DIGIT = BH1750_DIGIT.Integer): number {
        // Continuous High Resolution Mode (0x10) を送信
        pins.i2cWriteNumber(BH1750_I2C_ADDR, 0x10, NumberFormat.UInt8BE);
        basic.pause(120);
        let raw = pins.i2cReadNumber(BH1750_I2C_ADDR, NumberFormat.UInt16BE);
        let val = raw / 1.2;
        if (d == BH1750_DIGIT.Decimal) {
            return Math.round(val * 100) / 100;
        } else {
            return Math.round(val);
        }
    }

    /**
     * I2Cアドレスを設定します（標準: 0x23）
     */
    //% block="アドレスを %addr に設定"
    export function Address(addr: BH1750_I2C_ADDRESS): void {
        BH1750_I2C_ADDR = addr;
    }
}
