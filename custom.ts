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
        let maxLoops = 600; // 50ms * 600 = 30,000ms (30秒でタイムアウト)
        
        for (let i = 0; i < maxLoops; i++) {
            let buf = pins.i2cReadBuffer(I2C_ADDR, 1);
            if (buf.length > 0) {
                let status = buf.getNumber(NumberFormat.UInt8LE, 0);
                
                if (status == 62) { 
                    // 62は '>' (待機中 / 完了)
                    break;
                } else if (status != 42) {
                    // 42は '*' (おしゃべり中)。
                    // 62でも42でもない場合はエラーを受信したと判定しLEDへ文字を表示
                    basic.showString(String.fromCharCode(status));
                    break;
                }
            }
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
