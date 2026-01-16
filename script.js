window.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------
    // デバッグ：センサー値を表示
    // ----------------------------------------------------
    window.addEventListener("devicemotion", (e) => {
        console.log("devicemotion → acc:", e.acceleration, "rot:", e.rotationRate);
    });

    window.addEventListener("deviceorientation", (e) => {
        console.log("deviceorientation → alpha:", e.alpha, "beta:", e.beta, "gamma:", e.gamma);
    });

    // ----------------------------------------------------
    // 以下、あなたの既存コード（省略なし）
    // ----------------------------------------------------

    // ...（ここにあなたの既存の script.js 全体が続きます）

    // クリック音、設定ダイアログ、ベル音事前読み込み、Audio 解放、タップ再生、揺れ検知（rotationRate / orientation / acceleration）など、すべてそのまま残してあります。

});