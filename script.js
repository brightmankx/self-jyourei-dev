window.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------
    // 要素取得
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
    // 設定値（感度・文字サイズ）
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
    // iOS：最初のタップでセンサー許可
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
    // ティンシャ・おりん
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
    // ベル音を事前読み込み
    // ----------------------------------------------------
    const bellSounds = [];
    for (let i = 1; i <= 8; i++) {
        const audio = new Audio(`bell_${i}.mp3`);
        audio.preload = "auto";
        bellSounds.push(audio);
    }

    // ----------------------------------------------------
    // 最初のタップで Audio ロック解除
    // ----------------------------------------------------
    let audioUnlocked = false;

    document.body.addEventListener("touchstart", () => {
        if (!audioUnlocked) {
            bellSounds[0].play().catch(() => {});
            audioUnlocked = true;
        }
    }, { once: true });

    // ----------------------------------------------------
    // タップで bell_1〜8 をランダム再生（重ねて鳴る）
    // ----------------------------------------------------
    document.body.addEventListener("touchstart", (e) => {
        const ignoreIds = ["btnTin", "btnBowl", "btnKyouten", "btnSettings"];
        if (ignoreIds.includes(e.target.id)) return;

        const index = Math.floor(Math.random() * bellSounds.length);
        const audio = bellSounds[index].cloneNode();
        audio.play();
    });

    // ----------------------------------------------------
    // ★ ハイブリッド方式（蓄積 × 方向転換）＋ クールタイム250ms
    // ----------------------------------------------------
    if (window.DeviceMotionEvent) {

        let accelCurrent = 0;
        let accelLast = 0;
        let shake = 0;

        let lastDelta = 0;
        let lastBellTime = 0;

        const coolTime = 150;

        window.addEventListener("devicemotion", (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;

            const x = acc.x;

            // 初期化
            if (accelLast === 0 && accelCurrent === 0) {
                accelLast = x;
                accelCurrent = x;
                return;
            }

            accelLast = accelCurrent;
            accelCurrent = x;

            let delta = accelCurrent - accelLast;

            // ★ iPhone は delta が小さすぎるので補正
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                delta *= 2.5;
            }

            // ★ 蓄積方式（全端末対応）
            shake = shake * 0.7 + delta;

            // ★ 方向転換（増加→減少 or 減少→増加）
            const turning = (lastDelta > 0 && delta < 0) || (lastDelta < 0 && delta > 0);

            const now = Date.now();

            if (
                turning &&                          // 方向転換
                Math.abs(shake) > shakeThreshold && // 蓄積が閾値超え
                now - lastBellTime >= coolTime      // クールタイム
            ) {
                lastBellTime = now;

                const index = Math.floor(Math.random() * 8) + 1;
                const audio = new Audio(`bell_${index}.mp3`);
                audio.play();
            }

            lastDelta = delta;
        });
    }

});