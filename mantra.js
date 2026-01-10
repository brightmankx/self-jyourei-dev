// URLパラメータから真言名を取得
const params = new URLSearchParams(window.location.search);
const mantraName = params.get("name");

// グローバル状態
let lines = [];
let currentIndex = -1;

window.addEventListener("DOMContentLoaded", () => {
    // タイトルに反映
    const title = document.getElementById("title");
    if (title && mantraName) {
        title.textContent = mantraName;
    }

    // 戻るボタン
    const back = document.getElementById("back");
    if (back) {
        back.addEventListener("click", () => {
            window.location.href = "mantra_select.html";
        });
    }

    // ★ 画面全体タップ
    const tapArea = document.getElementById("tapArea");
    tapArea.addEventListener("click", onTap);

    // 本文読み込み開始
    loadText();
});

// 本文を読み込む
async function loadText() {
    try {
        const shortRes = await fetch("mantra.json");
        const longRes = await fetch("mantra_long.json");

        const shortList = await shortRes.json();
        const longList = await longRes.json();

        let found = shortList.find(item => item.name === mantraName);
        if (!found) found = longList.find(item => item.name === mantraName);

        const textContainer = document.getElementById("text");

        if (!found || !textContainer) {
            if (textContainer) {
                textContainer.textContent = "本文が見つかりません。";
            }
            return;
        }

        // 文字サイズ反映
        const size = localStorage.getItem("mantraSize") || "medium";
        textContainer.classList.remove("mantra-small", "mantra-medium", "mantra-large");
        textContainer.classList.add(`mantra-${size}`);

        lines = found.lines;
        currentIndex = -1;

        renderState();
    } catch (e) {
        console.error(e);
    }
}

// 状態に応じて描画
function renderState() {
    const container = document.getElementById("text");
    if (!container) return;

    container.innerHTML = "";

    if (!lines || lines.length === 0) return;

    // 最初の状態：1行目の最初の1文字
    if (currentIndex === -1) {
        container.appendChild(createLineElement(lines[0], "preview"));
        container.scrollTop = 0;
        return;
    }

    // 0〜currentIndex まで全文表示
    for (let i = 0; i <= currentIndex && i < lines.length; i++) {
        container.appendChild(createLineElement(lines[i], "full"));
    }

    // 次の行があればプレビュー
    const nextIndex = currentIndex + 1;
    if (nextIndex < lines.length) {
        container.appendChild(createLineElement(lines[nextIndex], "preview"));
    }

    container.scrollTop = container.scrollHeight;
}

// 行要素を作る
function createLineElement(line, mode) {
    const div = document.createElement("div");
    div.className = "line";

    if (typeof line === "object") {
        const ruby = document.createElement("ruby");
        const rb = document.createElement("rb");
        const rt = document.createElement("rt");

        rb.textContent = mode === "full" ? line.kanji : line.kanji.charAt(0);
        rt.textContent = mode === "full" ? line.yomi : line.yomi.charAt(0);

        ruby.appendChild(rb);
        ruby.appendChild(rt);
        div.appendChild(ruby);
    } else {
        div.textContent = mode === "full" ? line : line.charAt(0);
    }

    return div;
}

// タップ時の動き
function onTap(e) {
    // 戻るボタンは無視
    if (e.target.id === "back") return;

    if (!lines || lines.length === 0) return;

    if (currentIndex >= lines.length - 1) {
        currentIndex = -1;
        renderState();
        return;
    }

    currentIndex++;
    renderState();
}