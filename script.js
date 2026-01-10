window.addEventListener("DOMContentLoaded", () => {
    const btnTin = document.getElementById("btnTin");
    const btnBowl = document.getElementById("btnBowl");
    const btnKyouten = document.getElementById("btnKyouten");
    const btnSettings = document.getElementById("btnSettings");

    const overlay = document.getElementById("settingsOverlay");

    // ▼ 設定ダイアログ内の要素
    const tvSensitivityValue = document.getElementById("tvSensitivityValue");
    const btnPlus = document.getElementById("btnPlus");
    const btnMinus = document.getElementById("btnMinus");

    const btnSmall = document.getElementById("btnSmall");
    const btnMedium = document.getElementById("btnMedium");
    const btnLarge = document.getElementById("btnLarge");

    const btnOk = document.getElementById("btnOk");
    const btnCancel = document.getElementById("btnCancel");

    // ----------------------------------------------------
    // 設定値（localStorage）
    // ----------------------------------------------------
    let shakeThreshold = Number(localStorage.getItem("shakeThreshold") || 12);
    let mantraSize = localStorage.getItem("mantraSize") || "medium";

    // UI に反映
    tvSensitivityValue.textContent = shakeThreshold;

    // ▼ 選択中のサイズボタンを強調
    function updateSizeButtons() {
        btnSmall.classList.remove("active");
        btnMedium.classList.remove("active");
        btnLarge.classList.remove("active");

        if (mantraSize === "small") btnSmall.classList.add("active");
        if (mantraSize === "medium") btnMedium.classList.add("active");
        if (mantraSize === "large") btnLarge.classList.add("active");
    }
    updateSizeButtons();

    // ----------------------------------------------------
    // iPhone用：最初のタップでモーションセンサー許可
    // ----------------------------------------------------
    async function requestIOSMotionPermission() {
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {
            try {
                await DeviceMotionEvent.requestPermission();
            } catch (e) {}
        }
    }

    // ----------------------------------------------------
    // クリック音
    // ----------------------------------------------------
    if (btnTin) {
        btnTin.addEventListener("click", async () => {
            await requestIOSMotionPermission();
            new Audio("tin.mp3").play();
        });
    }

    if (btnBowl) {
        btnBowl.addEventListener("click", async () => {
            await requestIOSMotionPermission();
            new Audio("bowl.mp3").play();
        });
    }

    if (btnKyouten) {
        btnKyouten.addEventListener("click", async () => {
            await requestIOSMotionPermission();
            window.location.href = "mantra_select.html";
        });
    }

    // ----------------------------------------------------
    // 設定ダイアログ
    // ----------------------------------------------------
    if (btnSettings) {
        btnSettings.addEventListener("click", async () => {
            await requestIOSMotionPermission();
            overlay.style.display = "flex";
        });
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    // ----------------------------------------------------
    // 感度（＋ / −）
    // ----------------------------------------------------
    btnPlus.addEventListener("click", () => {
        shakeThreshold++;
        tvSensitivityValue.textContent = shakeThreshold;
    });

    btnMinus.addEventListener("click", () => {
        shakeThreshold--;
        if (shakeThreshold < 1) shakeThreshold = 1;
        tvSensitivityValue.textContent = shakeThreshold;
    });

    // ----------------------------------------------------
    // 文字サイズ（小 / 中 / 大）
    // ----------------------------------------------------
    btnSmall.addEventListener("click", () => {
        mantraSize = "small";
        updateSizeButtons();
    });

    btnMedium.addEventListener("click", () => {
        mantraSize = "medium";
        updateSizeButtons();
    });

    btnLarge.addEventListener("click", () => {
        mantraSize = "large";
        updateSizeButtons();
    });

    // ----------------------------------------------------
    // OK → 保存
    // ----------------------------------------------------
    btnOk.addEventListener("click", () => {
        localStorage.setItem("shakeThreshold", shakeThreshold);
        localStorage.setItem("mantraSize", mantraSize);
        overlay.style.display = "none";
    });

    // ----------------------------------------------------
    // キャンセル
    // ----------------------------------------------------
    btnCancel.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    // ----------------------------------------------------
    // 振って鳴らすロジック
    // ----------------------------------------------------
    if (window.DeviceMotionEvent) {
        let accelCurrent = 0;
        let accelLast = 0;
        let shake = 0;

        let lastBellTime = 0;
        const coolTime = 100;

        window.addEventListener("devicemotion", (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;

            const x = acc.x;

            if (accelLast === 0 && accelCurrent === 0) {
                accelLast = x;
                accelCurrent = x;
                return;
            }

            accelLast = accelCurrent;
            accelCurrent = x;

            const delta = accelCurrent - accelLast;

            shake = shake * 0.9 + delta;

            const now = Date.now();
            if (now - lastBellTime < coolTime) return;

            if (shake < -shakeThreshold) {
                lastBellTime = now;

                const index = Math.floor(Math.random() * 3) + 1;
                new Audio(`bell_${index}.mp3`).play();
            }
        });
    }
});