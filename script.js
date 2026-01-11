window.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------
    // ボタン取得
    // ----------------------------------------------------
    const btnTin = document.getElementById("btnTin");
    const btnBowl = document.getElementById("btnBowl");
    const btnKyouten = document.getElementById("btnKyouten");
    const btnSettings = document.getElementById("btnSettings");

    const overlay = document.getElementById("settingsOverlay");

    const tvSensitivityValue = document.getElementById("tvSensitivityValue");
    const btnPlus = document.getElementById("btnPlus");
    const btnMinus = document.getElementById("btnMinus");

    const btnSmall = document.getElementById("btnSmall");
    const btnMedium = document.getElementById("btnMedium");
    const btnLarge = document.getElementById("btnLarge");

    const btnOk = document.getElementById("btnOk");
    const btnCancel = document.getElementById("btnCancel");

    // ----------------------------------------------------
    // 設定値
    // ----------------------------------------------------
    let shakeThreshold = Number(localStorage.getItem("shakeThreshold") || 12);
    let mantraSize = localStorage.getItem("mantraSize") || "medium";

    tvSensitivityValue.textContent = shakeThreshold;

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
    // iPhone：最初のタップでセンサー許可
    // ----------------------------------------------------
    let iosPermissionRequested = false;

    document.body.addEventListener("touchstart", async () => {
        if (iosPermissionRequested) return;

        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {
            try {
                await DeviceMotionEvent.requestPermission();
            } catch (e) {}
        }

        iosPermissionRequested = true;
    }, { once: true });

    // ----------------------------------------------------
    // クリック音（事前生成）
    // ----------------------------------------------------
    const audioTin = new Audio("tin.mp3");
    const audioBowl = new Audio("bowl.mp3");

    if (btnTin) {
        btnTin.addEventListener("click", () => {
            audioTin.currentTime = 0;
            audioTin.play();
        });
    }

    if (btnBowl) {
        btnBowl.addEventListener("click", () => {
            audioBowl.currentTime = 0;
            audioBowl.play();
        });
    }

    if (btnKyouten) {
        btnKyouten.addEventListener("click", () => {
            window.location.href = "mantra_select.html";
        });
    }

    // ----------------------------------------------------
    // 設定ダイアログ
    // ----------------------------------------------------
    if (btnSettings) {
        btnSettings.addEventListener("click", () => {
            overlay.style.display = "flex";
        });
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    btnPlus.addEventListener("click", () => {
        shakeThreshold++;
        tvSensitivityValue.textContent = shakeThreshold;
    });

    btnMinus.addEventListener("click", () => {
        shakeThreshold--;
        if (shakeThreshold < 1) shakeThreshold = 1;
        tvSensitivityValue.textContent = shakeThreshold;
    });

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

    btnOk.addEventListener("click", () => {
        localStorage.setItem("shakeThreshold", shakeThreshold);
        localStorage.setItem("mantraSize", mantraSize);
        overlay.style.display = "none";
    });

    btnCancel.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    // ----------------------------------------------------
    // ★ ベル音を事前読み込み（Android 二重再生対策）
    // ----------------------------------------------------
    const bellSounds = [];
    for (let i = 1; i <= 8; i++) {
        const audio = new Audio(`bell_${i}.mp3`);
        audio.preload = "auto";
        bellSounds.push(audio);
    }

    let bellLock = false; // ★ 再生ロック

    // ----------------------------------------------------
    // ★ iPhone SE 救済：画面タップで bell_1 を鳴らす
    // ----------------------------------------------------
    document.body.addEventListener("touchstart", () => {
        const audio = bellSounds[0]; // bell_1
        audio.currentTime = 0;
        audio.play();
    });

    // ----------------------------------------------------
    // ★ Android / iPhone（SE以外）向け：揺れ検知（devicemotion）
    // ----------------------------------------------------
    if (window.DeviceMotionEvent) {
        let lastMagnitude = 0;
        let shakePower = 0;

        const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const COOLDOWN = isiOS ? 350 : 150;
        const FILTER = isiOS ? 0.85 : 0.9;

        let canShake = true;

        window.addEventListener("devicemotion", (event) => {
            const acc = event.acceleration;
            if (!acc) return;

            const magnitude = Math.sqrt(
                (acc.x || 0) ** 2 +
                (acc.y || 0) ** 2 +
                (acc.z || 0) ** 2
            );

            if (lastMagnitude === 0) {
                lastMagnitude = magnitude;
                return;
            }

            const delta = magnitude - lastMagnitude;
            lastMagnitude = magnitude;

            shakePower = shakePower * FILTER + delta;

            if (!canShake) return;

            if (Math.abs(shakePower) > shakeThreshold) {
                canShake = false;
                shakePower = 0;
                lastMagnitude = 0;

                const index = Math.floor(Math.random() * 8) + 1;
                const audio = bellSounds[index - 1];

                if (!bellLock) {
                    bellLock = true;
                    audio.currentTime = 0;
                    audio.play();
                    audio.onended = () => {
                        bellLock = false;
                    };
                }

                setTimeout(() => {
                    canShake = true;
                }, COOLDOWN);
            }
        });
    }
});