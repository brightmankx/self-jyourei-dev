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
// ★ 正→負（方向固定）＋ 上昇→下降（方向転換）
//     → チチン完全消滅ロジック
// ----------------------------------------------------
if (window.DeviceMotionEvent) {

    let lastX = null;
    let lastDelta = 0;
    let lastBellTime = 0;

    const coolTime = 120; // 毎秒8回まで追従

    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const x = acc.x;

        if (lastX === null) {
            lastX = x;
            return;
        }

        const delta = x - lastX;
        lastX = x;

        // 感度判定
        if (Math.abs(delta) < shakeThreshold) {
            lastDelta = delta;
            return;
        }

        // ★ 上昇 → 下降 の方向転換を検出
        const turningDown = (lastDelta > 0 && delta < 0);

        // ★ 正 → 負 のゼロクロスを検出
        const zeroCross = (x < 0);

        // ★ 両方同時に成立した瞬間だけ鳴らす
        if (turningDown && zeroCross) {

            const now = Date.now();
            if (now - lastBellTime >= coolTime) {

                lastBellTime = now;

                const index = Math.floor(Math.random() * 8) + 1;
                const audio = new Audio(`bell_${index}.mp3`);
                audio.play();
            }
        }

        lastDelta = delta;
    });
}
});