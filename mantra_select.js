window.addEventListener("DOMContentLoaded", () => {
    // 戻るボタン
    const back = document.getElementById("back");
    if (back) {
        back.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // リスト読み込み
    loadList();
});

// リスト読み込み
async function loadList() {
    try {
        const shortRes = await fetch("mantra.json");
        const longRes = await fetch("mantra_long.json");

        const shortList = await shortRes.json();
        const longList = await longRes.json();

        const list = document.getElementById("list");
        if (!list) return;

        // 真言
        const sTitle = document.createElement("div");
        sTitle.className = "section-title";
        sTitle.textContent = "真言";
        list.appendChild(sTitle);

        shortList.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";
            div.textContent = item.name;
            div.addEventListener("click", () => {
                window.location.href = `mantra.html?name=${encodeURIComponent(item.name)}`;
            });
            list.appendChild(div);
        });

        // 経文・祝詞
        const lTitle = document.createElement("div");
        lTitle.className = "section-title";
        lTitle.textContent = "経文・祝詞";
        list.appendChild(lTitle);

        longList.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";
            div.textContent = item.name;
            div.addEventListener("click", () => {
                window.location.href = `mantra.html?name=${encodeURIComponent(item.name)}`;
            });
            list.appendChild(div);
        });
    } catch (e) {
        console.error(e);
    }
}