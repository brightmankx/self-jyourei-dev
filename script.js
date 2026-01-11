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
    // ★ ベル音を事前読み込み
    // ----------------------------------------------------
    const bellSounds = [];
    for (let i = 1; i <= 8; i++) {
        const audio = new Audio(`bell_${i}.mp3`);
        audio.preload = "auto";
        bellSounds.push(audio);
    }

    let bellLock = false;

    // ----------------------------------------------------
    // ★ 最初のタップで Audio ロック解除（全端末）
    // ----------------------------------------------------
    let audioUnlocked = false;

    document.body.addEventListener("touchstart", () => {
        if (!audioUnlocked) {
            bellSounds[0].play().catch(()=>{});
            audioUnlocked = true;
        }
    }, { once: true });

    // ----------------------------------------------------
    // ★ 全端末：タップで bell_1〜8 をランダム再生
    // ----------------------------------------------------
    document.body.addEventListener("touchstart", (e) => {
        const ignoreIds = ["btnTin", "btnBowl", "btnKyouten", "btnSettings"];
        if (ignoreIds.includes(e.target.id)) return;

        const index = Math.floor(Math.random() * 8);
        const audio = bellSounds[index];
        const clone = audio.cloneNode();
        clone.play();
    });

    // ----------------------------------------------------
    // ★ 4段階フォールバック：揺れ検知
    // ----------------------------------------------------
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIPhoneSE = /iPhone SE|iPhone8,4|iPhone12,8|iPhone14,6/.test(navigator.userAgent);

    // iPhone SE は揺れ検知しない
    if (isIPhoneSE) return;

    // 共通パラメータ
    const FILTER = 0.35;
    const COOLDOWN = 40;

    let canShake = true;

    function triggerBell() {
        if (bellLock) return;
        bellLock = true;

        const index = Math.floor(Math.random() * 8);
        const audio = bellSounds[index];

        audio.currentTime = 0;
        audio.play();
        audio.onended = () => bellLock = false;
    }

    // ----------------------------------------------------
    // ① rotationRate（最速）
    // ----------------------------------------------------
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (event) => {
            if (!event.rotationRate) return;

            const r = event.rotationRate;
            if (r.alpha === null && r.beta === null && r.gamma === null) return;

            const delta =
                Math.abs(r.alpha || 0) +
                Math.abs(r.beta || 0) +
                Math.abs(r.gamma || 0);

            if (!canShake) return;

            if (delta > shakeThreshold) {
                canShake = false;
                triggerBell();
                setTimeout(() => canShake = true, COOLDOWN);
            }
        });
    }

    // ----------------------------------------------------
    // ② deviceorientation（中速）
    // ----------------------------------------------------
    if (window.DeviceOrientationEvent) {
        let lastGamma = null;
        let lastBeta = null;
        let shakePower = 0;

        window.addEventListener("deviceorientation", (event) => {
            if (event.gamma === null || event.beta === null) return;

            if (lastGamma === null) {
                lastGamma = event.gamma;
                lastBeta = event.beta;
                return;
            }

            const deltaGamma = Math.abs(event.gamma - lastGamma);
            const deltaBeta = Math.abs(event.beta - lastBeta);

            lastGamma = event.gamma;
            lastBeta = event.beta;

            const delta = deltaGamma + deltaBeta;

            shakePower = shakePower * FILTER + delta;

            if (!canShake) return;

            if (shakePower > shakeThreshold) {
                canShake = false;
                shakePower = 0;
                triggerBell();
                setTimeout(() => canShake = true, COOLDOWN);
            }
        });
    }

    // ----------------------------------------------------
    // ③ devicemotion（加速度）
    // ----------------------------------------------------
    if (window.DeviceMotionEvent) {
        let lastMagnitude = 0;
        let shakePower = 0;

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

            const delta = Math.abs(magnitude - lastMagnitude);
            lastMagnitude = magnitude;

            shakePower = shakePower * FILTER + delta;

            if (!canShake) return;

            if (shakePower > shakeThreshold) {
                canShake = false;
                shakePower = 0;
                lastMagnitude = 0;
                triggerBell();
                setTimeout(() => canShake = true, COOLDOWN);
            }
        });
    }

});